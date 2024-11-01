from django.urls import path

from plane.authentication.views import GitHubOauthInitiateEndpoint, EmailCheckEndpoint
from plane.authentication.views import SignInAuthEndpoint
from .views import SignInAuthSpaceEndpoint, CSRFTokenEndpoint
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    # credentials
    path(
        "sign-in/",
        SignInAuthEndpoint.as_view(),
        name="sign-in",
    ),
    # space credential
    path('space/sign-in/',
         csrf_exempt(SignInAuthSpaceEndpoint.as_view()), name='sign-in'),

    # csrf token
    path(
        "get-csrf-token/",
        CSRFTokenEndpoint.as_view(),
        name="get_csrf_token",
    ),

    # Github Oauth
    path(
        "github/",
        GitHubOauthInitiateEndpoint.as_view(),
        name="github-initiate",
    ),

    # Email Check
    path(
        "email-check/",
        EmailCheckEndpoint.as_view(),
        name="email-check",
    ),
]
