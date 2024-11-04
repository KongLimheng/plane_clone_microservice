from plane.db.models import DraftIssue, WorkspaceMember
from plane.app.serializers import WorkspaceMemberMeSerializer
from ..base import BaseAPIView
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
