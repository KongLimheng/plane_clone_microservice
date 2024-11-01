from rest_framework.throttling import AnonRateThrottle
from rest_framework.response import Response
from plane.authentication.adapter.error import RATE_LIMIT_EXCEEDED, AuthenticationException
from rest_framework import status


class AuthenticationThrottle(AnonRateThrottle):
    rate = "30/minute"
    scope = "authentication"

    def throttle_failure_view(self):
        try:
            raise AuthenticationException(
                error_code=RATE_LIMIT_EXCEEDED,
                error_message="RATE_LIMIT_EXCEEDED"
            )
        except AuthenticationException as e:
            return Response(
                e.get_error_dict(), status=status.HTTP_429_TOO_MANY_REQUESTS
            )
