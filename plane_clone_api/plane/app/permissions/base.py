from enum import Enum
from functools import wraps
from rest_framework.response import Response
from plane.db.models import WorkspaceMember, ProjectMember
from rest_framework import status


class ROLE(Enum):
    ADMIN = 20
    MEMBER = 15
    GUEST = 5


def allow_permission(allow_roles, level="PROJECT", creator=False, model=None):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(instance, req, *args, **kwargs):
            # Check for creator if required
            if creator and model:
                obj = model.objects.filter(
                    id=kwargs["pk"], created_by=req.user
                ).exist()
                if obj:
                    return view_func(instance, req, *args, **kwargs)

            # Convert allowed_roles to their values if they are enum members
            allowed_role_values = [
                role.value if isinstance(role, ROLE) else role
                for role in allow_roles
            ]

            # Check role permissions
            if level == "WORKSPACE":
                if WorkspaceMember.objects.filter(
                    member=req.user,
                    workspace__slug=kwargs['slug'],
                    role__in=allowed_role_values,
                    is_active=True
                ).exists():
                    return view_func(instance, req, *args, **kwargs)
            else:
                if ProjectMember.objects.filter(
                    member=req.user,
                    workspace__slug=kwargs["slug"],
                    project_id=kwargs["project_id"],
                    role__in=allowed_role_values,
                    is_active=True
                ).exists():
                    return view_func(instance, req, *args, **kwargs)

            # Return permission denied if no conditions are met
            return Response(
                {"error": "You don't have the required permissions."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return _wrapped_view
    return decorator
