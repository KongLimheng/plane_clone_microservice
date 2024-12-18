
from django.urls import path

from plane.app.views import GlobalSearchEndpoint

urlpatterns = [
    path(
        "workspaces/<str:slug>/search/",
        GlobalSearchEndpoint.as_view(),
        name="global-search",
    ),
]
