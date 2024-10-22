# Third party imports
from rest_framework.permissions import BasePermission

from plane.license.models import Instance, InstanceAdmin


class InstanceAdminPermission(BasePermission):
    def has_permission(self, request, view):
        print(request.user.is_anonymous)
        if request.user.is_anonymous:
            return False

        instance = Instance.objects.first()

        print(instance)
        return InstanceAdmin.objects.filter(
            role__gte=15,
            instance=instance,
            user=request.user
        ).exists()
