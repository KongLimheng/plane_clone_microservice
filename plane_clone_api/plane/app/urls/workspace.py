from django.urls import path
from plane.app.views import UserWorkspaceInvitationsViewSet, WorkSpaceAvailabilityCheckEndpoint, WorkSpaceViewSet


urlpatterns = [
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
]
