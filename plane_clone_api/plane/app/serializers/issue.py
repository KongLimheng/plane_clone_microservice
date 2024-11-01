from plane.app.serializers.base import DynamicBaseSerializer
from plane.db.models import FileAsset


class IssueAttachmentLiteSerializer(DynamicBaseSerializer):
    class Meta:
        model = FileAsset
        fields = [
            "id",
            "asset",
            "attributes",
            # "issue_id",
            "updated_at",
            "updated_by",
            "asset_url",
        ]
        read_only_fields = fields
