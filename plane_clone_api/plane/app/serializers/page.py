from plane.app.serializers import BaseSerializer
# Third party imports
from rest_framework import serializers
from plane.db.models import Label, Page, Project, ProjectPage, PageLabel


class PageSerializer(BaseSerializer):
    is_favorite = serializers.BooleanField(read_only=True)
    labels = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=Label.objects.all()),
        write_only=True,
        required=False,
    )
    # Many to many
    label_ids = serializers.ListField(
        child=serializers.UUIDField(), required=False)
    project_ids = serializers.ListField(
        child=serializers.UUIDField(), required=False)

    class Meta:
        model = Page
        fields = [
            "id",
            "name",
            "owned_by",
            "access",
            "color",
            "labels",
            "parent",
            "is_favorite",
            "is_locked",
            "archived_at",
            "workspace",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "view_props",
            "logo_props",
            "label_ids",
            "project_ids",
        ]
        read_only_fields = ["workspace", "owned_by"]

    def create(self, validated_data):
        labels = validated_data.pop("labels", None)
        project_id = self.context["project_id"]
        owned_by_id = self.context["owned_by_id"]
        description_html = self.context["description_html"]

        # Get the workspace id from the project
        project = Project.objects.get(pk=project_id)
        # Create the page
        page = Page.objects.create(
            **validated_data,
            description_html=description_html,
            owned_by_id=owned_by_id,
            workspace_id=project.workspace_id
        )

        # Create the project page
        ProjectPage.objects.create(
            workspace_id=page.workspace_id,
            project_id=project_id,
            page_id=page.id,
            created_by_id=page.created_by_id,
            updated_by_id=page.updated_by_id,
        )

        # Create page labels
        if labels is not None:
            PageLabel.objects.bulk_create(
                [
                    PageLabel(
                        label=label,
                        page=page,
                        workspace_id=page.workspace_id,
                        created_by_id=page.created_by_id,
                        updated_by_id=page.updated_by_id,
                    )
                    for label in labels
                ],
                batch_size=10
            )
        return page


class PageDetailSerializer(PageSerializer):
    description_html = serializers.CharField()

    class Meta(PageSerializer.Meta):
        fields = PageSerializer.Meta.fields + ["description_html"]
