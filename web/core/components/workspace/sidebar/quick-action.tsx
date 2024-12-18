import { useRef, useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { HandMetal, PenSquare, Search } from "lucide-react";
import { cn } from "@/helpers/common.helper";
import { useAppTheme, useCommandPalette, useUserPermissions } from "@/hooks/store";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";

export const SidebarQuickActions = observer(() => {
  // states
  const [isDraftIssueModalOpen, setIsDraftIssueModalOpen] = useState(false);
  const [isDraftButtonOpen, setIsDraftButtonOpen] = useState(false);

  const timeoutRef = useRef<any>();

  // router
  const { workspaceSlug: routerWorkspaceSlug } = useParams();
  const workspaceSlug = routerWorkspaceSlug?.toString();
  // store hooks
  const { toggleCreateIssueModal, toggleCommandPaletteModal } = useCommandPalette();
  const { sidebarCollapsed: isSidebarCollapsed } = useAppTheme();
  // const { joinedProjectIds } = useProject();
  const { allowPermissions } = useUserPermissions();

  // local storage
  // const workspaceDraftIssue = workspaceSlug ? (storedValue?.[workspaceSlug] ?? undefined) : undefined;

  const handleMouseEnter = () => {
    // if enter before time out clear the timeout
    timeoutRef?.current && clearTimeout(timeoutRef.current);
    setIsDraftButtonOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDraftButtonOpen(false);
    }, 300);
  };
  // derived values
  const canCreateIssue = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  const disabled = false || !canCreateIssue;

  return (
    <>
      <div
        className={cn("flex items-center justify-between gap-1 cursor-pointer", {
          "flex-col gap-0": isSidebarCollapsed,
        })}
      >
        <div
          className={cn(
            "relative flex-grow flex justify-between items-center gap-1 rounded h-8 hover:bg-custom-sidebar-background-90",
            {
              "size-8 aspect-square": isSidebarCollapsed,
              "px-3 border-[0.5px] border-custom-sidebar-border-300": !isSidebarCollapsed,
            }
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className={cn(
              "flex relative flex-shrink-0 flex-grow items-center gap-2 text-custom-sidebar-text-300 rounded outline-none",
              {
                "justify-center": isSidebarCollapsed,
                "cursor-not-allowed opacity-50": disabled,
              }
            )}
            type="button"
            onClick={() => {
              toggleCreateIssueModal(true);
            }}
          >
            <PenSquare className="size-4" />
            {!isSidebarCollapsed && <span className="text-sm font-medium">New issue</span>}
          </button>
        </div>

        <button
          className={cn(
            "flex-shrink-0 size-8 aspect-square grid place-items-center rounded hover:bg-custom-sidebar-background-90 outline-none",
            {
              "border-[0.5px] border-custom-sidebar-border-300": !isSidebarCollapsed,
            }
          )}
          onClick={() => toggleCommandPaletteModal(true)}
        >
          <Search className="size-4 text-custom-sidebar-text-300" />
        </button>
      </div>
    </>
  );
});
