import { observer } from "mobx-react";
import { IIssueFilterOptions } from "@plane/types";
import { EHeaderVariant, Header } from "@plane/ui";
import { EIssuesStoreType } from "@/constants/issue";
import { useRouterParams, useUserPermissions } from "@/hooks/store";
import { useIssues } from "@/hooks/store/use-issues";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";

export const ProjectAppliedFiltersRoot = observer(() => {
  // router
  const { workspaceSlug, projectId } = useRouterParams() as {
    workspaceSlug: string;
    projectId: string;
  };

  const {
    issuesFilter: { issueFilters, updateFilters },
  } = useIssues(EIssuesStoreType.PROJECT);
  const { allowPermissions } = useUserPermissions();
  // derived values
  const isEditingAllowed = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.PROJECT
  );
  const userFilters = issueFilters?.filters;

  // filters whose value not null or empty array
  const appliedFilters: IIssueFilterOptions = {};
  Object.entries(userFilters ?? {}).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value) && value.length === 0) return;
    appliedFilters[key as keyof IIssueFilterOptions] = value;
  });

  if (Object.keys(appliedFilters).length === 0) return null;

  return (
    <Header variant={EHeaderVariant.TERNARY}>
      <Header.LeftItem>hi</Header.LeftItem>
    </Header>
  );
});
