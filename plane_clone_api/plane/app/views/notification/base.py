from plane.db.models import UserNotificationPreference
from plane.app.serializers import UserNotificationPreferenceSerializer
from ..base import BaseAPIView

# Third party imports
from rest_framework.response import Response
from rest_framework import status


class UserNotificationPreferenceEndpoint(BaseAPIView):
    model = UserNotificationPreference
    serializer_class = UserNotificationPreferenceSerializer
    # request the object

    def get(self, request):
        user_notification_preference = UserNotificationPreference.objects.get(
            user=request.user
        )
        if (user_notification_preference):
            print("no")
        serializer = UserNotificationPreferenceSerializer(
            user_notification_preference
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
