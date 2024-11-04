from .base import BaseModel
from django.db import models
from django.db.models import Q


class IssueType(BaseModel):
    workspace = models.ForeignKey(
        "db.Workspace",
        related_name="issue_types",
        on_delete=models.CASCADE,
    )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    logo_props = models.JSONField(default=dict)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    level = models.PositiveIntegerField(default=0)
    external_source = models.CharField(
        max_length=255, null=True, blank=True)
    external_id = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        verbose_name = "Issue Type"
        verbose_name_plural = "Issue Types"
        db_table = "issue_types"

    def __str__(self):
        return self.name
