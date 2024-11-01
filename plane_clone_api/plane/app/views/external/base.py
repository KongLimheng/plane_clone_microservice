import requests
from plane.license.utils.instance_value import get_configuration_value
from ..base import BaseAPIView
from plane.settings.common import env
from rest_framework.response import Response
from rest_framework import status


class UnsplashEndpoint(BaseAPIView):
    def get(self, req):
        (UNSPLASH_ACCESS_KEY,) = get_configuration_value(
            [
                {
                    "key": "UNSPLASH_ACCESS_KEY",
                    "default": env("UNSPLASH_ACCESS_KEY"),
                }
            ]
        )

        print(UNSPLASH_ACCESS_KEY)

        # Check unsplash access key
        if not UNSPLASH_ACCESS_KEY:
            return Response([], status=status.HTTP_200_OK)

            # Query parameters
        query = req.GET.get("query", False)
        page = req.GET.get("page", 1)
        per_page = req.GET.get("per_page", 20)

        url = (
            f"https://api.unsplash.com/search/photos/?client_id={UNSPLASH_ACCESS_KEY}&query={query}&page=${page}&per_page={per_page}"
            if query
            else f"https://api.unsplash.com/photos/?client_id={UNSPLASH_ACCESS_KEY}&page={page}&per_page={per_page}"
        )

        headers = {
            "Content-Type": "application/json",
        }

        resp = requests.get(url=url, headers=headers)
        return Response(resp.json(), status=resp.status_code)
