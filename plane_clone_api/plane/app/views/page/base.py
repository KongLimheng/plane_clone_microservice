from plane.app.views import BaseViewSet
from plane.app.serializers import PageSerializer, PageDetailSerializer
from plane.db.models import Page, ProjectPage, UserFavorite, Project, ProjectMember, PageLog
from plane.app.permissions import allow_permission, ROLE
# Third party imports
from rest_framework import status
from rest_framework.response import Response
from django.core.serializers.json import DjangoJSONEncoder
import json
import base64
from datetime import datetime
# Django imports
from django.db import connection
from django.db.models import Exists, OuterRef, Q, Value, UUIDField
from django.utils.decorators import method_decorator
from django.views.decorators.gzip import gzip_page
from django.http import StreamingHttpResponse
from django.contrib.postgres.aggregates import ArrayAgg
from django.contrib.postgres.fields import ArrayField
from django.db.models.functions import Coalesce


class PageViewSet(BaseViewSet):
    serializer_class = PageSerializer
    model = Page
    search_fields = ['name']

    def get_queryset(self):
        subquery = UserFavorite.objects.filter(
            user=self.request.user,
            entity_type="page",
            entity_identifier=OuterRef("pk"),
            workspace__slug=self.kwargs.get("slug"),
        )
        return self.filter_queryset(
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(
                projects__project_projectmember__member=self.request.user,
                projects__project_projectmember__is_active=True,
                projects__archived_at__isnull=True,
            )
            .filter(parent__isnull=True)
            .filter(Q(owned_by=self.request.user) | Q(access=0))
            .prefetch_related("projects")
            .select_related("workspace")
            .select_related("owned_by")
            .annotate(is_favorite=Exists(subquery))
            .order_by(self.request.GET.get("order_by", "-created_at"))
            .prefetch_related("labels")
            .order_by("-is_favorite", "-created_at")
            .annotate(
                project=Exists(
                    ProjectPage.objects.filter(
                        page_id=OuterRef("id"), project_id=self.kwargs.get("project_id")
                    )
                )
            )
            .annotate(
                label_ids=Coalesce(
                    ArrayAgg(
                        "page_labels__label_id",
                        distinct=True,
                        filter=~Q(page_labels__label_id__isnull=True),
                    ),
                    Value([], output_field=ArrayField(UUIDField())),
                ),
                project_ids=Coalesce(
                    ArrayAgg(
                        "projects__id", distinct=True, filter=~Q(projects__id=True)
                    ),
                    Value([], output_field=ArrayField(UUIDField())),
                ),
            )
            .filter(project=True)
            .distinct()
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def create(self, request, slug, project_id):
        serializer = PageSerializer(
            data=request.data,
            context={
                "project_id": project_id,
                "owned_by_id": request.user.id,
                "description_html": request.data.get("description_html", "<p></p>"),
            },
        )

        if serializer.is_valid():
            serializer.save()
            # capture the page transaction
            page = self.get_queryset().get(pk=serializer.data['id'])
            serializer = PageDetailSerializer(page)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, project_id):
        queryset = self.get_queryset()
        project = Project.objects.get(pk=project_id)
        if (
                ProjectMember.objects.filter(
                    workspace__slug=slug,
                    project_id=project_id,
                    member=request.user,
                    role=5,
                    is_active=True,
                ).exists()
                and not project.guest_view_all_features
        ):
            queryset = queryset.filter(owned_by=request.user)
        pages = PageSerializer(queryset, many=True).data
        return Response(pages, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def retrieve(self, request, slug, project_id, pk=None):
        page = self.get_queryset().filter(pk=pk).first()

        print(page, 'page')
        project = Project.objects.get(pk=project_id)
        """
        if the role is guest and guest_view_all_features is false and owned by is not 
        the requesting user then dont show the page
        """
        if (
            ProjectMember.objects.filter(
                workspace__slug=slug,
                project_id=project_id,
                member=request.user,
                role=5,
                is_active=True,
            ).exists()
            and not project.guest_view_all_features
            and not page.owned_by == request.user
        ):
            return Response(
                {"error": "You are not allowed to view this page"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if page is None:
            return Response({"error": "Page not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            issue_ids = PageLog.objects.filter(
                page_id=pk, entity_name="issue"
            ).values_list("entity_identifier", flat=True)
            # issue_ids = PageLog
            data = PageDetailSerializer(page).data
            data["issue_ids"] = issue_ids
            return Response(data, status=status.HTTP_200_OK)
