
# Module imports
from django.http import HttpRequest
from plane.db.models import ExporterHistory, Workspace, Project
from plane.app.serializers import ExporterHistorySerializer
from .. import BaseAPIView
# Third Party imports
from rest_framework import status
from rest_framework.response import Response
from plane.app.permissions import allow_permission, ROLE
from plane.bgtasks.export_task import issue_export_task


class ExportIssuesEndpoint(BaseAPIView):
    model = ExporterHistory
    serializer_class = ExporterHistorySerializer

    @allow_permission(allow_roles=[ROLE.ADMIN, ROLE.MEMBER], level="WORKSPACE")
    def post(self, req, slug):
        workspace = Workspace.objects.get(slug=slug)

        provider = req.data.get("provider", False)
        multiple = req.data.get("multiple", False)
        project_ids = req.data.get("project", [])

        if provider in ['csv', 'xlsx', 'json']:
            if not project_ids:
                project_ids = Project.objects.filter(
                    workspace__slug=slug,
                    project_projectmember__member=req.user,
                    project_projectmember__is_active=True,
                    archived_at__isnull=True,
                ).values_list('id', flat=True)

            exporter = ExporterHistory.objects.create(
                workspace=workspace,
                project=project_ids,
                initiated_by=req.user,
                provider=provider,
                type="issue_exports",
            )

            # issue_export_task.delay(
            #     provider=exporter.provider,
            #     workspace_id=workspace.id,
            #     project_ids=project_ids,
            #     token_id=exporter.token,
            #     multiple=multiple,
            #     slug=slug,
            # )

            issue_export_task(
                provider=exporter.provider,
                workspace_id=workspace.id,
                project_ids=project_ids,
                token_id=exporter.token,
                multiple=multiple,
                slug=slug,
                req=req
            )

            return Response(
                {"message": "Once the export is ready you will be able to download it"},
                status=status.HTTP_200_OK,
            )

        return Response(
            {"error": f"Provider '{provider}' not found."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    @allow_permission(allow_roles=[ROLE.ADMIN, ROLE.MEMBER], level="WORKSPACE")
    def get(self, req: HttpRequest, slug):

        exporter_history = ExporterHistory.objects.filter(
            workspace__slug=slug, type="issue_exports"
        ).select_related("workspace", "initiated_by")

        if req.GET.get('per_page', False) and req.GET.get("cursor", False):
            return self.paginate(
                order_by=req.GET.get("order_by", "-created_at"),
                request=req,
                queryset=exporter_history,
                on_results=lambda exporter_history: ExporterHistorySerializer(
                    exporter_history, many=True
                ).data
            )
        else:
            return Response(
                {"error": "per_page and cursor are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
