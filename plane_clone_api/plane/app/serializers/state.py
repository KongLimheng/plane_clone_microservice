from plane.db.models import State
# Module imports
from .base import BaseSerializer


class StateLiteSerializer(BaseSerializer):
    class Meta:
        model = State
        fields = [
            "id",
            "name",
            "color",
            "group",
        ]
        read_only_fields = fields
