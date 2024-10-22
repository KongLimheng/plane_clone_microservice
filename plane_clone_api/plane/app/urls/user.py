from django.urls import path
from plane.app.views import (
    # User
    UserEndPoint,
    ProfileEndPoint
)

urlpatterns = [
    # User Profile
    path("users/me/", UserEndPoint.as_view({
        "get": 'retrieve'
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
]
