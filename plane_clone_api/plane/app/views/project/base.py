import json
from django.db import IntegrityError
from plane.app.serializers import ProjectListSerializer, ProjectSerializer, DeployBoardSerializer
from plane.db.models import Project, ProjectMember, Workspace, State, WorkspaceMember, Issue, IssueUserProperty, Intake, DeployBoard
from ..base import BaseViewSet, BaseAPIView
from django.db.models import OuterRef, Exists, Func, F, Subquery, Prefetch, Q
# Third Party imports
from rest_framework.response import Response
from rest_framework import serializers, status
from plane.app.permissions import (
    allow_permission,
    ProjectMemberPermission,
    ROLE
)
from django.core.serializers.json import DjangoJSONEncoder


class ProjectViewSet(BaseViewSet):
    serializer_class = ProjectListSerializer
    model = Project
    webhook_event = "project"

    def get_queryset(self):
        query_member = ProjectMember.objects.filter(
            member=self.request.user,
            project_id=OuterRef("pk"),
            workspace__slug=self.workspace_slug,
            is_active=True
        )
        sort_order = query_member.values("sort_order")

        return self.filter_queryset(
            super()
            .get_queryset()
            .filter(workspace__slug=self.workspace_slug)
            .select_related(
                "workspace",
                "workspace__owner",
                "default_assignee",
                "project_lead",
            )
            # .annotate(
            #     is_favorite=Exists(
            #         UserFavorite.objects.filter(
            #             user=self.request.user,
            #             entity_identifier=OuterRef("pk"),
            #             entity_type="project",
            #             project_id=OuterRef("pk"),
            #         )
            #     )
            # )
            .annotate(
                is_member=Exists(
                    ProjectMember.objects.filter(
                        member=self.request.user,
                        project_id=OuterRef("pk"),
                        workspace__slug=self.workspace_slug,
                        is_active=True,
                    )
                )
            )
            .annotate(
                total_members=ProjectMember.objects.filter(
                    project_id=OuterRef("id"),
                    member__is_bot=False,
                    is_active=True,
                )
                .order_by()
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            )
            .annotate(
                member_role=ProjectMember.objects.filter(
                    project_id=OuterRef("pk"),
                    member_id=self.request.user.id,
                    is_active=True,
                ).values("role")
            )
            .annotate(
                anchor=DeployBoard.objects.filter(
                    entity_name="project",
                    entity_identifier=OuterRef("pk"),
                    workspace__slug=self.workspace_slug,
                ).values("anchor")
            )
            .annotate(sort_order=Subquery(sort_order))
            .prefetch_related(
                Prefetch(
                    "project_projectmember",
                    queryset=ProjectMember.objects.filter(
                        workspace__slug=self.workspace_slug,
                        is_active=True
                    ).select_related("member"),
                    to_attr="members_list"
                )
            )
            .distinct()
        )

    @allow_permission(
        allow_roles=[ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST],
        level="WORKSPACE",
    )
    def list(self, req, slug):
        fields = [
            field
            for field in req.GET.get("fields", "").split(",")
            if field
        ]

        projects = self.get_queryset().order_by("sort_order", "name")

        if WorkspaceMember.objects.filter(
            member=req.user,
            workspace__slug=slug,
            is_active=True,
            role=5
        ).exists():
            projects = projects.filter(
                project_projectmember__member=self.request.user,
                project_projectmember__is_active=True,
            )

        if WorkspaceMember.objects.filter(
            member=req.user,
            workspace__slug=slug,
            is_active=True,
            role=15,
        ).exists():
            projects = projects.filter(
                Q(
                    project_projectmember__member=self.request.user,
                    project_projectmember__is_active=True,
                )
                | Q(network=2)
            )

        if req.GET.get("per_page", False) and req.GET.get("cursor", False):
            return self.paginate(
                order_by=req.GET.get("order_by", "-created_at"),
                request=req,
                queryset=(projects),
                on_results=lambda projects: ProjectListSerializer(
                    projects, many=True
                ).data,
            )

        projects = ProjectListSerializer(
            projects, many=True, fields=fields if fields else None
        ).data

        return Response(projects, status=status.HTTP_200_OK)

    @allow_permission(
        allow_roles=[ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST],
        level="WORKSPACE",
    )
    def retrieve(self, request, slug, pk):
        project = (
            self.get_queryset()
            .filter(archived_at__isnull=True)
            .filter(pk=pk)
            .annotate(
                total_issues=Issue.issue_objects.filter(
                    project_id=self.kwargs.get("pk"),
                )
                .order_by()
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            )
            .annotate(
                sub_issues=Issue.issue_objects.filter(
                    project_id=self.kwargs.get("pk"),
                    parent__isnull=False,
                )
                .order_by()
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            )
            .annotate(
                archived_issues=Issue.objects.filter(
                    project_id=self.kwargs.get("pk"),
                    archived_at__isnull=False,
                )
                .order_by()
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            )
            .annotate(
                archived_sub_issues=Issue.objects.filter(
                    project_id=self.kwargs.get("pk"),
                    archived_at__isnull=False,
                    parent__isnull=False,
                )
                .order_by()
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            )
            .annotate(
                draft_issues=Issue.objects.filter(
                    project_id=self.kwargs.get("pk"),
                    is_draft=True,
                )
                .order_by()
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            )
            .annotate(
                draft_sub_issues=Issue.objects.filter(
                    project_id=self.kwargs.get("pk"),
                    is_draft=True,
                    parent__isnull=False,
                )
                .order_by()
                .annotate(count=Func(F("id"), function="Count"))
                .values("count")
            )
        ).first()

        if project is None:
            return Response(
                {"error": "Project does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ProjectListSerializer(project)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER], level="WORKSPACE")
    def create(self, req, slug):
        try:
            workspace = Workspace.objects.get(slug=slug)
            serializer = ProjectSerializer(
                data={**req.data}, context={"workspace_id": workspace.id}
            )
            if serializer.is_valid():
                serializer.save()

                # Add the user as Administrator to the project
                _ = ProjectMember.objects.create(
                    project_id=serializer.data["id"],
                    member=req.user,
                    role=20,
                )

                # Also create the issue property for the user
                _ = IssueUserProperty.objects.create(
                    project_id=serializer.data["id"],
                    user=req.user,
                )

                if (
                    (serializer.data["project_lead"] is not None) and
                        (str(serializer.data["project_lead"])
                         != str(req.user.id))
                ):
                    ProjectMember.objects.create(
                        project_id=serializer.data["id"],
                        member_id=serializer.data["project_lead"],
                        role=20,
                    )

                    # Also create the issue property for the user
                    IssueUserProperty.objects.create(
                        project_id=serializer.data["id"],
                        user_id=serializer.data["project_lead"],
                    )

                # Default states
                states = [
                    {
                        "name": "Backlog",
                        "color": "#A3A3A3",
                        "sequence": 15000,
                        "group": "backlog",
                        "default": True,
                    },
                    {
                        "name": "Todo",
                        "color": "#3A3A3A",
                        "sequence": 25000,
                        "group": "unstarted",
                    },
                    {
                        "name": "In Progress",
                        "color": "#F59E0B",
                        "sequence": 35000,
                        "group": "started",
                    },
                    {
                        "name": "Done",
                        "color": "#16A34A",
                        "sequence": 45000,
                        "group": "completed",
                    },
                    {
                        "name": "Cancelled",
                        "color": "#EF4444",
                        "sequence": 55000,
                        "group": "cancelled",
                    },
                ]

                State.objects.bulk_create(
                    [
                        State(
                            name=state["name"],
                            color=state["color"],
                            project=serializer.instance,
                            sequence=state["sequence"],
                            workspace=serializer.instance.workspace,
                            group=state["group"],
                            default=state.get("default", False),
                            created_by=req.user,
                        )
                        for state in states
                    ]
                )

                project = (
                    self.get_queryset()
                    .filter(pk=serializer.data["id"])
                    .first()
                )
                # Create the model activity

                serializer = ProjectListSerializer(project)
                return Response(
                    serializer.data, status=status.HTTP_201_CREATED
                )

            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        except IntegrityError as e:
            if "already exists" in str(e):
                return Response(
                    {"name": "The project name is already taken"}, status=status.HTTP_410_GONE
                )
        except Workspace.DoesNotExist:
            return Response(
                {"error": "Workspace does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )
        except serializers.ValidationError as e:
            return Response(
                {"identifier": e.detail},
                status=status.HTTP_410_GONE
            )

    def partial_update(self, req, slug, pk=None):
        try:
            if not ProjectMember.objects.filter(
                member=req.user,
                workspace__slug=slug,
                project_id=pk,
                role=20,
                is_active=True
            ).exists():
                return Response(
                    {"error": "You don't have the required permissions."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            workspace = Workspace.objects.get(slug=slug)
            intake_view = req.data.get(
                "inbox_view", req.data.get("intake_view", False)
            )

            project = Project.objects.get(pk=pk)
            current_instance = json.dumps(
                ProjectSerializer(project).data, cls=DjangoJSONEncoder
            )

            if project.archived_at:
                return Response(
                    {"error": "Archived projects cannot be updated"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            print({**req.data, "intake_view": intake_view})

            serializer = ProjectSerializer(
                project,
                data={**req.data, "intake_view": intake_view},
                context={"workspace_id": workspace.id},
                partial=True
            )

            if serializer.is_valid():
                serializer.save()
                if intake_view:
                    intake = Intake.objects.filter(
                        project=project,
                        is_default=True
                    ).first()

                    if not intake:
                        Intake.objects.create(
                            name=f"{project.name} Intake",
                            project=project,
                            is_default=True,
                        )

                    # Create the triage state in Backlog group
                    State.objects.get_or_create(
                        name="Triage",
                        group="triage",
                        description="Default state for managing all Intake Issues",
                        project_id=pk,
                        color="#ff7700",
                        is_triage=True,
                    )

                project = (
                    self.get_queryset()
                    .filter(pk=serializer.data["id"])
                    .first()
                )

                serializer = ProjectListSerializer(project)
                return Response(
                    serializer.data, status=status.HTTP_200_OK
                )
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        except IntegrityError as e:
            if "already exists" in str(e):
                return Response(
                    {"name": "The project name is already taken"},
                    status=status.HTTP_410_GONE,
                )
        except (Project.DoesNotExist, Workspace.DoesNotExist):
            return Response(
                {"error": "Project does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except serializers.ValidationError:
            return Response(
                {"identifier": "The project identifier is already taken"},
                status=status.HTTP_410_GONE,
            )


class DeployBoardViewSet(BaseViewSet):
    permission_classes = [ProjectMemberPermission]
    serializer_class = DeployBoardSerializer
    model = DeployBoard

    def list(self, request, slug, project_id):
        project_deploy_board = DeployBoard.objects.filter(
            entity_name="project",
            entity_identifier=project_id,
            workspace__slug=slug,
        ).first()

        serializer = DeployBoardSerializer(project_deploy_board)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, slug, project_id):
        comments = request.data.get("is_comments_enabled")
        reactions = request.data.get("is_reactions_enabled", False)
        intake = request.data.get("intake", None)
        votes = request.data.get("is_votes_enabled", False)
        views = request.data.get(
            "view_props",
            {
                "list": True,
                "kanban": True,
                "calendar": True,
                "gantt": True,
                "spreadsheet": True,
            },
        )

        project_deploy_board, _ = DeployBoard.objects.get_or_create(
            entity_name="project",
            entity_identifier=project_id,
            project_id=project_id,
        )

        project_deploy_board.intake = intake
        project_deploy_board.view_props = views
        project_deploy_board.is_votes_enabled = votes
        project_deploy_board.is_comments_enabled = comments
        project_deploy_board.is_reactions_enabled = reactions

        project_deploy_board.save()
        serializer = self.serializer_class(project_deploy_board)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProjectUserViewsEndpoint(BaseAPIView):
    def post(self, req, slug, project_id):
        project = Project.objects.get(
            pk=project_id, workspace__slug=slug)

        project_member = ProjectMember.objects.filter(
            member=req.user,
            project=project,
            is_active=True
        ).first()

        if project_member is None:
            return Response(
                {"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN
            )

        view_props = project_member.view_props
        default_props = project_member.default_props
        preferences = project_member.preferences
        sort_order = project_member.sort_order

        project_member.view_props = req.data.get("view_props", view_props)
        project_member.default_props = req.data.get(
            "default_props", default_props
        )
        project_member.preferences = req.data.get(
            "preferences", preferences
        )
        project_member.sort_order = req.data.get("sort_order", sort_order)

        project_member.save()

        return Response(status=status.HTTP_204_NO_CONTENT)
