from plane.license.api.permissions import InstanceAdminPermission
from plane.utils.cache import cache_response, invalidate_cache
from plane.license.models import InstanceConfiguration
from plane.license.api.serializers import InstanceConfigurationSerializer
from plane.license.utils.encryption import encrypt_data
from .base import BaseAPIView
from rest_framework.response import Response
from rest_framework import status


class InstanceConfigurationEndpoint(BaseAPIView):
    permission_classes = [
        InstanceAdminPermission
    ]

    @cache_response(60 * 60 * 2, user=False)
    def get(self, req):
        instance_configuration = InstanceConfiguration.objects.all()
        serializer = InstanceConfigurationSerializer(
            instance_configuration, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @invalidate_cache(path="/api/instances/configurations/", user=False)
    @invalidate_cache(path="/api/instances/", user=False)
    def patch(self, req):
        configurations = InstanceConfiguration.objects.filter(
            key__in=req.data.keys())
        bulk_configurations = []
        for config in configurations:
            value = req.data.get(config.key, config.value)
            if config.is_encrypted:
                config.value = encrypt_data(value)
            else:
                config.value = value
            bulk_configurations.append(config)

        InstanceConfiguration.objects.bulk_update(
            bulk_configurations, ["value"], batch_size=100
        )
        serializer = InstanceConfigurationSerializer(configurations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
