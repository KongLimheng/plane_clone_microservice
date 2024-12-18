"use client";

import { observer } from "mobx-react";
import useSWR from "swr";
import { Spinner } from "@plane/ui";
import { LogoSpinner } from "@/components/common";
import { EIssueLayoutTypes, EIssuesStoreType } from "@/constants/issue";
import { useRouterParams } from "@/hooks/store";
import { useIssues } from "@/hooks/store/use-issues";
import { IssuesStoreContext } from "@/hooks/use-issue-layout-store";
import { IssuePeekOverview } from "../../peek-overview";
import { ProjectAppliedFiltersRoot } from "../filters";
import { ListLayout } from "../list";

const ProjectIssueLayout = (props: { activeLayout: EIssueLayoutTypes | undefined }) => {
  switch (props.activeLayout) {
    case EIssueLayoutTypes.LIST:
      return <ListLayout />;
    // case EIssueLayoutTypes.KANBAN:
    //   return <KanBanLayout />;
    // case EIssueLayoutTypes.CALENDAR:
    //   return <CalendarLayout />;
    // case EIssueLayoutTypes.GANTT:
    //   return <BaseGanttRoot />;
    // case EIssueLayoutTypes.SPREADSHEET:
    //   return <ProjectSpreadsheetLayout />;
    default:
      return null;
  }
};

export const ProjectLayoutRoot = observer(() => {
  // router
  const { workspaceSlug, projectId } = useRouterParams();
  // hooks
  const { issues, issuesFilter } = useIssues(EIssuesStoreType.PROJECT);
  if (!workspaceSlug || !projectId) return <></>;

  const { isLoading } = useSWR(
    workspaceSlug && projectId ? `PROJECT_ISSUES_${workspaceSlug}_${projectId}` : null,
    async () => {
      if (workspaceSlug && projectId) {
        await issuesFilter?.fetchFilters(workspaceSlug, projectId);
      }
    },
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  const issueFilters = issuesFilter?.getIssueFilters(projectId?.toString());
  const activeLayout = issueFilters?.displayFilters?.layout;

  if (isLoading && !issueFilters)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LogoSpinner />
      </div>
    );

  return (
    <IssuesStoreContext.Provider value={EIssuesStoreType.PROJECT}>
      <div className="relative flex size-full overflow-auto bg-custom-background-90">
        <ProjectAppliedFiltersRoot />

        <div className="relative size-full overflow-auto bg-custom-background-90">
          {/* mutation loader */}
          {issues.getIssueLoader() === "mutation" && (
            <div className="fixed w-[40px] h-[40px] z-50 right-[20px] top-[70px] flex justify-center items-center bg-custom-background-80 shadow-sm rounded">
              <Spinner className="w-4 h-4" />
            </div>
          )}
          <ProjectIssueLayout activeLayout={activeLayout} />
        </div>
        {/* peek overview */}
        <IssuePeekOverview />
      </div>
    </IssuesStoreContext.Provider>
  );
});
