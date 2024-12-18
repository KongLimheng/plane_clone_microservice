# Python import
from uuid import uuid4

# Third party
from rest_framework.response import Response
from rest_framework import status

# Module import
from .base import BaseAPIView
from plane.db.models import APIToken, Workspace
from plane.app.serializers import APITokenSerializer, APITokenReadSerializer
from plane.app.permissions import WorkspaceOwnerPermission


class ApiTokenEndpoint(BaseAPIView):
    permission_classes = [WorkspaceOwnerPermission]

    def post(self, req, slug):
        label = req.data.get("label", str(uuid4().hex))
        description = req.data.get("description", "")
        workspace = Workspace.objects.get(slug=slug)
        expired_at = req.data.get("expired_at", None)
        # Check the user type
        user_type = 1 if req.user.is_bot else 0

        api_token = APIToken.objects.create(
            label=label,
            description=description,
            user=req.user,
            workspace=workspace,
            user_type=user_type,
            expired_at=expired_at,
        )
        serializer = APITokenSerializer(api_token)
        # Token will be only visible while creating
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get(self, req, slug, pk=None):
        if pk is None:
            api_tokens = APIToken.objects.filter(
                user=req.user, workspace__slug=slug, is_service=False
            )
            serializer = APITokenReadSerializer(api_tokens, many=True)
        else:
            api_tokens = APIToken.objects.get(
                user=req.user, workspace__slug=slug, pk=pk
            )
            serializer = APITokenReadSerializer(api_tokens)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, req, slug, pk):
        api_token = APIToken.objects.get(
            workspace__slug=slug, user=req.user, pk=pk, is_service=False
        )

        api_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
