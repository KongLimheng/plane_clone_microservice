import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { FileText, HelpCircle, MessagesSquare, MoveLeft, User } from "lucide-react";
import { CustomMenu, ToggleSwitch, Tooltip } from "@plane/ui";
import { cn } from "@/helpers/common.helper";
import { useAppTheme, useCommandPalette, useUserSettings } from "@/hooks/store";
import { useInstance } from "@/hooks/store/use-instance";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { PlaneVersionNumber } from "@/plane-web/components/global";
import { WorkspaceEditionBadge } from "@/plane-web/components/workspace";
import { ENABLE_LOCAL_DB_CACHE } from "@/plane-web/constants/issues";

export interface WorkspaceHelpSectionProps {
  setSidebarActive?: React.Dispatch<React.SetStateAction<boolean>>;
}
export const SidebarHelpSection: React.FC<WorkspaceHelpSectionProps> = observer(() => {
  const { workspaceSlug, projectId } = useParams();
  // store hooks
  const { sidebarCollapsed, toggleSidebar } = useAppTheme();
  const { toggleShortcutModal } = useCommandPalette();
  const { isMobile } = usePlatformOS();
  const { config } = useInstance();
  //  const { isIntercomToggle, toggleIntercom } = useTransient();
  const { canUseLocalDB, toggleLocalDB } = useUserSettings();
  // states
  const [isNeedHelpOpen, setIsNeedHelpOpen] = useState(false);
  const [isChangeLogOpen, setIsChangeLogOpen] = useState(false);

  const isCollapsed = sidebarCollapsed || false;

  return (
    <>
      {/* product update modal */}
      <div
        className={cn(
          "flex w-full items-center justify-between px-2 self-baseline border-t border-custom-border-200 bg-custom-sidebar-background-100 flex-shrink-0 h-12",
          { "flex-col h-auto py-1.5": isCollapsed }
        )}
      >
        <div
          className={cn(
            "relative flex flex-shrink-0 items-center gap-1",
            isCollapsed ? "flex-col justify-center" : "justify-evenly"
          )}
        >
          <CustomMenu
            customButton={
              <button
                type="button"
                className={cn(
                  "grid place-items-center rounded-md p-1 outline-none text-custom-text-200 hover:text-custom-text-100 hover:bg-custom-background-90",
                  {
                    "bg-custom-background-90": isNeedHelpOpen,
                  }
                )}
              >
                <Tooltip tooltipContent="Help" isMobile={isMobile} disabled={isNeedHelpOpen}>
                  <HelpCircle className="h-[18px] w-[18px] outline-none" />
                </Tooltip>
              </button>
            }
            customButtonClassName={`relative grid place-items-center rounded-md p-1 outline-none ${isCollapsed && "w-full"}`}
            menuButtonOnClick={() => !isNeedHelpOpen && setIsNeedHelpOpen(true)}
            onMenuClose={() => setIsNeedHelpOpen(false)}
            placement={isCollapsed ? "left-end" : "top-end"}
            maxHeight="lg"
            closeOnSelect
          >
            <CustomMenu.MenuItem>
              <a
                href="https://go.plane.so/p-docs"
                target="_blank"
                className="flex items-center gap-x-2 rounded text-xs hover:bg-custom-background-80"
              >
                <FileText className="size-3.5 text-custom-text-200" />
                <span className="text-xs">Documentation</span>
              </a>
            </CustomMenu.MenuItem>

            {config?.intercom_app_id && config.is_intercom_enabled && (
              <CustomMenu.MenuItem>
                <button
                  type="button"
                  // onClick={handleCrispWindowShow}
                  className="flex w-full items-center gap-x-2 rounded text-xs hover:bg-custom-background-80"
                >
                  <MessagesSquare className="h-3.5 w-3.5 text-custom-text-200" />
                  <span className="text-xs">Message support</span>
                </button>
              </CustomMenu.MenuItem>
            )}

            <CustomMenu.MenuItem>
              <a
                href="mailto:sales@plane.so"
                target="_blank"
                className="flex items-center gap-x-2 rounded text-xs hover:bg-custom-background-80"
              >
                <User className="h-3.5 w-3.5 text-custom-text-200" />
                <span className="text-xs">Contact sales</span>
              </a>
            </CustomMenu.MenuItem>
            <div className="my-1 border-t border-custom-border-200" />
            {!ENABLE_LOCAL_DB_CACHE && (
              <CustomMenu.MenuItem>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="flex w-full items-center justify-between text-xs hover:bg-custom-background-80"
                >
                  <span className="racking-tight">Local Cache</span>
                  <ToggleSwitch
                    value={canUseLocalDB}
                    onChange={() => {
                      toggleLocalDB(workspaceSlug?.toString(), projectId?.toString());
                    }}
                  />
                </div>
              </CustomMenu.MenuItem>
            )}
            <CustomMenu.MenuItem>
              <button
                type="button"
                onClick={() => toggleShortcutModal(true)}
                className="flex w-full items-center justify-start text-xs hover:bg-custom-background-80"
              >
                <span className="text-xs">Keyboard shortcuts</span>
              </button>
            </CustomMenu.MenuItem>
            <CustomMenu.MenuItem>
              <a
                href="https://go.plane.so/p-discord"
                target="_blank"
                className="flex items-center justify- gap-x-2 rounded text-xs hover:bg-custom-background-80"
              >
                <span className="text-xs">Discord</span>
              </a>
            </CustomMenu.MenuItem>

            <div className="px-1 pt-2 mt-1 text-xs text-custom-text-200 border-t border-custom-border-200">
              <PlaneVersionNumber />
            </div>
          </CustomMenu>
        </div>

        <div
          className={cn("w-full flex-grow px-0.5", {
            hidden: isCollapsed,
          })}
        >
          <WorkspaceEditionBadge />
        </div>

        <div
          className={cn(
            "flex flex-shrink-0 items-center gap-1",
            isCollapsed ? "flex-col justify-center" : "justify-evenly"
          )}
        >
          <Tooltip tooltipContent={`${isCollapsed ? "Expand" : "Hide"}`} isMobile={isMobile}>
            <button
              className={cn(
                "grid place-items-center rounded-md p-1 text-custom-text-200 outline-none hover:bg-custom-background-90 hover:text-custom-text-100",
                { "w-full": isCollapsed }
              )}
              type="button"
              onClick={() => toggleSidebar()}
            >
              <MoveLeft className={cn("size-4 duration-300", { "rotate-180": isCollapsed })} />
            </button>
          </Tooltip>
        </div>
      </div>
    </>
  );
});
