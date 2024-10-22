from django.urls import path

from .views import SignInAuthSpaceEndpoint, CSRFTokenEndpoint
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    # space credential
    path('space/sign-in/',
         csrf_exempt(SignInAuthSpaceEndpoint.as_view()), name='sign-in'),

    # csrf token
    path(
        "get-csrf-token/",
        CSRFTokenEndpoint.as_view(),
        name="get_csrf_token",
    ),
]
