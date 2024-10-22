from django.utils import timezone
import zoneinfo
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend

# Third part imports
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from plane import TimezoneMixin
from plane.authentication.session import BaseSessionAuthentication
from plane.utils.paginator import BasePaginator


class BaseViewSet(TimezoneMixin, ModelViewSet, BasePaginator):
    model = None

    permission_classes = [
        IsAuthenticated,
    ]

    filter_backends = (
        DjangoFilterBackend,
        SearchFilter,
    )

    authentication_classes = [
        BaseSessionAuthentication,
    ]
    filterset_fields = []

    search_fields = []

    def get_queryset(self):
        try:
            return self.model.objects.all()
        except Exception as e:
            # log_exception(e)
            raise APIException(
                "Please check the view", status.HTTP_400_BAD_REQUEST
            )


class BaseAPIView(TimezoneMixin, APIView, BasePaginator):
    permission_classes = [
        IsAuthenticated,
    ]

    filter_backends = (
        DjangoFilterBackend,
        SearchFilter,
    )

    filterset_fields = []

    search_fields = []

    authentication_classes = [
        BaseSessionAuthentication,
    ]

    def filter_queryset(self, queryset):
        for backend in list(self.filter_backends):
            queryset = backend().filter_queryset(self.request, queryset, self)
        return queryset
