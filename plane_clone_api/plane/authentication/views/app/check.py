from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from plane.authentication.rate_limit import AuthenticationThrottle
from plane.license.models import Instance
from plane.authentication.adapter.error import AUTHENTICATION_ERROR_CODES, EMAIL_REQUIRED, AuthenticationException
from rest_framework.response import Response
from rest_framework import status
from plane.settings.common import env
from plane.license.utils.instance_value import get_configuration_value
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from plane.db.models import User


class EmailCheckEndpoint(APIView):
    permission_classes = [
        AllowAny
    ]

    throttle_classes = [AuthenticationThrottle]

    def post(self, req):
        # Check instance configuration
        instance = Instance.objects.first()
        if instance is None or not instance.is_setup_done:
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES[
                    "INSTANCE_NOT_CONFIGURED"
                ],
                error_message="INSTANCE_NOT_CONFIGURED",
            )
            return Response(
                exc.get_error_dict(),
                status=status.HTTP_400_BAD_REQUEST,
            )

        (EMAIL_HOST, ENABLE_MAGIC_LINK_LOGIN) = get_configuration_value(
            [
                {
                    "key": "EMAIL_HOST",
                    "default": env("EMAIL_HOST", ""),
                },
                {
                    "key": "ENABLE_MAGIC_LINK_LOGIN",
                    "default": env("ENABLE_MAGIC_LINK_LOGIN", "1"),
                },
            ]
        )

        smtp_configured = bool(EMAIL_HOST)
        is_magic_login_enabled = ENABLE_MAGIC_LINK_LOGIN == "1"

        email = req.data.get("email", False)
        if not email:
            exc = AuthenticationException(
                error_code=EMAIL_REQUIRED,
                error_message="EMAIL_REQUIRED"
            )

            return Response(
                exc.get_error_dict(),
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Validate email
        try:
            validate_email(email)
        except ValidationError:
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["INVALID_EMAIL"],
                error_message="INVALID_EMAIL",
            )
            return Response(
                exc.get_error_dict(),
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if a user already exists with the given email
        existing_user = User.objects.filter(email=email).first()

        if existing_user:
            return Response(
                {
                    "existing": True,
                    "status": (
                        "MAGIC_CODE"
                        if existing_user.is_password_autoset
                        and smtp_configured
                        and is_magic_login_enabled
                        else "CREDENTIAL"
                    ),
                },
                status=status.HTTP_200_OK,
            )

        # Else return response
        return Response(
            {
                "existing": False,
                "status": (
                    "MAGIC_CODE"
                    if smtp_configured and is_magic_login_enabled
                    else "CREDENTIAL"
                ),
            },
            status=status.HTTP_200_OK,
        )
