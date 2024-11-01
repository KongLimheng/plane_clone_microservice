"use client";

import { ReactNode } from "react";
import { observer } from "mobx-react";
import { useTheme } from "next-themes";
import useSWR from "swr";
import { useRouterParams, useUser, useUserPermissions, useWorkspace } from "@/hooks/store";
import { usePlatformOS } from "@/hooks/use-platform-os";
// images
import PlaneBlackLogo from "@/public/plane-logos/black-horizontal-with-blue-logo.png";
import PlaneWhiteLogo from "@/public/plane-logos/white-horizontal-with-blue-logo.png";
import WorkSpaceNotAvailable from "@/public/workspace/workspace-not-available.png";

export interface IWorkspaceAuthWrapper {
  children: ReactNode;
}

export const WorkspaceAuthWrapper = observer(({ children }: IWorkspaceAuthWrapper) => {
  // router params
  const { workspaceSlug } = useRouterParams();
  // next themes
  const { resolvedTheme } = useTheme();
  // store hooks
  const { signOut, data: currentUser } = useUser();

  const { workspaces } = useWorkspace();
  const { isMobile } = usePlatformOS();

  const { loader, fetchUserWorkspaceInfo } = useUserPermissions();
  const planeLogo = resolvedTheme === "dark" ? PlaneWhiteLogo : PlaneBlackLogo;

  useSWR("", () => fetchUserWorkspaceInfo(workspaceSlug?.toString() || ""));

  return <>{children}</>;
});
