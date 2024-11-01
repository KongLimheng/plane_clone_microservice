from plane.db.models import UserNotificationPreference
from .base import BaseSerializer


class UserNotificationPreferenceSerializer(BaseSerializer):
    class Meta:
        model = UserNotificationPreference
        fields = "__all__"
