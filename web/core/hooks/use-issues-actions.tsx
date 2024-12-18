import { useCallback, useMemo } from "react";
import {
  IIssueDisplayFilterOptions,
  IIssueDisplayProperties,
  IIssueFilterOptions,
  IssuePaginationOptions,
  TIssue,
  TIssueKanbanFilters,
  TIssuesResponse,
  TLoader,
} from "@plane/types";
import { EIssueFilterType, EIssuesStoreType } from "@/constants/issue";
import { useRouterParams } from "./store";
import { useIssues } from "./store/use-issues";

interface IssueActions {
  fetchIssues: (
    loadType: TLoader,
    options: IssuePaginationOptions,
    viewId?: string
  ) => Promise<TIssuesResponse | undefined>;
  // fetchNextIssues: (groupId?: string, subGroupId?: string) => Promise<TIssuesResponse | undefined>;
  // removeIssue: (projectId: string | undefined | null, issueId: string) => Promise<void>;
  // createIssue?: (projectId: string | undefined | null, data: Partial<TIssue>) => Promise<TIssue | undefined>;
  // quickAddIssue?: (projectId: string | undefined | null, data: TIssue) => Promise<TIssue | undefined>;
  // updateIssue?: (projectId: string | undefined | null, issueId: string, data: Partial<TIssue>) => Promise<void>;
  // removeIssueFromView?: (projectId: string | undefined | null, issueId: string) => Promise<void>;
  // archiveIssue?: (projectId: string | undefined | null, issueId: string) => Promise<void>;
  // restoreIssue?: (projectId: string | undefined | null, issueId: string) => Promise<void>;
  // updateFilters: (
  //   projectId: string,
  //   filterType: EIssueFilterType,
  //   filters: IIssueFilterOptions | IIssueDisplayFilterOptions | IIssueDisplayProperties | TIssueKanbanFilters
  // ) => Promise<void>;
}

export const useIssuesActions = (storeType: EIssuesStoreType): IssueActions => {
  const projectIssueActions = useProjectIssueActions();
  // const cycleIssueActions = useCycleIssueActions();
  // const moduleIssueActions = useModuleIssueActions();
  // const projectViewIssueActions = useProjectViewIssueActions();
  // const globalIssueActions = useGlobalIssueActions();
  // const profileIssueActions = useProfileIssueActions();
  // const draftIssueActions = useDraftIssueActions();
  // const archivedIssueActions = useArchivedIssueActions();
  // const workspaceDraftIssueActions = useWorkspaceDraftIssueActions();

  switch (storeType) {
    // case EIssuesStoreType.PROJECT_VIEW:
    //   return projectViewIssueActions;
    // case EIssuesStoreType.PROFILE:
    //   return profileIssueActions;
    // case EIssuesStoreType.ARCHIVED:
    //   return archivedIssueActions;
    // case EIssuesStoreType.DRAFT:
    //   return draftIssueActions;
    // case EIssuesStoreType.CYCLE:
    //   return cycleIssueActions;
    // case EIssuesStoreType.MODULE:
    //   return moduleIssueActions;
    // case EIssuesStoreType.GLOBAL:
    //   return globalIssueActions;
    // case EIssuesStoreType.WORKSPACE_DRAFT:
    //   return workspaceDraftIssueActions;
    case EIssuesStoreType.PROJECT:
    default:
      return projectIssueActions;
  }
};

const useProjectIssueActions = () => {
  // router
  const { workspaceSlug: routerWorkspaceSlug, projectId: routerProjectId } = useRouterParams();
  const workspaceSlug = routerWorkspaceSlug?.toString();
  const projectId = routerProjectId?.toString();
  // store hooks
  const { issues, issuesFilter } = useIssues(EIssuesStoreType.PROJECT);

  const fetchIssues = useCallback(
    async (loadType: TLoader, options: IssuePaginationOptions) => {
      if (!workspaceSlug || !projectId) return;
      return issues.fetchIssues(workspaceSlug, projectId, loadType, options);
    },
    [issues, projectId, workspaceSlug]
  );

  return useMemo(
    () => ({
      fetchIssues,
    }),
    [fetchIssues]
  );
};
