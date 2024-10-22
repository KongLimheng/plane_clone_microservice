from django.conf import settings
from plane.db.models import BaseModel
from django.db import models
from django.core.exceptions import ValidationError
from .asset import FileAsset

ROLE_CHOICES = (
    (20, "Owner"),
    (15, "Admin"),
    (10, "Member"),
    (5, "Guest"),
)


def slug_validator(value):
    if value in [
        "404",
        "accounts",
        "api",
        "create-workspace",
        "god-mode",
        "installations",
        "invitations",
        "onboarding",
        "profile",
        "spaces",
        "workspace-invitations",
    ]:
        raise ValidationError("Slug is not valid")


class Workspace(BaseModel):
    name = models.CharField(max_length=80, verbose_name="Workspace Name")
    logo = models.URLField(verbose_name="Logo", blank=True, null=True)
    logo_asset = models.ForeignKey(
        FileAsset,
        on_delete=models.SET_NULL,
        related_name="workspace_logo",
        blank=True,
        null=True
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owner_workspace",
    )

    slug = models.SlugField(
        max_length=48,
        db_index=True,
        unique=True,
        validators=[
            slug_validator,
        ],
    )
    organization_size = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.name

    @property
    def logo_url(self):
        if self.logo_asset:
            return self.logo_asset.asset_url
        if self.logo:
            return self.logo
        return None

    class Meta:
        verbose_name = "Workspace"
        verbose_name_plural = "Workspaces"
        db_table = "workspaces"
        ordering = ("-created_at",)


class WorkspaceBaseModel(BaseModel):
    workspace = models.ForeignKey(
        "db.Workspace", models.CASCADE, related_name="workspace_%(class)s"
    )
    project = models.ForeignKey(
        "db.Project",
        models.CASCADE,
        related_name="project_%(class)s",
        null=True,
    )

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if self.project:
            self.workspace = self.project.workspace
        super(WorkspaceBaseModel, self).save(*args, **kwargs)


class WorkspaceMemberInvite(BaseModel):
    workspace = models.ForeignKey(
        "db.Workspace",
        on_delete=models.CASCADE,
        related_name="workspace_member_invite"
    ),
    email = models.CharField(max_length=255)
    accepted = models.BooleanField(default=False)
    token = models.CharField(max_length=255)
    message = models.TextField(null=True)
    responded_at = models.DateTimeField(null=True)
    role = models.PositiveSmallIntegerField(choices=ROLE_CHOICES, default=5)

    class Meta:
        unique_together = ['email', 'workspace', 'deleted_at']
        constraints = [
            models.UniqueConstraint(
                fields=['email', 'workspace'],
                condition=models.Q(deleted_at__isnull=True),
                name="workspace_member_invite_unique_email_workspace_when_deleted_at_null"
            )
        ]
        verbose_name = "Workspace Member Invite"
        verbose_name_plural = "Workspace Member Invites"
        db_table = "workspace_member_invites"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.workspace.name} {self.email} {self.accepted}"