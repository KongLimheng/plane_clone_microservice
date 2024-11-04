from plane.app.serializers.base import BaseSerializer, DynamicBaseSerializer
from plane.db.models import Workspace, WorkspaceMemberInvite, WorkspaceMember
from plane.app.serializers import UserLiteSerializer
from rest_framework import serializers
from plane.utils.constants import RESTRICTED_WORKSPACE_SLUGS


class WorkSpaceSerializer(DynamicBaseSerializer):
    owner = UserLiteSerializer(read_only=True)
    total_members = serializers.IntegerField(read_only=True)
    total_issues = serializers.IntegerField(read_only=True)
    logo_url = serializers.CharField(read_only=True)

    def validate_slug(self, value):
        if value in RESTRICTED_WORKSPACE_SLUGS:
            raise serializers.ValidationError("Slug is not valid")
        return value

    class Meta:
        model = Workspace
        fields = "__all__"
        read_only_fields = [
            "id",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
            "owner",
            "logo_url",
        ]


class WorkspaceLiteSerializer(BaseSerializer):
    class Meta:
        model = Workspace
        fields = [
            "name",
            "slug",
            "id",
        ]
        read_only_fields = fields


class WorkSpaceMemberInviteSerializer(BaseSerializer):
    workspace = WorkSpaceSerializer(read_only=True)
    total_members = serializers.IntegerField(read_only=True)
    created_by_detail = UserLiteSerializer(read_only=True, source="created_by")

    class Meta:
        model = WorkspaceMemberInvite
        fields = "__all__"
        read_only_fields = [
            "id",
            "email",
            "token",
            "workspace",
            "message",
            "responded_at",
            "created_at",
            "updated_at",
        ]


class WorkspaceMemberMeSerializer(BaseSerializer):
    draft_issue_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = WorkspaceMember
        fields = "__all__"
