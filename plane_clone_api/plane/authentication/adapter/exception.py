# Third party imports
from rest_framework.views import exception_handler
from rest_framework.exceptions import NotAuthenticated
from rest_framework.exceptions import Throttled
# Module imports
from plane.authentication.adapter.error import AuthenticationException, AUTHENTICATION_ERROR_CODES


def auth_exception_handler(exc, context):
    # Call the default exception handler first, to get the standard error response.
    response = exception_handler(exc, context)
    # Check if an AuthenticationFailed exception is raised.

    if isinstance(exc, NotAuthenticated):
        response.status_code = 401

    # Check if an Throttled exception is raised.
    if isinstance(exc, Throttled):
        exc = AuthenticationException(
            error_code=AUTHENTICATION_ERROR_CODES["RATE_LIMIT_EXCEEDED"],
            error_message="RATE_LIMIT_EXCEEDED",
        )
        response.data = exc.get_error_dict()
        response.status_code = 429
    # Return the response that is generated by the default exception handler.
    return response
