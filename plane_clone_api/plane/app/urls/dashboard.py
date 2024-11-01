from django.urls import path

from plane.app.views import DashboardEndpoint

urlpatterns = [
    path(
        "workspaces/<str:slug>/dashboard/",
        DashboardEndpoint.as_view(),
        name="dashboard",
    ),
]
