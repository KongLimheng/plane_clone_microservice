from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from django.middleware.csrf import get_token
from rest_framework.response import Response
from rest_framework import status
# Django imports
from django.shortcuts import render

from plane.authentication.utils.host import base_host


class CSRFTokenEndpoint(APIView):
    permission_classes = [
        AllowAny
    ]

    def get(self, request):
        csrf_token = get_token(request)
        return Response({"csrf_token": csrf_token}, status=status.HTTP_200_OK)


def csrf_failure(request, reason=""):
    """Custom CSRF failure view"""
    return render(request, "csrf_failure.html", {"reason": reason, "root_url": base_host(request=request)})
