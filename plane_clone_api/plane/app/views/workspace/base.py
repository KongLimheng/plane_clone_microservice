from django.db import IntegrityError
from plane.db.models import Workspace
from plane.app.views.base import BaseAPIView, BaseViewSet
from plane.app.serializers import WorkSpaceSerializer
from plane.app.permissions import WorkSpaceBasePermission, allow_permission, ROLE
from plane.db.models import WorkspaceMember
from django.db.models import OuterRef, Func, F, Prefetch
from rest_framework.response import Response
from rest_framework import status
from plane.utils.cache import cache_response, invalidate_cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control
from django.views.decorators.vary import vary_on_cookie
from plane.utils.constants import RESTRICTED_WORKSPACE_SLUGS


class WorkSpaceViewSet(BaseViewSet):
    model = Workspace
    serializer_class = WorkSpaceSerializer
    permission_classes = [
        WorkSpaceBasePermission
    ]
    search_fields = ["name"]
    filterset_fields = ['owner']
    lookup_field = "slug"

    def get_queryset(self):
        member_count = (
            WorkspaceMember.objects.filter(
                workspace=OuterRef('id'),
                member__is_bot=False,
                is_active=True
            )
            .order_by()
            .annotate(count=Func(F('id'), function="Count"))
            .values("count")
        )

        return (
            self.filter_queryset(
                super().get_queryset().select_related("owner"))
            .order_by("name")
            .filter(
                workspace_member__member=self.request.user,
                workspace_member__is_active=True
            )
            .annotate(total_members=member_count)
            # .annotate(total_issues=issue_count)
            .select_related("owner")
        )

    @invalidate_cache(path="/api/workspaces/", user=False)
    @invalidate_cache(path="/api/users/me/workspaces/")
    @invalidate_cache(path="/api/instances/", user=False)
    def create(self, request):
        try:
            serializer = WorkSpaceSerializer(data=request.data)
            slug = request.data.get("slug", False)
            name = request.data.get("name", False)

            if not name or not slug:
                return Response(
                    {"error": "Both name and slug are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if len(name) > 80 or len(slug) > 48:
                return Response(
                    {
                        "error": "The maximum length for name is 80 and for slug is 48"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if serializer.is_valid(raise_exception=True):
                serializer.save(owner=request.user)
                # Create Workspace member
                _ = WorkspaceMember.objects.create(
                    workspace_id=serializer.data['id'],
                    member=request.user,
                    role=20,
                    company_role=request.data.get("company_role", "")
                )

                return Response(
                    serializer.data, status=status.HTTP_201_CREATED
                )

            return Response(
                [serializer.errors[error][0] for error in serializer.errors], status=status.HTTP_400_BAD_REQUEST
            )

        except IntegrityError as e:
            if "already exists" in str(e):
                return Response(
                    {"slug": "The workspace with the slug already exists"},
                    status=status.HTTP_410_GONE,
                )

    @cache_response(60*60*2)
    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST], level="WORKSPACE")
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class UserWorkSpacesEndpoint(BaseAPIView):
    search_fields = ["name"]
    filterset_fields = ["owner"]

    @cache_response(60 * 60 * 2)
    @method_decorator(cache_control(private=True, max_age=12))
    @method_decorator(vary_on_cookie)
    def get(self, req):
        fields = [
            field for field in req.GET.get(
                "fields", "").split(",") if field
        ]

        member_count = (
            WorkspaceMember.objects.filter(
                workspace=OuterRef("id"),
                member__is_bot=False,
                is_active=True,
            )
            .order_by()
            .annotate(count=Func(F("id"), function="Count"))
            .values("count")
        )

        workspace = (
            Workspace.objects.prefetch_related(
                Prefetch("workspace_member", queryset=WorkspaceMember.objects.filter(
                    member=req.user, is_active=True))
            )
            .select_related("owner")
            .annotate(total_members=member_count)
            # .annotate(total_issues=issue_count)
            .filter(
                workspace_member__member=req.user,
                workspace_member__is_active=True,
            )
            .distinct()
        )

        workspaces = WorkSpaceSerializer(
            self.filter_queryset(workspace),
            fields=fields if fields else None,
            many=True
        ).data

        return Response(workspaces, status=status.HTTP_200_OK)


class WorkSpaceAvailabilityCheckEndpoint(BaseAPIView):
    def get(self, req):
        slug = req.GET.get("slug", False)
        if not slug or slug == "":
            return Response({"error": "Workspace Slug is required"},
                            status=status.HTTP_400_BAD_REQUEST)

        workspace = Workspace.objects.filter(
            slug=slug).exists() or slug in RESTRICTED_WORKSPACE_SLUGS
        return Response({"status": not workspace}, status=status.HTTP_200_OK)
