from django.urls import path
from plane.app.views import UserNotificationPreferenceEndpoint

urlpatterns = [
    path(
        "users/me/notification-preferences/",
        UserNotificationPreferenceEndpoint.as_view(),
        name="user-notification-preferences",
    ),
]
