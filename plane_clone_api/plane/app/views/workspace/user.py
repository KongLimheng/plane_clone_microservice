from plane.utils.issue_filters import issue_filters
from plane.app.permissions import WorkspaceEntityPermission
from plane.app.serializers import IssueActivitySerializer
from .base import BaseAPIView
# Python imports
from datetime import date

from dateutil.relativedelta import relativedelta

# Django imports
from django.db.models import (
    Case,
    Count,
    F,
    Func,
    IntegerField,
    OuterRef,
    Q,
    Value,
    When,
    Subquery,
)
from django.db.models.fields import DateField
from django.db.models.functions import Cast, ExtractWeek
from django.utils import timezone
# Third party modules
from rest_framework import status
from rest_framework.response import Response
from plane.db.models import Issue, User, WorkspaceMember, Project, IssueActivity


class WorkspaceUserProfileStatsEndpoint(BaseAPIView):
    def get(self, request, slug, user_id):
        filters = issue_filters(request.query_params, "GET")

        state_distribution = (
            Issue.issue_objects.filter(
                workspace__slug=slug,
                assignees__in=[user_id],
                project__project_projectmember__member=request.user,
                project__project_projectmember__is_active=True,
            )
            .filter(**filters)
            .annotate(state_group=F('state__group'))
            .values('state_group')
            .annotate(state_count=Count('state_group'))
            .order_by("state_group")
        )

        return Response(
            {
                "state_distribution": state_distribution,
                # "priority_distribution": priority_distribution,
                # "created_issues": created_issues,
                # "assigned_issues": assigned_issues_count,
                # "completed_issues": completed_issues_count,
                # "pending_issues": pending_issues_count,
                # "subscribed_issues": subscribed_issues_count,
                # "present_cycles": present_cycle,
                # "upcoming_cycles": upcoming_cycles,
            }
        )


class WorkspaceUserProfileEndpoint(BaseAPIView):
    def get(self, request, slug, user_id):
        user_data = User.objects.get(pk=user_id)

        requesting_workspace_member = WorkspaceMember.objects.get(
            workspace__slug=slug, member=request.user, is_active=True
        )

        projects = []
        if requesting_workspace_member.role >= 15:
            projects = (
                Project.objects.filter(
                    workspace__slug=slug,
                    project_projectmember__member=request.user,
                    project_projectmember__is_active=True,
                    archived_at__isnull=True,
                )
                .annotate(
                    created_issues=Count(
                        "project_issue",
                        filter=Q(
                            project_issue__created_by_id=user_id,
                            project_issue__archived_at__isnull=True,
                            project_issue__is_draft=False,
                        ),
                    )
                )
                .annotate(
                    assigned_issues=Count(
                        "project_issue",
                        filter=Q(
                            project_issue__assignees__in=[user_id],
                            project_issue__archived_at__isnull=True,
                            project_issue__is_draft=False,
                        ),
                    )
                )
                .annotate(
                    completed_issues=Count(
                        "project_issue",
                        filter=Q(
                            project_issue__completed_at__isnull=False,
                            project_issue__assignees__in=[user_id],
                            project_issue__archived_at__isnull=True,
                            project_issue__is_draft=False,
                        ),
                    )
                )
                .annotate(
                    pending_issues=Count(
                        "project_issue",
                        filter=Q(
                            project_issue__state__group__in=[
                                "backlog",
                                "unstarted",
                                "started",
                            ],
                            project_issue__assignees__in=[user_id],
                            project_issue__archived_at__isnull=True,
                            project_issue__is_draft=False,
                        ),
                    )
                )
                .values(
                    "id",
                    "logo_props",
                    "created_issues",
                    "assigned_issues",
                    "completed_issues",
                    "pending_issues",
                )
            )

        return Response(
            {
                "project_data": projects,
                "user_data": {
                    "email": user_data.email,
                    "first_name": user_data.first_name,
                    "last_name": user_data.last_name,
                    "avatar_url": user_data.avatar_url,
                    "cover_image_url": user_data.cover_image_url,
                    "date_joined": user_data.date_joined,
                    "user_timezone": user_data.user_timezone,
                    "display_name": user_data.display_name,
                },
            },
            status=status.HTTP_200_OK,
        )


class WorkspaceUserActivityEndpoint(BaseAPIView):
    permission_classes = [WorkspaceEntityPermission]

    def get(self, request, slug, user_id):
        project = request.query_params.getlist("project", [])
        queryset = IssueActivity.objects.filter(
            ~Q(field__in=["comment", "vote", "reaction", "draft"]),
            workspace__slug=slug,
            project__project_projectmember__member=request.user,
            project__project_projectmember__is_active=True,
            project__archived_at__isnull=True,
            actor=user_id,
        ).select_related('actor', "workspace", "issue", "project")

        if project:
            queryset = queryset.filter(project__in=project)

        return self.paginate(
            order_by=request.GET.get("order_by", "-created_at"),
            request=request,
            queryset=queryset,
            on_results=lambda issue_activities: IssueActivitySerializer(
                issue_activities, many=True
            ).data
        )
