from django.urls import path
from plane.app.views import ExportIssuesEndpoint, IssueUserDisplayPropertyEndpoint, IssueViewSet


urlpatterns = [
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issues/",
        IssueViewSet.as_view({"get": "list", "post": "create"}),
        name="project-issue",
    ),
    # Export Issues
    path(
        "workspaces/<str:slug>/export-issues/",
        ExportIssuesEndpoint.as_view(),
        name="export-issues",
    ),

    # End Comment Reactions
    # IssueUserProperty
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/user-properties/",
        IssueUserDisplayPropertyEndpoint.as_view(),
        name="project-issue-display-properties",
    ),
]
