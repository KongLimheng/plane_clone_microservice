import os
import uuid
from zxcvbn import zxcvbn
from plane.authentication.adapter.error import INVALID_EMAIL, INVALID_PASSWORD, SIGNUP_DISABLED, AuthenticationException
from plane.authentication.utils.host import base_host
from plane.bgtasks.user_activation_email_task import user_activation_email
from plane.db.models import User
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.utils import timezone

from plane.license.utils.instance_value import get_configuration_value
from plane.db.models.user import Profile
from plane.db.models.workspace import WorkspaceMemberInvite


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

        email = self.sanitize_email(email)
        user = User.objects.filter(email=email).first()
        # Check if sign up case or login
        is_signup = bool(user)
        if not user:
            self.__check_signup(email)

            # Initialize user
            user = User(email=email, username=uuid.uuid4().hex)
            if self.user_data.get("user").get("is_password_autoset"):
                user.set_password(uuid.uuid4().hex)
                user.is_password_autoset = True
                user.is_email_verified = True
            else:
                # Validate password
                self.validate_password(email)
                user.set_password(self.code)
                user.is_password_autoset = False

            # Set user details
            avatar = self.user_data.get("user", {}).get("avatar", "")
            first_name = self.user_data.get("user", {}).get("first_name", "")
            last_name = self.user_data.get("user", {}).get("last_name", "")
            user.avatar = avatar if avatar else ""
            user.first_name = first_name if first_name else ""
            user.last_name = last_name if last_name else ""
            user.save()

            Profile.objects.create(user=user)
        user = self.save_user_data(user=user)
        # Call callback if present
        if self.callback:
            self.callback(
                user,
                is_signup,
                self.request,
            )

        # Create or update account if token data is present
        if self.token_data:
            self.create_update_account(user=user)
        return user

    def __check_signup(self, email):
        """Check if sign up is enabled or not and raise exception if not enabled"""

        (ENABLE_SIGNUP,) = get_configuration_value([
            {
                "key": "ENABLE_SIGNUP",
                "default": os.environ.get("ENABLE_SIGNUP", "1"),
            },
        ])

        if (ENABLE_SIGNUP == '0' and not WorkspaceMemberInvite.objects.filter(email=email).exists()):
            raise AuthenticationException(
                error_code=SIGNUP_DISABLED, error_message="SIGNUP_DISABLED", payload={"email": email})
        return True
