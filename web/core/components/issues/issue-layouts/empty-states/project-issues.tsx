import { observer } from "mobx-react";
import { EIssuesStoreType } from "@/constants/issue";
import { useCommandPalette, useRouterParams } from "@/hooks/store";
import { useIssues } from "@/hooks/store/use-issues";

export const ProjectEmptyState = observer(() => {
  // router
  const { workspaceSlug, projectId } = useRouterParams();
  // store hooks
  const { toggleCreateIssueModal } = useCommandPalette();
  // const { setTrackElement } = useEventTracker();

  const { issuesFilter } = useIssues(EIssuesStoreType.PROJECT);

  const userFilters = issuesFilter?.issueFilters?.filters;
  const activeLayout = issuesFilter?.issueFilters?.displayFilters?.layout;

  return <div>emplty</div>;
});
