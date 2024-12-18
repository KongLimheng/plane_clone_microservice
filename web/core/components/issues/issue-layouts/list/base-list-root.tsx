import { FC, useEffect } from "react";
import { observer } from "mobx-react";
import { GroupByColumnTypes, TGroupedIssues, TIssueKanbanFilters } from "@plane/types";
import { EIssueLayoutTypes, EIssuesStoreType } from "@/constants/issue";
import { useUserPermissions } from "@/hooks/store";
import { useIssues } from "@/hooks/store/use-issues";
import { useIssueStoreType } from "@/hooks/use-issue-layout-store";
import { useIssuesActions } from "@/hooks/use-issues-actions";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";
import { IssueLayoutHOC } from "../issue-layout-HOC";
import { IQuickActionProps } from "./list-view-types";

type ListStoreType =
  | EIssuesStoreType.PROJECT
  | EIssuesStoreType.MODULE
  | EIssuesStoreType.CYCLE
  | EIssuesStoreType.PROJECT_VIEW
  | EIssuesStoreType.DRAFT
  | EIssuesStoreType.PROFILE
  | EIssuesStoreType.ARCHIVED
  | EIssuesStoreType.WORKSPACE_DRAFT;

interface IBaseListRoot {
  QuickActions: FC<IQuickActionProps>;
  addIssuesToView?: (issueIds: string[]) => Promise<any>;
  canEditPropertiesBasedOnProject?: (projectId: string) => boolean;
  viewId?: string | undefined;
  isCompletedCycle?: boolean;
}

export const BaseListRoot = observer((props: IBaseListRoot) => {
  const { QuickActions, viewId, addIssuesToView, canEditPropertiesBasedOnProject, isCompletedCycle = false } = props;
  // router
  const storeType = useIssueStoreType() as ListStoreType;

  // mobx store
  const { issuesFilter, issues } = useIssues(storeType);

  const { allowPermissions } = useUserPermissions();
  const { issueMap } = useIssues();

  const displayFilters = issuesFilter?.issueFilters?.displayFilters;
  const displayProperties = issuesFilter?.issueFilters?.displayProperties;
  const orderBy = displayFilters?.order_by || undefined;

  const group_by = (displayFilters?.group_by || null) as GroupByColumnTypes | null;
  const showEmptyGroup = displayFilters?.show_empty_groups ?? false;

  const collapsedGroups =
    issuesFilter?.issueFilters?.kanbanFilters || ({ group_by: [], sub_group_by: [] } as TIssueKanbanFilters);
  const { fetchIssues } = useIssuesActions(storeType);

  useEffect(() => {
    fetchIssues("init-loader", { canGroup: true, perPageCount: group_by ? 50 : 100 }, viewId);
  }, [fetchIssues, group_by, viewId, storeType]);

  const groupedIssueIds = issues?.groupedIssueIds as TGroupedIssues | undefined;

  // auth
  const isEditingAllowed = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.PROJECT
  );
  const { enableInlineEditing, enableQuickAdd, enableIssueCreation } = issues?.viewFlags || {};

  console.log(collapsedGroups);
  return <IssueLayoutHOC layout={EIssueLayoutTypes.LIST}>base root</IssueLayoutHOC>;
});
