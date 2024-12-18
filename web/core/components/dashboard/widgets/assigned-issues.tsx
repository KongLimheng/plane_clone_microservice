import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import useSWR from "swr";
import { Tab } from "@headlessui/react";
import { TAssignedIssuesWidgetFilters, TAssignedIssuesWidgetResponse } from "@plane/types";
import { Card } from "@plane/ui";
import { EDurationFilters, FILTERED_ISSUES_TABS_LIST, UNFILTERED_ISSUES_TABS_LIST } from "@/constants/dashboard";
import { getCustomDates, getRedirectionFilters, getTabKey } from "@/helpers/dashboard.helper";
import { useDashboard } from "@/hooks/store/use-dashboard";
import { DurationFilterDropdown } from "./dropdowns";
import { IssuesErrorState } from "./error-states";
import { TabsList } from "./issue-panels";
import { WidgetLoader } from "./loaders";
import { WidgetProps } from "./overview-stats";

const WIDGET_KEY = "assigned_issues";

export const AssignedIssuesWidget: React.FC<WidgetProps> = observer((props) => {
  const { dashboardId, workspaceSlug } = props;

  // states
  const [fetching, setFetching] = useState(false);
  // store hooks

  const { fetchWidgetStats, getWidgetDetails, getWidgetStats, getWidgetStatsError, updateDashboardWidgetFilters } =
    useDashboard();

  const widgetDetails = getWidgetDetails(workspaceSlug, dashboardId, WIDGET_KEY);
  const widgetStats = getWidgetStats<TAssignedIssuesWidgetResponse>(workspaceSlug, dashboardId, WIDGET_KEY);
  const widgetStatsError = getWidgetStatsError(workspaceSlug, dashboardId, WIDGET_KEY);
  const selectedDurationFilter = widgetDetails?.widget_filters.duration ?? EDurationFilters.NONE;
  const selectedTab = getTabKey(selectedDurationFilter, widgetDetails?.widget_filters.tab);
  const selectedCustomDates = widgetDetails?.widget_filters.custom_dates ?? [];

  const { isLoading } = useSWR(
    `DASHBOARD_WIDGET_${WIDGET_KEY}`,
    () => {
      const filterDates = getCustomDates(selectedDurationFilter, selectedCustomDates);
      fetchWidgetStats(workspaceSlug, dashboardId, {
        widget_key: WIDGET_KEY,
        issue_type: selectedTab,
        ...(filterDates.trim() !== "" ? { target_date: filterDates } : {}),
        expand: "issue_relation",
      });
    },
    { revalidateOnFocus: false, revalidateIfStale: false }
  );

  const filtersParams = getRedirectionFilters(selectedTab);
  const tabsList = selectedDurationFilter === "none" ? UNFILTERED_ISSUES_TABS_LIST : FILTERED_ISSUES_TABS_LIST;
  const selectedTabIndex = tabsList.findIndex((tab) => tab.key === selectedTab);

  if ((!widgetDetails || !widgetStats) && !widgetStatsError) return <WidgetLoader widgetKey={WIDGET_KEY} />;

  const handleUpdateFilters = async (filters: Partial<TAssignedIssuesWidgetFilters>) => {
    console.log(filters, "=");
    if (!widgetDetails) return;
    setFetching(true);

    await updateDashboardWidgetFilters(workspaceSlug, dashboardId, widgetDetails.id, {
      widgetKey: WIDGET_KEY,
      filters,
    });

    const filterDates = getCustomDates(
      filters.duration ?? selectedDurationFilter,
      filters.custom_dates ?? selectedCustomDates
    );

    fetchWidgetStats(workspaceSlug, dashboardId, {
      widget_key: WIDGET_KEY,
      issue_type: filters.tab ?? selectedTab,
      ...(filterDates.trim() !== "" ? { target_date: filterDates } : {}),
      expand: "issue_relation",
    }).finally(() => setFetching(false));
  };

  return (
    <Card>
      {widgetStatsError ? (
        <IssuesErrorState
          isRefreshing={isLoading || fetching}
          onClick={() => {
            handleUpdateFilters({
              duration: EDurationFilters.NONE,
              tab: "pending",
            });
          }}
        />
      ) : (
        widgetStats && (
          <>
            <div className="flex items-center justify-between gap-2 mb-4">
              <Link
                className="text-lg font-semibold text-custom-text-300 hover:underline"
                href={`/${workspaceSlug}/workspace-views/assigned/${filtersParams}`}
              >
                Assigned to you
              </Link>

              <DurationFilterDropdown
                customDates={selectedCustomDates}
                value={selectedDurationFilter}
                onChange={(val, customDates) => {
                  if (val === "custom" && customDates) {
                    handleUpdateFilters({
                      duration: val,
                      custom_dates: customDates,
                    });

                    return;
                  }

                  if (val === selectedDurationFilter) return;
                  let newTab = selectedTab;
                  // switch to pending tab if target date is changed to none
                  if (val === "none" && selectedTab !== "completed") newTab = "pending";
                  // switch to upcoming tab if target date is changed to other than none
                  if (val !== "none" && selectedDurationFilter === "none" && selectedTab !== "completed")
                    newTab = "upcoming";

                  handleUpdateFilters({
                    duration: val,
                    tab: newTab,
                  });
                }}
              />
            </div>

            <Tab.Group
              as={"div"}
              selectedIndex={selectedTabIndex}
              onChange={(i) => {
                const newSelectedTab = tabsList[i];
                handleUpdateFilters({ tab: newSelectedTab.key ?? "completed" });
              }}
              className={"h-full flex flex-col"}
            >
              <TabsList durationFilter={selectedDurationFilter} selectedTab={selectedTab} />
              <Tab.Panels as="div" className={"w-full"}>
                {tabsList.map((tab) => {
                  if (tab.key !== selectedTab) return null;
                  return (
                    <Tab.Panel className={"h-full flex flex-col"} key={tab.key} static>
                      hi
                    </Tab.Panel>
                  );
                })}
              </Tab.Panels>
            </Tab.Group>
          </>
        )
      )}
    </Card>
  );
});
