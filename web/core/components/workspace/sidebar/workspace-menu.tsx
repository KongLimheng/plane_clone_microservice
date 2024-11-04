"use client";

import { useRef, useState } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Disclosure, Transition } from "@headlessui/react";
import { Tooltip } from "@plane/ui";
import { SIDEBAR_WORKSPACE_MENU_ITEMS } from "@/constants/dashboard";
import { cn } from "@/helpers/common.helper";
import { useAppTheme, useUserPermissions } from "@/hooks/store";
import useLocalStorage from "@/hooks/use-local-storage";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";

export const SidebarWorkspaceMenu = observer(() => {
  // state
  const [isMenuActive, setIsMenuActive] = useState(false);
  // refs
  const actionSectionRef = useRef<HTMLDivElement | null>(null);
  // store hooks
  const { toggleSidebar, sidebarCollapsed } = useAppTheme();
  // const { captureEvent } = useEventTracker();
  const { isMobile } = usePlatformOS();
  const { allowPermissions } = useUserPermissions();
  // router params
  const { workspaceSlug } = useParams();
  // pathname
  const pathname = usePathname();

  // local storage
  const { setValue: toggleWorkspaceMenu, storedValue } = useLocalStorage<boolean>("is_workspace_menu_open", true);
  // derived values
  const isWorkspaceMenuOpen = !!storedValue;

  console.log(storedValue);

  return (
    <Disclosure defaultOpen as={"div"}>
      {!sidebarCollapsed && (
        <div
          className={cn(
            "flex px-2 bg-custom-sidebar-background-100 group/workspace-button hover:bg-custom-sidebar-background-90 rounded",
            { "mt-2.5": !sidebarCollapsed }
          )}
        >
          <Disclosure.Button
            as="button"
            className={
              "flex-1 sticky top-0 w-full py-1.5 flex items-center justify-between gap-1 text-custom-sidebar-text-400 text-xs font-semibold"
            }
            onClick={() => toggleWorkspaceMenu(!isWorkspaceMenuOpen)}
          >
            <span>WORKSPACE</span>
          </Disclosure.Button>

          <Disclosure.Button
            as="button"
            className="sticky top-0 z-10 group/workspace-button px-0.5 py-1.5 flex items-center justify-between gap-1 text-custom-sidebar-text-400 hover:bg-custom-sidebar-background-90 rounded text-xs font-semibold"
            onClick={() => toggleWorkspaceMenu(!isWorkspaceMenuOpen)}
          >
            <span className="flex-shrink-0 opacity-0 pointer-events-none group-hover/workspace-button:opacity-100 group-hover/workspace-button:pointer-events-auto rounded hover:bg-custom-sidebar-background-80">
              <ChevronRight
                className={cn("size-4 flex-shrink-0 text-custom-sidebar-text-400 transition-transform", {
                  "rotate-90": isWorkspaceMenuOpen,
                })}
              />
            </span>
          </Disclosure.Button>
        </div>
      )}

      <Transition
        show={isWorkspaceMenuOpen}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        {isWorkspaceMenuOpen && (
          <Disclosure.Panel>
            {SIDEBAR_WORKSPACE_MENU_ITEMS.map(
              (link) =>
                allowPermissions(link.access, EUserPermissionsLevel.WORKSPACE, workspaceSlug.toString()) && (
                  <Tooltip
                    key={link.key}
                    tooltipContent={link.label}
                    position="right"
                    className="ml-2"
                    disabled={!sidebarCollapsed}
                    isMobile={isMobile}
                  >
                    <Link href={link.href}>link</Link>
                  </Tooltip>
                )
            )}
          </Disclosure.Panel>
        )}
      </Transition>
    </Disclosure>
  );
});
