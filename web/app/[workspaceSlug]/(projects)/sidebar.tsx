import { useEffect, useRef } from "react";
import { observer } from "mobx-react";
import { useOutsideClickDetector } from "@plane/helpers";
import {
  SidebarDropdown,
  SidebarHelpSection,
  SidebarProjectsList,
  SidebarQuickActions,
  SidebarUserMenu,
  SidebarWorkspaceMenu,
} from "@/components/workspace";
import { cn } from "@/helpers/common.helper";
import { useAppTheme, useUserPermissions } from "@/hooks/store";
import useSize from "@/hooks/use-window-size";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";

export const AppSidebar = observer(() => {
  // store hooks
  const { allowPermissions } = useUserPermissions();
  const { toggleSidebar, sidebarCollapsed } = useAppTheme();
  // const { groupedFavorites } = useFavorite();
  const { windowWidth } = useSize();
  // refs
  const ref = useRef<HTMLDivElement>(null);

  const canPerformWorkspaceMemberActions = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  useOutsideClickDetector(ref, () => {
    if (sidebarCollapsed === false) {
      if (window.innerWidth < 768) {
        toggleSidebar();
      }
    }
  });

  useEffect(() => {
    if (windowWidth < 768 && !sidebarCollapsed) toggleSidebar();
  }, [windowWidth, sidebarCollapsed, toggleSidebar]);

  return (
    <div
      className={cn(
        "fixed inset-y-0 z-20 flex h-full shrink-0 flex-grow-0 flex-col border-r border-custom-sidebar-border-200 bg-custom-sidebar-background-100 duration-300 w-[250px] md:relative md:ml-0",
        {
          "w-[70px] -ml-[250px]": sidebarCollapsed,
        }
      )}
    >
      <div ref={ref} className={cn("size-full flex flex-col flex-1 pt-4 pb-0", { "p-2 pt-4": sidebarCollapsed })}>
        <div
          className={cn("px-2", {
            "px-4": !sidebarCollapsed,
          })}
        >
          <SidebarDropdown />
          <div className="flex-shrink-0 h-4" />
          <SidebarQuickActions />
        </div>

        <hr
          className={cn("flex-shrink-0 border-custom-sidebar-border-300 h-[0.5px] w-3/5 mx-auto my-1", {
            "opacity-0": !sidebarCollapsed,
          })}
        />

        <div
          className={cn("overflow-x-hidden scrollbar-sm h-full w-full overflow-y-auto px-2 py-0.5", {
            "vertical-scrollbar px-4": !sidebarCollapsed,
          })}
        >
          <SidebarUserMenu />
          <SidebarWorkspaceMenu />
          <hr
            className={cn("flex-shrink-0 border-custom-sidebar-border-300 h-[0.5px] w-3/5 mx-auto my-1", {
              "opacity-0": !sidebarCollapsed,
            })}
          />

          <SidebarProjectsList />
        </div>
        <SidebarHelpSection />
      </div>
    </div>
  );
});
