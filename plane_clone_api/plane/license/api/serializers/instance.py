# Module imports
from plane.license.models import Instance
from plane.app.serializers import UserAdminLiteSerializer
from .base import BaseSerializer


class InstanceSerializer(BaseSerializer):
    primary_owner_details = UserAdminLiteSerializer(
        source="primary_owner", read_only=True
    )

    class Meta:
        model = Instance
        exclude = [
            "license_key",
        ]
        read_only_fields = [
            "id",
            "email",
            "last_checked_at",
            "is_setup_done",
        ]
