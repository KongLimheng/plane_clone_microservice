from plane.app.serializers import UserAdminLiteSerializer
from plane.db.models import User
from plane.license.models import InstanceAdmin
from .base import BaseSerializer


class InstanceAdminMeSerializer(BaseSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "avatar",
            "cover_image",
            "date_joined",
            "display_name",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_bot",
            "is_email_verified",
            "user_timezone",
            "username",
            "is_password_autoset",
            "is_email_verified",
        ]

        read_only_fields = fields


class InstanceAdminSerializer(BaseSerializer):
    user_detail = UserAdminLiteSerializer(source="user", read_only=True)

    class Meta:
        model = InstanceAdmin
        fields = "__all__"
        read_only_fields = [
            "id",
            "instance",
            "user",
        ]
