"use client";

import React from "react";
import { observer } from "mobx-react";
import { NotAuthorizedView } from "@/components/auth-screens";
import { PageHead } from "@/components/core";
import { IntegrationGuide } from "@/components/exporter";
import { cn } from "@/helpers/common.helper";
import { useUserPermissions, useWorkspace } from "@/hooks/store";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";

const ExportPage = observer(() => {
  // store hooks
  const { workspaceUserInfo, allowPermissions } = useUserPermissions();
  const { currentWorkspace } = useWorkspace();

  // derived values
  const canPerformWorkspaceMemberActions = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );
  const pageTitle = currentWorkspace?.name
    ? `${currentWorkspace.name}
   - Exports`
    : undefined;
  // if user is not authorized to view this page
  if (workspaceUserInfo && !canPerformWorkspaceMemberActions) {
    return <NotAuthorizedView section="settings" />;
  }
  return (
    <>
      <PageHead title={pageTitle} />
      <div
        className={cn("w-full overflow-y-auto", {
          "opacity-60": !canPerformWorkspaceMemberActions,
        })}
      >
        <div className="flex items-center border-b border-custom-border-100 pb-3.5">
          <h3 className="text-xl font-medium">Exports</h3>
        </div>
        <IntegrationGuide />
      </div>
    </>
  );
});

export default ExportPage;
