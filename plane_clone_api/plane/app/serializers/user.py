from plane.db.models import User, Profile, WorkspaceMemberInvite
from .base import BaseSerializer
from rest_framework import serializers


class UserSerializer(BaseSerializer):
    class Meta:
        model = User
        fields = [field for field in User._meta.fields if field.name != "password"]

        read_only_fields = [
            "id",
            "username",
            "mobile_number",
            "email",
            "token",
            "created_at",
            "updated_at",
            "is_superuser",
            "is_staff",
            "is_managed",
            "last_active",
            "last_login_time",
            "last_logout_time",
            "last_login_ip",
            "last_logout_ip",
            "last_login_uagent",
            "last_location",
            "last_login_medium",
            "created_location",
            "is_bot",
            "is_password_autoset",
            "is_email_verified",
            "is_active",
            "token_updated_at",
        ]

        # If the user has already filled first name or last name then he is onboarded
        def get_is_onboarded(self, obj):
            return bool(obj.first_name) or bool(obj.last_name)


class UserMeSerializer(BaseSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "avatar",
            "cover_image",
            "avatar_url",
            "cover_image_url",
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
            "last_login_medium",
        ]

        read_only_fields = fields


class UserAdminLiteSerializer(BaseSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "avatar",
            "is_bot",
            "display_name",
            "email",
        ]
        read_only_fields = [
            "id",
            "is_bot",
        ]


class ProfileSerializer(BaseSerializer):
    class Meta:
        model = Profile
        fields = "__all__"
        read_only_fields = [
            "user",
        ]


class UserMeSettingsSerializer(BaseSerializer):
    workspace = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'workspace']
        read_only_fields = fields

    def get_workspace(self, obj: User):
        workspace_invites = WorkspaceMemberInvite.objects.filter(
            email=obj.email
        ).count()

        print(workspace_invites, "===")
        return {}
