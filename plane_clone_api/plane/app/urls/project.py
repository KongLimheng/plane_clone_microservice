from django.urls import path

from plane.app.views import (
    ProjectViewSet,
    UserProjectRolesEndpoint,
    DeployBoardViewSet,
    ProjectUserViewsEndpoint,
    ProjectMemberUserEndpoint,
    ProjectMemberViewSet
)


urlpatterns = [
    path(
        "workspaces/<str:slug>/projects/",
        ProjectViewSet.as_view(
            {
                "get": "list",
                "post": "create",
            }
        ),
        name="project",
    ),

    path(
        "workspaces/<str:slug>/projects/<uuid:pk>/",
        ProjectViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                # "delete": "destroy",
            }
        ),
        name="project",
    ),

    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/members/",
        ProjectMemberViewSet.as_view({"get": "list", "post": "create"}),
        name="project-member",
    ),

    path(
        "users/me/workspaces/<str:slug>/project-roles/",
        UserProjectRolesEndpoint.as_view(),
        name="user-project-roles",
    ),

    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/project-deploy-boards/",
        DeployBoardViewSet.as_view(
            {
                "get": "list",
                "post": "create",
            }
        ),
        name="project-deploy-board",
    ),

    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/project-deploy-boards/<uuid:pk>/",
        DeployBoardViewSet.as_view(
            {
                "get": "retrieve",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="project-deploy-board",
    ),

    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/project-views/",
        ProjectUserViewsEndpoint.as_view(),
        name="project-view",
    ),

    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/project-members/me/",
        ProjectMemberUserEndpoint.as_view(),
        name="project-member-view",
    ),

]
