import { createContext, useContext } from "react";
import { EIssuesStoreType } from "@/constants/issue";
import { useRouterParams } from "./store";
import { useIssues } from "./store/use-issues";

export const IssuesStoreContext = createContext<EIssuesStoreType | undefined>(undefined);

export const useIssueStoreType = () => {
  const storeType = useContext(IssuesStoreContext);
  const { globalViewId, viewId, projectId, cycleId, moduleId, userId } = useRouterParams();

  // If store type exists in context, use that store type

  if (storeType) return storeType;
  // else check the router params to determine the issue store
  if (globalViewId) return EIssuesStoreType.GLOBAL;

  if (userId) return EIssuesStoreType.PROFILE;

  if (viewId) return EIssuesStoreType.PROJECT_VIEW;

  if (cycleId) return EIssuesStoreType.CYCLE;

  if (moduleId) return EIssuesStoreType.MODULE;

  if (projectId) return EIssuesStoreType.PROJECT;

  return EIssuesStoreType.PROJECT;
};

export const useIssuesStore = () => {
  const storeType = useIssueStoreType();

  return useIssues(storeType);
};
