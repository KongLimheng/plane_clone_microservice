from plane.app.serializers import WorkSpaceMemberInviteSerializer
from plane.db.models import WorkspaceMemberInvite
from .. import BaseViewSet
from django.db.models import Count


class UserWorkspaceInvitationsViewSet(BaseViewSet):
    serializer_class = WorkSpaceMemberInviteSerializer
    model = WorkspaceMemberInvite

    def get_queryset(self):
        return self.filter_queryset(
            super().get_queryset().filter(email=self.request.user.email)
            .select_related("workspace", "workspace__owner", "created_by")
            .annotate(total_members=Count("workspace__workspace_member"))
        )
