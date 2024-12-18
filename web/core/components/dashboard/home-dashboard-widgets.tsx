import { observer } from "mobx-react";
import { TWidgetKeys } from "@plane/types";
import { useRouterParams } from "@/hooks/store";
import { useDashboard } from "@/hooks/store/use-dashboard";
import { AssignedIssuesWidget, OverviewStatsWidget, WidgetProps } from "./widgets";

const WIDGETS_LIST: {
  [key in TWidgetKeys]: { component: React.FC<WidgetProps>; fullWidth?: boolean };
} = {
  overview_stats: { component: OverviewStatsWidget, fullWidth: true },
  assigned_issues: { component: AssignedIssuesWidget },
  // created_issues: { component: CreatedIssuesWidget, fullWidth: false },
  // issues_by_state_groups: { component: IssuesByStateGroupWidget, fullWidth: false },
  // issues_by_priority: { component: IssuesByPriorityWidget, fullWidth: false },
  // recent_activity: { component: RecentActivityWidget, fullWidth: false },
  // recent_projects: { component: RecentProjectsWidget, fullWidth: false },
  // recent_collaborators: { component: RecentCollaboratorsWidget, fullWidth: true },
};

export const DashboardWidgets = observer(() => {
  // router
  const { workspaceSlug } = useRouterParams();
  const { homeDashboardId, homeDashboardWidgets } = useDashboard();
  console.log(homeDashboardWidgets);
  const doesWidgetExist = (widgetKey: TWidgetKeys) =>
    Boolean(homeDashboardWidgets?.find((widget) => widget.key === widgetKey));

  if (!workspaceSlug || !homeDashboardId) return null;
  return (
    <div className="relative flex flex-col lg:grid lg:grid-cols-2 gap-7">
      {Object.entries(WIDGETS_LIST).map(([key, { component, fullWidth }]) => {
        const WidgetComponent = component;
        // if the widget doesn't exist, return null
        if (!doesWidgetExist(key as TWidgetKeys)) return null;
        // if the widget is full width, return it in a 2 column grid
        if (fullWidth) {
          return (
            <div key={key} className="lg:col-span-2">
              <WidgetComponent dashboardId={homeDashboardId} workspaceSlug={workspaceSlug} />
            </div>
          );
        } else {
          return <WidgetComponent key={key} dashboardId={homeDashboardId} workspaceSlug={workspaceSlug} />;
        }
      })}
    </div>
  );
});
