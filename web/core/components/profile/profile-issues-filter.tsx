import { observer } from "mobx-react";
import { useRouterParams } from "@/hooks/store";

export const ProfileIssuesFilter = observer(() => {
  // router
  const { workspaceSlug, userId } = useRouterParams();
  // store hook
  // const {
  // 	issuesFilter: { issueFilters, updateFilters },
  // } = useIssues(EIssuesStoreType.PROFILE);

  // const { workspaceLabels } = useLabel();
  // derived values
  const states = undefined;
  const members = undefined;
  // const activeLayout = issueFilters?.displayFilters?.layout;

  return <div>filter</div>;
});
