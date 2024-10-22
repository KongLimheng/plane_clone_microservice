
from plane.app.views import BaseViewSet
from plane.app.serializers import (
    UserMeSerializer, UserSerializer, ProfileSerializer, UserMeSettingsSerializer)
from plane.db.models.user import Profile, User
from plane.utils.cache import cache_response, invalidate_cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control
from django.views.decorators.vary import vary_on_cookie
from rest_framework.response import Response
from rest_framework import status

from plane.app.views.base import BaseAPIView


class UserEndPoint(BaseViewSet):
    serializer_class = UserSerializer
    model = User

    def get_object(self):
        return self.request.user

    @cache_response(60 * 60)
    @method_decorator(cache_control(private=True, max_age=12))
    @method_decorator(vary_on_cookie)
    def retrieve(self, req):
        serialized_data = UserMeSerializer(req.user).data
        return Response(
            serialized_data, status=status.HTTP_200_OK
        )

    @cache_response(60 * 60)
    @method_decorator(cache_control(private=True, max_age=12))
    @method_decorator(vary_on_cookie)
    def retrieve_user_settings(self, req):
        serializer = UserMeSettingsSerializer(req.user).data
        return Response(serializer, status=status.HTTP_200_OK)


class ProfileEndPoint(BaseAPIView):
    @method_decorator(cache_control(private=True, max_age=12))
    @method_decorator(vary_on_cookie)
    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @invalidate_cache("/api/users/me/settings/")
    def path(self, req):
        profile = Profile.objects.get(user=req.user)
        serializer = ProfileSerializer(profile, data=req.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
