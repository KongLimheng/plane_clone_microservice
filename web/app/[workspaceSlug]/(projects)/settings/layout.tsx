"use client";

import { FC, ReactNode } from "react";
import { observer } from "mobx-react";
import { NotAuthorizedView } from "@/components/auth-screens";
import { AppHeader } from "@/components/core/app-header";
import { useUserPermissions } from "@/hooks/store";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";
import { WorkspaceSettingHeader } from "./header";
import { WorkspaceSettingsSidebar } from "./sidebar";

export interface IWorkspaceSettingLayout {
  children: ReactNode;
}

const WorkspaceSettingLayout: FC<IWorkspaceSettingLayout> = observer((props) => {
  const { children } = props;
  const { workspaceUserInfo, allowPermissions } = useUserPermissions();
  // derived values
  const isWorkspaceAdmin = allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.WORKSPACE);

  return (
    <>
      <AppHeader header={<WorkspaceSettingHeader />} />
      <div className="inset-y-0 flex vertical-scrollbar scrollbar-lg size-full overflow-y-auto">
        {workspaceUserInfo && !isWorkspaceAdmin ? (
          <NotAuthorizedView section="settings" />
        ) : (
          <>
            <div className="px-page-x !pr-0 py-page-y flex-shrink-0 overflow-y-hidden sm:hidden md:block lg:block">
              <WorkspaceSettingsSidebar />
            </div>
            <div className="flex flex-col relative w-full overflow-hidden">
              <div className="size-full overflow-x-hidden overflow-y-scroll  vertical-scrollbar scrollbar-md px-page-x md:px-9 py-page-y">
                {children}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
});

export default WorkspaceSettingLayout;
