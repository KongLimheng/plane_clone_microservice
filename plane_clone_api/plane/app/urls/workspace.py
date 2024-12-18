from django.urls import path
from plane.app.views import (
    UserWorkspaceInvitationsViewSet,
    WorkSpaceAvailabilityCheckEndpoint,
    WorkSpaceViewSet,
    WorkspaceMemberUserEndpoint,
    WorkSpaceMemberViewSet,
    WorkspaceUserProfileStatsEndpoint,
    WorkspaceUserProfileEndpoint,
    WorkspaceUserActivityEndpoint
)


urlpatterns = [
    path(
        "workspaces/<str:slug>/user-stats/<uuid:user_id>/",
        WorkspaceUserProfileStatsEndpoint.as_view(),
        name="workspace-user-stats",
    ),

    path(
        "workspaces/<str:slug>/user-profile/<uuid:user_id>/",
        WorkspaceUserProfileEndpoint.as_view(),
        name="workspace-user-profile-page",
    ),
    path(
        "workspaces/<str:slug>/user-activity/<uuid:user_id>/",
        WorkspaceUserActivityEndpoint.as_view(),
        name="workspace-user-activity",
    ),
    path(
        "workspace-slug-check/",
        WorkSpaceAvailabilityCheckEndpoint.as_view(),
        name="workspace-availability",
    ),

    path(
        "workspaces/",
        WorkSpaceViewSet.as_view(
            {
                "get": "list",
                "post": "create",
            }
        ),
        name="workspace",
    ),
    path(
        "workspaces/<str:slug>/",
        WorkSpaceViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="workspace",
    ),
    # user workspace invitations
    path(
        "users/me/workspaces/invitations/",
        UserWorkspaceInvitationsViewSet.as_view(
            {
                "get": "list",
                "post": "create",
            },
        ),
        name="user-workspace-invitations",
    ),

    path(
        "workspaces/<str:slug>/workspace-members/me/",
        WorkspaceMemberUserEndpoint.as_view(),
        name="workspace-member-details",
    ),

    # user join workspace
    path(
        "workspaces/<str:slug>/members/",
        WorkSpaceMemberViewSet.as_view({"get": "list"}),
        name="workspace-member",
    ),
]
