
# Third party imports
from rest_framework import status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

# Module imports
from ..base import BaseAPIView, BaseViewSet
from plane.db.models import FileAsset, Workspace
from plane.app.serializers import FileAssetSerializer


class UserAssetsEndpoint(BaseAPIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        serializer = FileAssetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
