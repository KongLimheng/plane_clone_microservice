"use client";

import React, { useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { Button } from "@plane/ui";
import { ApiTokenListItem, CreateApiTokenModal } from "@/components/api-token";
import { NotAuthorizedView } from "@/components/auth-screens";
import { PageHead } from "@/components/core";
import { EmptyState } from "@/components/empty-state";
import { APITokenSettingsLoader } from "@/components/ui";
import { EmptyStateType } from "@/constants/empty-state";
import { API_TOKENS_LIST } from "@/constants/fetch-key";
import { useRouterParams, useUserPermissions, useWorkspace } from "@/hooks/store";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";
import { APITokenService } from "@/services/api_token.service";

const apiTokenService = new APITokenService();

const ApiTokenPage = observer(() => {
  // states
  const [isCreateTokenModalOpen, setIsCreateTokenModalOpen] = useState(false);
  // router
  const { workspaceSlug } = useRouterParams();
  // store hooks
  const { currentWorkspace } = useWorkspace();
  const { workspaceUserInfo, allowPermissions } = useUserPermissions();
  // derived values
  const canPerformWorkspaceAdminActions = allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.WORKSPACE);

  const pageTitle = currentWorkspace?.name ? `${currentWorkspace.name} - API Tokens` : undefined;
  const { data: tokens } = useSWR(
    workspaceSlug && canPerformWorkspaceAdminActions ? API_TOKENS_LIST(workspaceSlug.toString()) : null,
    () =>
      workspaceSlug && canPerformWorkspaceAdminActions ? apiTokenService.getApiTokens(workspaceSlug.toString()) : null
  );

  if (workspaceUserInfo && !canPerformWorkspaceAdminActions) {
    return <NotAuthorizedView section="settings" />;
  }

  if (!tokens) return <APITokenSettingsLoader />;

  return (
    <>
      <PageHead title={pageTitle} />
      <CreateApiTokenModal isOpen={isCreateTokenModalOpen} onClose={() => setIsCreateTokenModalOpen(false)} />
      <section>
        {tokens.length > 0 ? (
          <>
            <div className="flex items-center justify-between border-b border-custom-border-200 pb-3.5">
              <h3 className="text-xl font-medium">API tokens</h3>
              <Button variant="primary" onClick={() => setIsCreateTokenModalOpen(true)}>
                Add API token
              </Button>
            </div>

            <div>
              {tokens.map((token) => (
                <ApiTokenListItem key={token.id} token={token} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-custom-border-200 pb-3.5">
              <h3 className="text-xl font-medium">API tokens</h3>
              <Button variant="primary" onClick={() => setIsCreateTokenModalOpen(true)}>
                Add API token
              </Button>
            </div>
            <div className="h-full w-full flex items-center justify-center">
              <EmptyState type={EmptyStateType.WORKSPACE_SETTINGS_API_TOKENS} />
            </div>
          </div>
        )}
      </section>
    </>
  );
});

export default ApiTokenPage;
