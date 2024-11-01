from django.urls import path
from plane.app.views import (
    # User
    UserEndPoint,
    ProfileEndPoint,
    UserWorkSpacesEndpoint,
    UpdateUserOnBoardedEndpoint,
    UpdateUserTourCompletedEndpoint
)

urlpatterns = [
    # User Profile
    path("users/me/",
         UserEndPoint.as_view({
             "get": 'retrieve',
             "patch": "partial_update"
         }), name='users'),

    path(
        "users/me/settings/",
        UserEndPoint.as_view(
            {
                "get": "retrieve_user_settings",
            }
        ),
        name="users",
    ),
    # Profile
    path(
        "users/me/profile/",
        ProfileEndPoint.as_view(),
        name="accounts",
    ),

    # user workspaces
    path(
        "users/me/workspaces/",
        UserWorkSpacesEndpoint.as_view(),
        name="user-workspace",
    ),

    path(
        "users/me/onboard/",
        UpdateUserOnBoardedEndpoint.as_view(),
        name="user-onboard",
    ),
    path(
        "users/me/tour-completed/",
        UpdateUserTourCompletedEndpoint.as_view(),
        name="user-tour",
    ),
]
