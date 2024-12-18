"use client";

import { observer } from "mobx-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { SidebarNavItem } from "@/components/sidebar";
import { useRouterParams, useUserPermissions } from "@/hooks/store";
import { EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";
import { WORKSPACE_SETTINGS_LINKS } from "@/plane-web/constants/workspace";
import { shouldRenderSettingLink } from "@/plane-web/helpers/workspace.helper";

export const WorkspaceSettingsSidebar = observer(() => {
  // router
  const { workspaceSlug } = useRouterParams();
  const pathname = usePathname();
  // mobx store
  const { allowPermissions } = useUserPermissions();

  return (
    <div className="flex w-[280px] flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-custom-sidebar-text-400">SETTINGS</span>
        <div className="flex w-full flex-col gap-1">
          {WORKSPACE_SETTINGS_LINKS.map(
            (link) =>
              shouldRenderSettingLink(link.key) &&
              allowPermissions(link.access, EUserPermissionsLevel.WORKSPACE, workspaceSlug) && (
                <Link href={`/${workspaceSlug}${link.href}`} key={link.key}>
                  <SidebarNavItem
                    className="text-sm font-medium px-4 py-2"
                    key={link.key}
                    isActive={link.highlight(pathname, `/${workspaceSlug}`)}
                  >
                    {link.label}
                  </SidebarNavItem>
                </Link>
              )
          )}
        </div>
      </div>
    </div>
  );
});
