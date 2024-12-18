from plane.app.permissions import WorkspaceUserPermission, ProjectLitePermission, ProjectMemberPermission
from plane.db.models import ProjectMember
from plane.app.serializers import ProjectMemberSerializer, ProjectMemberAdminSerializer, ProjectMemberRoleSerializer
from ..base import BaseAPIView, BaseViewSet

# Third Party imports
from rest_framework.response import Response
from rest_framework import status
from plane.app.permissions.base import allow_permission, ROLE


class UserProjectRolesEndpoint(BaseAPIView):
    permission_classes = [WorkspaceUserPermission]

    def get(self, req, slug):
        project_members = ProjectMember.objects.filter(
            workspace__slug=slug,
            member_id=req.user,
            is_active=True
        ).values("project_id", "role")

        project_members = {
            str(member["project_id"]): member["role"]
            for member in project_members
        }

        return Response(project_members, status=status.HTTP_200_OK)


class ProjectMemberUserEndpoint(BaseAPIView):
    def get(self, request, slug, project_id):
        project_member = ProjectMember.objects.get(
            project_id=project_id,
            workspace__slug=slug,
            member=request.user,
            is_active=True,
        )
        serializer = ProjectMemberSerializer(project_member)

        return Response(serializer.data, status=status.HTTP_200_OK)


class ProjectMemberViewSet(BaseViewSet):
    serializer_class = ProjectMemberAdminSerializer
    model = ProjectMember

    def get_permissions(self):
        if self.action == "leave":
            self.permission_classes = [ProjectLitePermission]
        else:
            self.permission_classes = [ProjectMemberPermission]

        return super(ProjectMemberViewSet, self).get_permissions()

    search_fields = ["member__display_name", "member__first_name"]

    def get_queryset(self):
        return self.filter_queryset(
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
            .filter(member__is_bot=False)
            .filter()
            .select_related("project")
            .select_related("member")
            .select_related("workspace", "workspace__owner")
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, project_id):
        # Get the list of project members for the project
        project_members = ProjectMember.objects.filter(
            project_id=project_id,
            workspace__slug=slug,
            member__is_bot=False,
            is_active=True
        ).select_related("project", "member", "workspace")

        serializer = ProjectMemberRoleSerializer(
            project_members, fields=("id", "member", "role"), many=True
        )

        return Response(serializer.data, status=status.HTTP_200_OK)
