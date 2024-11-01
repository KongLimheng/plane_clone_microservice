from rest_framework import serializers


class BaseSerializer(serializers.ModelSerializer):
    id = serializers.PrimaryKeyRelatedField(read_only=True)


class DynamicBaseSerializer(BaseSerializer):
    def __init__(self, *args, **kwargs):

        # If 'fields' is provided in the arguments, remove it and store it separately.
        # This is done so as not to pass this custom argument up to the superclass.
        fields = kwargs.pop("fields", [])
        self.expand = kwargs.pop("expand", []) or []
        fields = self.expand

        super().__init__(*args, **kwargs)
        # If 'fields' was provided, filter the fields of the serializer accordingly.
        if fields is not None:
            self.fields = self._filter_fields(fields)

    def _filter_fields(self, fields):
        """
        Adjust the serializer's fields based on the provided 'fields' list.

        :param fields: List or dictionary specifying which fields to include in the serializer.
        :return: The updated fields for the serializer.
        """

        for filed_name in fields:
            if isinstance(filed_name, dict):

                for key, value in filed_name.items():
                    if isinstance(value, list):
                        self._filter_fields(self.fields[key], value)
        allowed = []
        for item in fields:
            # If the item is a string, it directly represents a field's name.
            if isinstance(item, str):
                allowed.append(item)
                # If the item is a dictionary, it represents a nested field.
                # Add the key of this dictionary to the allowed list.
            elif isinstance(item, dict):
                allowed.append(list(item.keys())[0])

        for field in allowed:
            from . import (
                WorkspaceLiteSerializer,
                UserLiteSerializer
            )
            # Expansion mapper
            expansion = {
                "user": UserLiteSerializer,
                "workspace": WorkspaceLiteSerializer,
            }

            if field not in self.fields and field in expansion:
                self.fields[field] = expansion[field](
                    many=(True if field in [
                        "members",
                        "assignees",
                        "labels",
                        "issue_cycle",
                        "issue_relation",
                        "issue_inbox",
                        "issue_reactions",
                        "issue_attachment",
                        "issue_link",
                        "sub_issues"]
                        else False
                    )
                )
        return self.fields

    def to_representation(self, instance):
        res = super().to_representation(instance)

        if self.expand:
            for expand in self.expand:
                if expand in self.fields:
                    from . import (
                        WorkspaceLiteSerializer,
                        UserLiteSerializer,
                        IssueAttachmentLiteSerializer
                    )
                    # Expansion mapper
                    expansion = {
                        "user": UserLiteSerializer,
                        "workspace": WorkspaceLiteSerializer,
                        "issue_attachment": IssueAttachmentLiteSerializer,

                    }
                    if expand in expansion:
                        if isinstance(res.get(expand), list):
                            exp_serializer = expansion[expand](
                                getattr(instance, expand), many=True
                            )
                        else:
                            exp_serializer = expansion[expand](
                                getattr(instance, expand)
                            )
                    else:
                        res[expand] = getattr(
                            instance, f"{expand}_id", None
                        )
            if ("issue_attachments" in self.fields or "issue_attachments" in self.expand):
                from plane.db.models import FileAsset
                issue_id = getattr(instance, "id", None)
                if issue_id:
                    # Fetch related issue_attachments
                    issue_attachments = FileAsset.objects.filter(
                        issue_id=issue_id,
                        entity_type=FileAsset.EntityTypeContext.ISSUE_ATTACHMENT
                    )
                    # Serialize issue_attachments and add them to the response
                    res["issue_attachments"] = (
                        IssueAttachmentLiteSerializer(
                            issue_attachments, many=True
                        ).data
                    )
        return res
