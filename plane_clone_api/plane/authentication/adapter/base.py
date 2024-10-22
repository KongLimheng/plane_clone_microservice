from zxcvbn import zxcvbn
from plane.authentication.adapter.error import INVALID_EMAIL, INVALID_PASSWORD, AuthenticationException
from plane.authentication.utils.host import base_host
from plane.bgtasks.user_activation_email_task import user_activation_email
from plane.db.models import User
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.utils import timezone


class Adapter:
    """Common interface for all auth providers"""

    def __init__(self, request, provider, callback=None):
        self.request = request
        self.provider = provider
        self.callback = callback
        self.token_data = None
        self.user_data = None

    def get_user_token(self, data, headers=None):
        raise NotImplementedError

    def get_user_response(self):
        raise NotImplementedError

    def set_token_data(self, data):
        self.token_data = data

    def set_user_data(self, data):
        self.user_data = data

    def create_update_account(self, user):
        raise NotImplementedError

    def authenticate(self):
        raise NotImplementedError

    def sanitize_email(self, email):
        # Check if email is present
        if not email:
            raise AuthenticationException(
                error_code=INVALID_EMAIL,
                error_message="INVALID_EMAIL",
                payload={"email": email},
            )

        # Sanitize email
        email = str(email).lower().strip()

        # validate email
        try:
            validate_email(email)
        except ValidationError:
            raise AuthenticationException(
                error_code=INVALID_EMAIL,
                error_message="INVALID_EMAIL",
                payload={"email": email},
            )
        # Return email
        return email

    def validate_password(self, email):
        results = zxcvbn(self.code)
        if results["score"] < 3:
            raise AuthenticationException(
                error_code=INVALID_PASSWORD,
                error_message="INVALID_PASSWORD",
                payload={"email": email},
            )
        return

    def save_user_data(self, user):
        # Update user details
        user.last_login_medium = self.provider
        user.last_active = timezone.now()
        user.last_login_time = timezone.now()
        user.last_login_ip = self.request.META.get("REMOTE_ADDR")
        user.last_login_uagent = self.request.META.get("HTTP_USER_AGENT")
        user.token_updated_at = timezone.now()
        # If user is not active, send the activation email and set the user as active
        if not user.is_active:
            user_activation_email.delay(
                base_host(request=self.request), user.id
            )
        # Set user as active
        user.is_active = True
        user.save()
        return user

    def complete_login_or_signup(self):
        email = self.user_data.get("email")
        user = User.objects.filter(email=email).first()
        # Check if sign up case or login
        is_signup = bool(user)
