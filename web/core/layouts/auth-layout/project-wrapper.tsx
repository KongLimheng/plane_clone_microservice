"use client";

import { ReactNode } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { JoinProject } from "@/components/auth-screens";
import { EmptyState, LogoSpinner } from "@/components/common";
import { useCommandPalette, useRouterParams, useUserPermissions } from "@/hooks/store";
import { useMember } from "@/hooks/store/use-member";
import { useProject } from "@/hooks/store/use-project";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";
import emptyProject from "@/public/empty-state/onboarding/dashboard-light.webp";

interface IProjectAuthWrapper {
  children: ReactNode;
}

export const ProjectAuthWrapper = observer(({ children }: IProjectAuthWrapper) => {
  // store
  const { toggleCreateProjectModal } = useCommandPalette();
  const { allowPermissions, projectUserInfo, fetchUserProjectInfo } = useUserPermissions();
  const { loader, getProjectById, fetchProjectDetails } = useProject();
  // const { fetchAllCycles } = useCycle();
  // const { fetchModulesSlim, fetchModules } = useModule();
  // const { initGantt } = useTimeLineChart(ETimeLineTypeType.MODULE);
  // const { fetchViews } = useProjectView();

  const {
    project: { fetchProjectMembers },
  } = useMember();
  // const { fetchProjectStates } = useProjectState();
  // const { fetchProjectLabels } = useLabel();
  // const { getProjectEstimates } = useProjectEstimates();
  // router
  const { workspaceSlug, projectId } = useRouterParams();

  const projectMemberInfo = projectUserInfo?.[workspaceSlug!]?.[projectId!];

  useSWR(
    workspaceSlug && projectId ? `PROJECT_DETAILS_${workspaceSlug}_${projectId}` : null,
    workspaceSlug && projectId ? () => fetchProjectDetails(workspaceSlug, projectId) : null
  );

  // fetching user project member information
  useSWR(
    workspaceSlug && projectId ? `PROJECT_ME_INFORMATION_${workspaceSlug}_${projectId}` : null,
    workspaceSlug && projectId ? () => fetchUserProjectInfo(workspaceSlug.toString(), projectId.toString()) : null
  );

  // fetching project members
  useSWR(
    workspaceSlug && projectId ? `PROJECT_MEMBERS_${workspaceSlug}_${projectId}` : null,
    workspaceSlug && projectId ? () => fetchProjectMembers(workspaceSlug, projectId) : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  const projectExists = projectId ? getProjectById(projectId) : null;

  const hasPermissionToCurrentProject = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
    EUserPermissionsLevel.PROJECT,
    workspaceSlug,
    projectId
  );

  if (!projectMemberInfo && projectId && hasPermissionToCurrentProject === null)
    return (
      <div className="grid h-screen place-items-center bg-custom-background-100 p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <LogoSpinner />
        </div>
      </div>
    );

  if (projectExists && projectId && hasPermissionToCurrentProject === false) return <JoinProject />;

  if (!loader && !projectExists && projectId && !!hasPermissionToCurrentProject) {
    return (
      <div className="grid h-screen place-items-center bg-custom-background-100">
        <EmptyState
          title="No such project exists"
          description="Try creating a new project"
          image={emptyProject}
          primaryButton={{
            text: "Create Project",
            onClick: () => {
              toggleCreateProjectModal(true);
            },
          }}
        />
      </div>
    );
  }
  return <>{children}</>;
});
