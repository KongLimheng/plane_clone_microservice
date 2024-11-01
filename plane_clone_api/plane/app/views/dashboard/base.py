from plane.db.models import Dashboard, Widget, DashboardWidget
from plane.app.serializers import DashboardSerializer, WidgetSerializer
from ..base import BaseAPIView
from django.db.models import (
    Case,
    CharField,
    Count,
    Exists,
    F,
    Func,
    IntegerField,
    JSONField,
    OuterRef,
    Prefetch,
    Q,
    Subquery,
    UUIDField,
    Value,
    When,
)
from rest_framework.response import Response
from rest_framework import status


class DashboardEndpoint(BaseAPIView):
    def get(self, req, slug, dashboard_id=None):
        if not dashboard_id:
            dashboard_type = req.GET.get("dashboard_type", None)
            if dashboard_type == "home":
                dashboard, created = Dashboard.objects.get_or_create(
                    type_identifier=dashboard_type,
                    owned_by=req.user,
                    is_default=True,
                )

                if created:
                    widgets_to_fetch = [
                        "overview_stats",
                        "assigned_issues",
                        "created_issues",
                        "issues_by_state_groups",
                        "issues_by_priority",
                        "recent_activity",
                        "recent_projects",
                        "recent_collaborators",
                    ]

                    updated_dashboard_widgets = []
                    for widget_key in widgets_to_fetch:
                        widget = Widget.objects.filter(
                            key=widget_key).values_list("id", flat=True)
                        if widget:
                            updated_dashboard_widgets.append(
                                DashboardWidget(
                                    widget_id=widget, dashboard_id=dashboard.id)
                            )
                    DashboardWidget.objects.bulk_create(
                        updated_dashboard_widgets, batch_size=100
                    )

                widgets = (
                    Widget.objects.annotate(
                        is_visible=Exists(
                            DashboardWidget.objects.filter(
                                widget_id=OuterRef("pk"),
                                dashboard_id=dashboard.id,
                                is_visible=True
                            )
                        )
                    ).annotate(
                        dashboard_filters=Subquery(
                            DashboardWidget.objects.filter(
                                widget_id=OuterRef("pk"),
                                dashboard_id=dashboard.id,
                                filters__isnull=False
                            ).exclude(filters={}).values("filters")[:1]
                        )
                    ).annotate(
                        widget_filters=Case(
                            When(
                                dashboard_filters__isnull=False,
                                then=F("dashboard_filters"),
                            ),
                            default=F("filters"),
                            output_field=JSONField()
                        )
                    )
                )

                print(widgets.query)

                return Response(
                    {
                        "dashboard": DashboardSerializer(dashboard).data,
                        "widget": WidgetSerializer(widgets, many=True).data
                    }, status=status.HTTP_200_OK
                )

            return Response(
                {"error": "Please specify a valid dashboard type"},
                status=status.HTTP_400_BAD_REQUEST,
            )
