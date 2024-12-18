from rest_framework.permissions import BasePermission, SAFE_METHODS
from plane.db.models import WorkspaceMember

# Permission Mappings
Admin = 20
Member = 15
Guest = 5
# TODO: Move the below logic to python match - python v3.10


class WorkSpaceBasePermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False
        if request.method == "POST":
            return True

        if request.method in SAFE_METHODS:
            return True

        if request.method in ["PUT", "PATCH"]:
            return WorkspaceMember.objects.filter(
                member=request.user,
                workspace__slug=view.workspace_slug,
                role__in=[Admin, Member],
                is_active=True
            ).exists()


class WorkspaceOwnerPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False

        return WorkspaceMember.objects.filter(
            workspace__slug=view.workspace_slug,
            member=request.user,
            role=Admin,
        ).exists()


class WorkspaceUserPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False

        return WorkspaceMember.objects.filter(
            member=request.user,
            workspace__slug=view.workspace_slug,
            is_active=True,
        ).exists()


class WorkspaceEntityPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False

            # Safe Methods -> Handle the filtering logic in queryset
        if request.method in SAFE_METHODS:
            return WorkspaceMember.objects.filter(
                workspace__slug=view.workspace_slug, member=request.user, is_active=True
            ).exists()

        return WorkspaceMember.objects.filter(
            member=request.user,
            workspace__slug=view.workspace_slug,
            role__in=[Admin, Member],
            is_active=True,
        ).exists()
