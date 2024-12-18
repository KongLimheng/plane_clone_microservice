from plane.db.models import DraftIssue, WorkspaceMember
from plane.app.serializers import WorkspaceMemberMeSerializer, WorkspaceMemberAdminSerializer, WorkSpaceMemberSerializer
from plane.app.permissions import ROLE, allow_permission
from plane.utils.cache import cache_response
from ..base import BaseAPIView, BaseViewSet
from django.db.models import OuterRef, Count, Subquery, IntegerField
from django.db.models.functions import Coalesce
from rest_framework.response import Response
from rest_framework import status


class WorkspaceMemberUserEndpoint(BaseAPIView):
    def get(self, req, slug):
        draft_issue_count = (
            DraftIssue.objects.filter(
                created_by=req.user,
                workspace_id=OuterRef('workspace_id')
            )
            .values("workspace_id")
            .annotate(count=Count("id"))
            .values("count")
        )

        workspace_member = (
            WorkspaceMember.objects.filter(
                member=req.user, workspace__slug=slug, is_active=True
            ).annotate(draft_issue_count=Coalesce(
                Subquery(draft_issue_count, output_field=IntegerField()), 0
            )).first()
        )

        serializer = WorkspaceMemberMeSerializer(workspace_member)
        return Response(serializer.data, status=status.HTTP_200_OK)


class WorkSpaceMemberViewSet(BaseViewSet):
    serializer_class = WorkspaceMemberAdminSerializer
    model = WorkspaceMember

    search_fields = [
        "member__display_name",
        "member__first_name",
    ]

    def get_queryset(self):
        return self.filter_queryset(
            super().get_queryset()
            .filter(
                workspace__slug=self.kwargs.get("slug"),
                is_active=True,
            )
            .select_related("workspace", "workspace__owner")
            .select_related("member")
        )

    @allow_permission(
        allow_roles=[ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST], level="WORKSPACE"
    )
    def list(self, request, slug):
        workspace_member = WorkspaceMember.objects.get(
            member=request.user,
            workspace__slug=slug,
            is_active=True,
        )

        # Get all active workspace members
        workspace_members = self.get_queryset()
        if workspace_member.role > 5:
            serializer = WorkspaceMemberAdminSerializer(
                workspace_members,
                fields=("id", "member", "role"),
                many=True
            )
        else:
            serializer = WorkSpaceMemberSerializer(
                workspace_members,
                fields=("id", "member", "role"),
                many=True,
            )

        return Response(serializer.data, status=status.HTTP_200_OK)
