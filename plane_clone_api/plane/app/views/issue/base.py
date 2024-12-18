from plane.db.models import IssueUserProperty, Issue, CycleIssue, IssueLink, FileAsset, Project, ProjectMember
from plane.app.serializers import IssueUserPropertySerializer, IssueSerializer, IssueCreateSerializer
from plane.utils.issue_filters import issue_filters
from plane.utils.order_queryset import order_issue_queryset
from plane.utils.grouper import issue_on_results
from ..base import BaseAPIView, BaseViewSet
from plane.app.permissions import allow_permission, ROLE
from rest_framework.response import Response
from rest_framework import status
from django.db.models import (
    Exists,
    F,
    Func,
    OuterRef,
    Prefetch,
    Q,
    UUIDField,
    Value,
    Subquery,
    Case,
    When,
)
from django.db.models.functions import Coalesce
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.gzip import gzip_page


class IssueUserDisplayPropertyEndpoint(BaseAPIView):
    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def get(self, req, slug, project_id):
        issue_property, _ = IssueUserProperty.objects.get_or_create(
            user=req.user, project_id=project_id
        )

        serializer = IssueUserPropertySerializer(issue_property)
        return Response(serializer.data, status=status.HTTP_200_OK)


class IssueViewSet(BaseViewSet):
    def get_serializer_class(self):
        return (
            IssueCreateSerializer if self.action in ['create', 'update', "partial_update"]
            else IssueSerializer
        )

    model = Issue
    webhook_event = 'issue'
    search_fields = ['name']

    filterset_fields = ["state__name", "assignees__id", "workspace__id"]

    def get_queryset(self):
        return (
            Issue.issue_objects.filter(
                project_id=self.kwargs.get("project_id"))
            .filter(workspace__slug=self.kwargs.get('slug'))
            .select_related("workspace", "project", "state", "parent")
            .prefetch_related("assignees", "labels", "issues_module__module")
            .annotate(
                cycle_id=Subquery(
                    CycleIssue.objects.filter(
                        issue=OuterRef("id"), deleted_at__isnull=True
                    ).values("cycle_id")[:1]
                )
            )
            .annotate(
                link_count=IssueLink.objects.filter(issue=OuterRef("id"))
                .order_by()
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            ).
            annotate(
                attachment_count=FileAsset.objects.filter(
                    issue_id=OuterRef("id"),
                    entity_type=FileAsset.EntityTypeContext.ISSUE_ATTACHMENT,
                )
                .order_by()
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            )
            .annotate(
                sub_issues_count=Issue.issue_objects.filter(
                    parent=OuterRef("id"))
                .order_by()
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            )
        ).distinct()

    @method_decorator(gzip_page)
    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, project_id):
        extra_filters = {}
        if request.GET.get("updated_at__gt", None) is not None:
            extra_filters = {
                "updated_at__gt": request.GET.get("updated_at__gt")}

        project = Project.objects.get(pk=project_id, workspace__slug=slug)
        filters = issue_filters(request.query_params, "GET")
        order_by_param = request.GET.get("order_by", "-created_at")
        issue_queryset = self.get_queryset().filter(**filters, **extra_filters)
        # Custom ordering for priority and state

        # Group by
        group_by = request.GET.get("group_by", False)
        sub_group_by = request.GET.get("sub_group_by", False)

        # Issue queryset
        issue_queryset, order_by_param = order_issue_queryset(
            issue_queryset=issue_queryset, order_by_param=order_by_param
        )
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
            issue_queryset = issue_queryset.filter(created_by=request.user)
        if group_by:
            ...

        return self.paginate(
            order_by=order_by_param,
            request=request,
            queryset=issue_queryset,
            on_results=lambda issues: issue_on_results(
                group_by=group_by,
                issues=issues,
                sub_group_by=sub_group_by
            )
        )
