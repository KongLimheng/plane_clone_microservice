from django.urls import path
from plane.license.api.views import (InstanceAdminEndpoint, InstanceAdminSignInEndpoint, InstanceAdminSignUpEndpoint, InstanceAdminUserMeEndpoint,
                                     InstanceAdminUserSessionEndpoint, InstanceEndpoint, SignUpScreenVisitedEndpoint, InstanceAdminSignOutEndpoint, InstanceConfigurationEndpoint)
from django.views.decorators.csrf import csrf_exempt


urlpatterns = [
    path(
        "",
        InstanceEndpoint.as_view(),
        name="instance",
    ),

    path(
        "admins/",
        InstanceAdminEndpoint.as_view(),
        name="instance-admins",
    ),

    path(
        "admins/me/",
        InstanceAdminUserMeEndpoint.as_view(),
        name="instance-admins",
    ),
    path(
        "admins/sign-in/",
        InstanceAdminSignInEndpoint.as_view(),
        name="instance-admin-sign-in",
    ),

    path(
        "admins/sign-up/",
        InstanceAdminSignUpEndpoint.as_view(),
        name="instance-admin-sign-up",
    ),

    path(
        "admins/sign-out/",
        InstanceAdminSignOutEndpoint.as_view(),
        name="instance-admins",
    ),

    path(
        "admins/session/",
        InstanceAdminUserSessionEndpoint.as_view(),
        name="instance-admin-session",
    ),

    path(
        "configurations/",
        InstanceConfigurationEndpoint.as_view(),
        name="instance-configuration",
    ),

    path(
        "admins/sign-up-screen-visited/",
        SignUpScreenVisitedEndpoint.as_view(),
        name="instance-sign-up",
    ),
]
