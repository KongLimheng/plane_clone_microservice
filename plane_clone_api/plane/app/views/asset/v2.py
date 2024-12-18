# Module imports
import uuid

from plane.db.models import FileAsset, Workspace
from ..base import BaseAPIView
# Django imports
from django.conf import settings
# Third party imports
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


class UserAssetsV2Endpoint(BaseAPIView):
    """This endpoint is used to upload user profile images."""

    def asset_delete(self, asset_id):
        ...

    def post(self, req):
        # get the asset key
        name = req.data.get("name")
        type = req.data.get("type", "image/jpeg")
        size = int(req.data.get("size", settings.FILE_SIZE_LIMIT))
        entity_type = req.data.get("entity_type", False)

        # Check if the file size is within the limit
        size_limit = min(size, settings.FILE_SIZE_LIMIT)

        #  Check if the entity type is allowed
        if not entity_type or entity_type not in ["USER_AVATAR", "USER_COVER"]:
            return Response(
                {
                    "error": "Invalid entity type.",
                    "status": False
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the file type is allowed
        allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
        if type not in allowed_types:
            return Response(
                {
                    "error": "Invalid file type. Only JPEG and PNG files are allowed.",
                    "status": False,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

            # asset key
        asset_key = f"{uuid.uuid4().hex}-{name}"

        # create a file asset
        asset = FileAsset.objects.create(
            attributes={
                "name": name,
                "type": type,
                "size": size_limit,
            },
            asset=asset_key,
            size=size_limit,
            user=req.user,
            created_by=req.user,
            entity_type=entity_type,
        )

        # Get the presigned URL
        # storage = S3Storage(request=req)
        # presigned_url = storage.generate_presigned_post(
        #     object_name=asset_key,
        #     file_type=type,
        #     file_size=size_limit,
        # )
        # Return the presigned URL
        return Response(
            {
                # "upload_data": presigned_url,
                "asset_id": str(asset.id),
                "asset_url": asset.asset_url,
            },
            status=status.HTTP_200_OK,
        )


class WorkspaceFileAssetEndpoint(BaseAPIView):
    def get_entity_id_field(self, entity_type, entity_id):
        # Workspace Logo
        if entity_type == FileAsset.EntityTypeContext.WORKSPACE_LOGO:
            return {
                "workspace_id": entity_id,
            }

        # Project Cover
        if entity_type == FileAsset.EntityTypeContext.PROJECT_COVER:
            return {
                "project_id": entity_id,
            }

        # User Avatar and Cover
        if entity_type in [
            FileAsset.EntityTypeContext.USER_AVATAR,
            FileAsset.EntityTypeContext.USER_COVER,
        ]:
            return {
                "user_id": entity_id,
            }

        # Issue Attachment and Description
        if entity_type in [
            FileAsset.EntityTypeContext.ISSUE_ATTACHMENT,
            FileAsset.EntityTypeContext.ISSUE_DESCRIPTION,
        ]:
            return {
                "issue_id": entity_id,
            }

        # Page Description
        if entity_type == FileAsset.EntityTypeContext.PAGE_DESCRIPTION:
            return {
                "page_id": entity_id,
            }

        # Comment Description
        if entity_type == FileAsset.EntityTypeContext.COMMENT_DESCRIPTION:
            return {
                "comment_id": entity_id,
            }
        return {}

    def post(self, request, slug):
        name = request.data.get("name")
        type = request.data.get("type", "image/jpeg")
        size = int(request.data.get("size", settings.FILE_SIZE_LIMIT))
        entity_type = request.data.get("entity_type")
        entity_identifier = request.data.get("entity_identifier", False)

        # Check if the entity type is allowed
        if entity_type not in FileAsset.EntityTypeContext.values:
            return Response(
                {
                    "error": "Invalid entity type.",
                    "status": False,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if the file type is allowed
        allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
        if type not in allowed_types:
            return Response(
                {
                    "error": "Invalid file type. Only JPEG and PNG files are allowed.",
                    "status": False,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get the size limit
        size_limit = min(settings.FILE_SIZE_LIMIT, size)

        # Get the workspace
        workspace = Workspace.objects.get(slug=slug)

        # asset key
        asset_key = f"{workspace.id}/{uuid.uuid4().hex}-{name}"
        # Create a File Asset
        asset = FileAsset.objects.create(
            attributes={
                "name": name,
                "type": type,
                "size": size_limit,
            },
            asset=asset_key,
            size=size_limit,
            workspace=workspace,
            created_by=request.user,
            entity_type=entity_type,
            **self.get_entity_id_field(
                entity_type=entity_type, entity_id=entity_identifier
            ),
        )

        # Get the presigned URL
        # storage = S3Storage(request=request)
        # # Generate a presigned URL to share an S3 object
        # presigned_url = storage.generate_presigned_post(
        #     object_name=asset_key,
        #     file_type=type,
        #     file_size=size_limit,
        # )
        # Return the presigned URL
        return Response(
            {
                # "upload_data": presigned_url,
                "asset_id": str(asset.id),
                "asset_url": asset.asset_url,
            },
            status=status.HTTP_200_OK,
        )
