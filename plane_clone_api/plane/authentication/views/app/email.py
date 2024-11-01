
from urllib.parse import urlencode, urljoin
from django.forms import ValidationError
from django.http import HttpResponseRedirect
from django.views import View
from django.core.validators import validate_email

from plane.license.models import Instance
from plane.authentication.adapter.error import AUTHENTICATION_ERROR_CODES, AuthenticationException
from plane.authentication.utils.host import base_host
from plane.db.models import User
from plane.authentication.provider.credentials.email import EmailProvider
from plane.authentication.utils.user_auth_workflow import post_user_auth_workflow
from plane.authentication.utils.login import user_login
from plane.authentication.utils.redirection_path import get_redirection_path


class SignInAuthEndpoint(View):
    def post(self, req):
        next_path = req.POST.get("next_path")
        # Check instance configuration
        instance = Instance.objects.first()
        if instance is None or not instance.is_setup_done:
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES[
                    "INSTANCE_NOT_CONFIGURED"
                ],
                error_message="INSTANCE_NOT_CONFIGURED",
            )
            params = exc.get_error_dict()
            if next_path:
                params["next_path"] = str(next_path)
            # Base URL join
            url = urljoin(
                base_host(request=req, is_app=True),
                "sign-in?" + urlencode(params),
            )
            return HttpResponseRedirect(url)

        # set the referer as session to redirect after login
        email = req.POST.get("email", False)
        password = req.POST.get("password", False)

        if not email or not password:
            # Redirection params
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES[
                    "REQUIRED_EMAIL_PASSWORD_SIGN_IN"
                ],
                error_message="REQUIRED_EMAIL_PASSWORD_SIGN_IN",
                payload={"email": str(email)},
            )
            params = exc.get_error_dict()
            # Next path
            if next_path:
                params["next_path"] = str(next_path)

            url = urljoin(
                base_host(request=req, is_app=True),
                "sign-in?" + urlencode(params),
            )

            return HttpResponseRedirect(url)

            # Validate email
        email = email.strip().lower()
        try:
            validate_email(email)
        except ValidationError:
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["INVALID_EMAIL_SIGN_IN"],
                error_message="INVALID_EMAIL_SIGN_IN",
                payload={"email": str(email)},
            )
            params = exc.get_error_dict()
            if next_path:
                params["next_path"] = str(next_path)
            url = urljoin(
                base_host(request=req, is_app=True),
                "sign-in?" + urlencode(params),
            )
            return HttpResponseRedirect(url)

        existing_user = User.objects.filter(email=email).first()
        if not existing_user:
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["USER_DOES_NOT_EXIST"],
                error_message="USER_DOES_NOT_EXIST",
                payload={"email": str(email)},
            )
            params = exc.get_error_dict()
            if next_path:
                params["next_path"] = str(next_path)
            url = urljoin(
                base_host(request=req, is_app=True),
                "sign-in?" + urlencode(params),
            )
            return HttpResponseRedirect(url)

        try:
            provider = EmailProvider(
                request=req,
                key=email,
                code=password,
                is_signup=False,
                callback=post_user_auth_workflow
            )

            user = provider.authenticate()
            # Login the user and record his device info
            user_login(request=req, user=user, is_app=True)
            if next_path:
                path = next_path
            else:
                path = get_redirection_path(user=user)

            # redirect to referer path
            url = urljoin(base_host(req, is_app=True), path)

            return HttpResponseRedirect(url)

        except AuthenticationException as e:
            params = e.get_error_dict()
            if next_path:
                params['next_path'] = str(next_path)
            url = urljoin(base_host(request=req, is_app=True),
                          "sign-in?"+urlencode(params))
            return HttpResponseRedirect(url)
