import re
from ..base import BaseAPIView
from django.db.models import Q
from plane.db.models import Project, Workspace, Issue
# Third party imports
from rest_framework import status
from rest_framework.response import Response


class GlobalSearchEndpoint(BaseAPIView):
    """Endpoint to search across multiple fields in the workspace and
        also show related workspace if found
    """

    def filter_workspaces(self, query, slug, project_id, workspace_search):
        fields = ["name"]
        q = Q()
        for field in fields:
            q |= Q(**{f"{field}__icontains": query})

        return (
            Workspace.objects.filter(
                q, workspace_member__member=self.request.user
            )
            .distinct()
            .values("name", "id", "slug")
        )

    def filter_projects(self, query, slug, project_id, workspace_search):
        fields = ["name", "identifier"]
        q = Q()
        for field in fields:
            q |= Q(**{f"{field}__icontains": query})
        return (
            Project.objects.filter(
                q,
                project_projectmember__member=self.request.user,
                project_projectmember__is_active=True,
                archived_at__isnull=True,
                workspace__slug=slug,
            )
            .distinct()
            .values("name", "id", "identifier", "workspace__slug")
        )

    def filter_issues(self, query, slug, project_id, workspace_search):
        fields = ["name", "sequence_id", "project__identifier"]
        q = Q()
        for field in fields:
            if field == "sequence_id":
                # Match whole integers only (exclude decimal numbers)
                sequences = re.findall(r"\b\d+\b", query)
                for sequence_id in sequences:
                    q |= Q(**{"sequence_id": sequence_id})
            else:
                q |= Q(**{f"{field}__icontains": query})

        issues = Issue.issue_objects.filter(
            q,
            project__project_projectmember__member=self.request.user,
            project__project_projectmember__is_active=True,
            project__archived_at__isnull=True,
            workspace__slug=slug,
        )

        if workspace_search == "false" and project_id:
            issues = issues.filter(project_id=project_id)

        return issues.distinct().values(
            "name",
            "id",
            "sequence_id",
            "project__identifier",
            "project_id",
            "workspace__slug",
        )[:100]

    def get(self, req, slug):
        query = req.GET.get("search", False)
        workspace_search = req.GET.get(
            "workspace_search", False
        )
        project_id = req.GET.get("project_id", False)

        if not query:
            return Response(
                {
                    "results": {
                        "workspace": [],
                        "project": [],
                        "issue": [],
                        "cycle": [],
                        "module": [],
                        "issue_view": [],
                        "page": [],
                    }
                },
                status=status.HTTP_200_OK,
            )

        results = {}
        MODELS_MAPPER = {
            "workspace": self.filter_workspaces,
            "project": self.filter_projects,
            # "issue": self.filter_issues,
            # "cycle": self.filter_cycles,
            # "module": self.filter_modules,
            # "issue_view": self.filter_views,
            # "page": self.filter_pages,
        }

        for model in MODELS_MAPPER.keys():
            func = MODELS_MAPPER.get(model, None)
            results[model] = func(query, slug, project_id, workspace_search)

        return Response({"results": results}, status=status.HTTP_200_OK)
