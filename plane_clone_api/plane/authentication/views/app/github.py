from urllib.parse import urlencode, urljoin
import uuid
from django.http import HttpResponseRedirect
from django.views import View

from plane.authentication.utils.host import base_host
from plane.license.models import Instance
from plane.authentication.adapter.error import INSTANCE_NOT_CONFIGURED, AuthenticationException
from plane.authentication.provider.oauth import GitHubOAuthProvider


class GitHubOauthInitiateEndpoint(View):

    def get(self, request):
        request.session['host'] = base_host(request=request, is_app=True)
        next_path = request.GET.get("next_path")
        if next_path:
            request.session["next_path"] = str(next_path)
            # Check instance configuration
        instance = Instance.objects.first()
        if instance is None or not instance.is_setup_done:
            exc = AuthenticationException(
                error_code=INSTANCE_NOT_CONFIGURED,
                error_message="INSTANCE_NOT_CONFIGURED",
            )
            params = exc.get_error_dict()
            if next_path:
                params["next_path"] = str(next_path)
            url = urljoin(
                base_host(request=request, is_app=True),
                "?" + urlencode(params),
            )
            return HttpResponseRedirect(url)

        try:
            state = uuid.uuid4().hex
            provider = GitHubOAuthProvider(request=request, state=state)
            request.session['state'] = state
            auth_url = provider.get_auth_url()
            return HttpResponseRedirect(auth_url)

        except AuthenticationException as e:
            params = e.get_error_dict()
            if next_path:
                params["next_path"] = str(next_path)
            url = urljoin(
                base_host(request=request, is_app=True),
                "?" + urlencode(params),
            )
            return HttpResponseRedirect(url)
