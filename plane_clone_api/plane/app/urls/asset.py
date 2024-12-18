from django.urls import path

from plane.app.views import UserAssetsV2Endpoint, UserAssetsEndpoint, WorkspaceFileAssetEndpoint

urlpatterns = [
    path(
        "users/file-assets/",
        UserAssetsEndpoint.as_view(),
        name="user-file-assets",
    ),
    path(
        "users/file-assets/<str:asset_key>/",
        UserAssetsEndpoint.as_view(),
        name="user-file-assets",
    ),

    # V2 Endpoints
    path(
        "assets/v2/workspaces/<str:slug>/",
        WorkspaceFileAssetEndpoint.as_view(),
        name="workspace-file-assets",
    ),
    path(
        "assets/v2/user-assets/",
        UserAssetsV2Endpoint.as_view(),
        name="user-file-assets",
    ),
]
