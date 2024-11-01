"use client";
import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, LogOut, MoveLeft, Plus, UserPlus } from "lucide-react";
import { useOutsideClickDetector } from "@plane/helpers";
import { setToast, TOAST_TYPE, Tooltip } from "@plane/ui";
import { SidebarNavItem } from "@/components/sidebar";
import { PROFILE_ACTION_LINKS } from "@/constants/profile";
import { cn } from "@/helpers/common.helper";
import { useAppTheme, useUser, useUserSettings, useWorkspace } from "@/hooks/store";
import { usePlatformOS } from "@/hooks/use-platform-os";

const WORKSPACE_ACTION_LINKS = [
  {
    key: "create-workspace",
    Icon: Plus,
    label: "Create workspace",
    href: "/create-workspace",
  },
  {
    key: "invitations",
    Icon: UserPlus,
    label: "Invitations",
    href: "/invitations",
  },
];

export const ProfileLayoutSidebar = observer(() => {
  // states
  const [isSigningOut, setIsSigningOut] = useState(false);
  // router
  const pathname = usePathname();
  // store hooks
  const { sidebarCollapsed, toggleSidebar } = useAppTheme();
  const { data: currentUser, signOut } = useUser();
  const { data: currentUserSettings } = useUserSettings();
  const { workspaces } = useWorkspace();
  const { isMobile } = usePlatformOS();

  // redirect url for normal mode
  const redirectWorkspaceSlug =
    currentUserSettings?.workspace?.last_workspace_slug ||
    currentUserSettings?.workspace?.fallback_workspace_slug ||
    "";

  const ref = useRef<HTMLDivElement>(null);

  const workspacesList = Object.values(workspaces ?? {});

  const handleSignOut = () => {
    setIsSigningOut(true);
    signOut()
      .catch(() =>
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: "Failed to sign out. Please try again.",
        })
      )
      .finally(() => setIsSigningOut(false));
  };

  useOutsideClickDetector(ref, () => {
    if (sidebarCollapsed === false) {
      if (window.innerWidth < 768) {
        toggleSidebar();
      }
    }
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        toggleSidebar(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [toggleSidebar]);

  const handleItemClick = () => {
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 z-20 flex h-full flex-shrink-0 flex-grow-0 flex-col border-r border-custom-sidebar-border-200 bg-custom-sidebar-background-100 duration-300 md:relative",
        {
          "-ml-[250px]": sidebarCollapsed,
        },
        `sm:${sidebarCollapsed ? "-ml-[250px]" : ""}`,
        `md:ml-0 ${sidebarCollapsed ? "w-[70px]" : "w-[250px]"}`
      )}
    >
      <div ref={ref} className="flex h-full w-full flex-col gap-y-4">
        <Link href={`/${redirectWorkspaceSlug}`} onClick={handleItemClick}>
          <div
            className={cn("flex flex-shrink-0 items-center gap-2 truncate px-4 pt-4", {
              "justify-center": sidebarCollapsed,
            })}
          >
            <span className="grid h-5 w-5 flex-shrink-0 place-items-center">
              <ChevronLeft className="h-5 w-5" strokeWidth={1} />
            </span>
            {!sidebarCollapsed && (
              <h4 className="truncate text-lg font-semibold text-custom-text-200">Profile settings</h4>
            )}
          </div>
        </Link>

        <div className="flex flex-shrink-0 flex-col overflow-x-hidden">
          {!sidebarCollapsed && (
            <h6 className="rounded px-6 text-sm font-semibold text-custom-sidebar-text-400">Your account</h6>
          )}

          <div className="vertical-scrollbar scrollbar-sm mt-2 px-4 h-full space-y-1 overflow-y-auto">
            {PROFILE_ACTION_LINKS.map(({ key, label, href, highlight, Icon }) => {
              if (key === "change-password" && currentUser?.is_password_autoset) return null;
              return (
                <Link key={key} href={href} className="block w-full">
                  <Tooltip
                    tooltipContent={label}
                    position="right"
                    className="ml-2"
                    disabled={!sidebarCollapsed}
                    isMobile={isMobile}
                  >
                    <SidebarNavItem
                      key={key}
                      className={cn({ "p-0 size-8 aspect-square justify-center mx-auto": sidebarCollapsed })}
                      isActive={highlight(pathname)}
                    >
                      <div className="flex items-center gap-1.5 py-[1px]">
                        <Icon className="size-4" />
                        {!sidebarCollapsed && <p className="text-sm leading-5 font-medium">{label}</p>}
                      </div>
                    </SidebarNavItem>
                  </Tooltip>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col overflow-x-hidden">
          {!sidebarCollapsed && (
            <h6 className="rounded px-6 text-sm font-semibold text-custom-sidebar-text-400">Workspaces</h6>
          )}

          {workspacesList && workspacesList.length > 0 && (
            <div
              className={cn("vertical-scrollbar scrollbar-xs mt-2 px-4 h-full space-y-1.5 overflow-y-auto", {
                "scrollbar-sm": !sidebarCollapsed,
                "ml-2.5 px-1": sidebarCollapsed,
              })}
            >
              {workspacesList.map((workspace) => (
                <Link key={workspace.id} href={`/${workspace.id}`}>
                  <span>{workspace.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 flex-grow items-end px-6 py-2">
        <div
          className={cn(
            "flex w-full",
            sidebarCollapsed ? "flex-col justify-center gap-2" : "items-center justify-between gap-2"
          )}
        >
          <button
            className="flex items-center justify-center gap-2 text-sm font-medium text-red-500 "
            type="button"
            disabled={isSigningOut}
            onClick={handleSignOut}
          >
            <LogOut className="h-3.5 w-3.5" />
            {!sidebarCollapsed && <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>}
          </button>

          <button
            type="button"
            className="grid place-items-center rounded-md p-1.5 text-custom-text-200 outline-none hover:bg-custom-background-90 hover:text-custom-text-100 md:hidden"
            onClick={() => toggleSidebar()}
          >
            <MoveLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={`ml-auto hidden place-items-center rounded-md p-1.5 text-custom-text-200 outline-none hover:bg-custom-background-90 hover:text-custom-text-100 md:grid ${
              sidebarCollapsed ? "w-full" : ""
            }`}
            onClick={() => toggleSidebar()}
          >
            <MoveLeft className={`h-3.5 w-3.5 duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
});
