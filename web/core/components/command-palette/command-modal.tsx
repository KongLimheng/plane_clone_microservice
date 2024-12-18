"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { FolderPlus, Search, Settings } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { IWorkspaceSearchResults } from "@plane/types";
import { Loader, ModalCore, ToggleSwitch, Tooltip } from "@plane/ui";
import { EmptyStateType } from "@/constants/empty-state";
import { cn } from "@/helpers/common.helper";
import { getTabIndex } from "@/helpers/tab-indices.helper";
import { useCommandPalette, useUser, useUserPermissions } from "@/hooks/store";
import { useAppRouter } from "@/hooks/use-app-router";
import useDebounce from "@/hooks/use-debounce";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";
import { WorkspaceService } from "@/plane-web/services";
import { EmptyState } from "../empty-state";
import {
  CommandPaletteSearchResults,
  CommandPaletteThemeActions,
  CommandPaletteWorkspaceSettingsActions,
} from "./actions";

const workspaceService = new WorkspaceService();

export const CommandModal = observer(() => {
  // hooks
  // const { workspaceProjectIds } = useProject();
  const { isMobile } = usePlatformOS();
  const { canPerformAnyCreateAction } = useUser();
  // states
  const [placeholder, setPlaceholder] = useState("Type a command or search...");
  const [resultsCount, setResultsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { allowPermissions } = useUserPermissions();

  const [results, setResults] = useState<IWorkspaceSearchResults>({
    results: {
      workspace: [],
      project: [],
      issue: [],
      cycle: [],
      module: [],
      issue_view: [],
      page: [],
    },
  });
  const [isWorkspaceLevel, setIsWorkspaceLevel] = useState(false);
  const [pages, setPages] = useState<string[]>([]);
  const { baseTabIndex } = getTabIndex(undefined, isMobile);

  const canPerformWorkspaceActions = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );
  // router params
  const { workspaceSlug, projectId, issueId } = useParams();
  // router
  const router = useAppRouter();
  const page = pages[pages.length - 1];

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { isCommandPaletteOpen, toggleCommandPaletteModal, toggleCreateIssueModal, toggleCreateProjectModal } =
    useCommandPalette();

  const closePalette = () => {
    toggleCommandPaletteModal(false);
    setSearchTerm("");
  };

  useEffect(() => {
    if (!workspaceSlug) return;
    setIsLoading(true);
    if (debouncedSearchTerm) {
      setIsSearching(true);
      workspaceService
        .searchWorkspace(workspaceSlug.toString(), {
          ...(projectId ? { project_id: projectId.toString() } : {}),
          search: debouncedSearchTerm,
          workspace_search: !projectId ? true : isWorkspaceLevel,
        })
        .then(({ results }) => {
          console.log(results, "res");
          setResults({ results });
          const count = Object.keys(results).reduce(
            (accumulator, key) => (results as any)[key].length + accumulator,
            0
          );
          setResultsCount(count);
        })
        .finally(() => {
          setIsLoading(false);
          setIsSearching(false);
        });
    } else {
      setResults({
        results: {
          workspace: [],
          project: [],
          issue: [],
          cycle: [],
          module: [],
          issue_view: [],
          page: [],
        },
      });
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [debouncedSearchTerm, workspaceSlug, isWorkspaceLevel, projectId]);

  const createNewWorkspace = () => {
    closePalette();
    router.push("/create-workspace");
  };

  return (
    <ModalCore isOpen={isCommandPaletteOpen} handleClose={closePalette}>
      <Command
        filter={(value, search) => {
          if (value.toLowerCase().includes(search.toLowerCase())) return 1;
          return 0;
        }}
        onKeyDown={(e) => {
          // when search term is not empty, esc should clear the search term
          if (e.key === "Escape" && searchTerm) setSearchTerm("");

          // when user tries to close the modal with esc
          if (e.key === "Escape" && !page && !searchTerm) closePalette();

          // Escape goes to previous page
          // Backspace goes to previous page when search is empty
          if (e.key === "Escape" || (e.key === "Backspace" && !searchTerm)) {
            e.preventDefault();
            setPages((pages) => pages.slice(0, -1));
            setPlaceholder("Type a command or search...");
          }
        }}
      >
        <div className={cn("flex gap-4 pb-0 sm:items-center")}>
          {projectId && (
            <Tooltip tooltipContent="Toggle workspace level search" isMobile={isMobile}>
              <div className="flex flex-shrink-0 cursor-progress items-center gap-1 self-end text-xs sm:self-center">
                <button className="flex-shrink-0" type={"button"}>
                  Workspace Level
                </button>
                <ToggleSwitch value={isWorkspaceLevel} onChange={() => setIsWorkspaceLevel((prevData) => !prevData)} />
              </div>
            </Tooltip>
          )}
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-custom-text-200"
            aria-hidden="true"
            strokeWidth={2}
          />

          <Command.Input
            className="w-full border-0 border-b border-custom-border-200 bg-transparent p-4 pl-11 text-sm text-custom-text-100 outline-none placeholder:text-custom-text-400 focus:ring-0"
            placeholder={placeholder}
            value={searchTerm}
            onValueChange={(e) => setSearchTerm(e)}
            autoFocus
            tabIndex={baseTabIndex}
          />
        </div>

        <Command.List className="vertical-scrollbar scrollbar-sm max-h-96 overflow-scroll p-2">
          {searchTerm !== "" && (
            <h5 className="mx-[3px] my-4 text-xs text-custom-text-100">
              Search results for{" "}
              <span className="font-medium">
                {'"'}
                {searchTerm}
                {'"'}
              </span>{" "}
              {/* in {!projectId || isWorkspaceLevel ? "workspace" : "project"}: */}
            </h5>
          )}

          {!isLoading && resultsCount === 0 && searchTerm !== "" && debouncedSearchTerm !== "" && (
            <div className="flex flex-col items-center justify-center px-3 py-8 text-center">
              <EmptyState type={EmptyStateType.COMMAND_K_SEARCH_EMPTY_STATE} layout="screen-simple" />
            </div>
          )}

          {(isLoading || isSearching) && (
            <Command.Loading>
              <Loader className="space-y-3">
                <Loader.Item height="40px" />
                <Loader.Item height="40px" />
                <Loader.Item height="40px" />
                <Loader.Item height="40px" />
              </Loader>
            </Command.Loading>
          )}

          {debouncedSearchTerm !== "" && <CommandPaletteSearchResults results={results} closePalette={closePalette} />}

          {!page && (
            <>
              {workspaceSlug && canPerformWorkspaceActions && (
                <Command.Group heading="Project">
                  <Command.Item
                    onSelect={() => {
                      closePalette();
                      toggleCreateProjectModal(true);
                    }}
                    className="focus:outline-none"
                  >
                    <div className="flex items-center gap-2 text-custom-text-200">
                      <FolderPlus className="size-3.5" />
                      Create new project
                    </div>
                    <kbd>P</kbd>
                  </Command.Item>
                </Command.Group>
              )}
              {/* project actions */}
              {projectId && canPerformAnyCreateAction && <div>cmd project</div>}
              {canPerformWorkspaceActions && (
                <Command.Group heading="Workspace Settings">
                  <Command.Item
                    onSelect={() => {
                      setPlaceholder("Search workspace settings...");
                      setSearchTerm("");
                      setPages([...pages, "settings"]);
                    }}
                  >
                    <div className="flex items-center gap-2 text-custom-text-200">
                      <Settings className="size-3.5" />
                      Search settings...
                    </div>
                  </Command.Item>
                </Command.Group>
              )}

              <Command.Group heading="Account">
                <Command.Item onSelect={createNewWorkspace} className="focus:outline-none">
                  <div className="flex items-center gap-2 text-custom-text-200">
                    <FolderPlus className="h-3.5 w-3.5" />
                    Create new workspace
                  </div>
                </Command.Item>
                <Command.Item
                  onSelect={() => {
                    setPlaceholder("Change interface theme...");
                    setSearchTerm("");
                    setPages([...pages, "change-interface-theme"]);
                  }}
                  className="focus:outline-none"
                >
                  <div className="flex items-center gap-2 text-custom-text-200">
                    <Settings className="h-3.5 w-3.5" />
                    Change interface theme...
                  </div>
                </Command.Item>
              </Command.Group>

              {/* help options */}
            </>
          )}

          {/* workspace settings actions */}
          {page === "settings" && workspaceSlug && (
            <CommandPaletteWorkspaceSettingsActions closePalette={closePalette} />
          )}

          {/* issue details page actions */}
          {/* {page === "change-issue-state" && issueDetails && (
            <ChangeIssueState closePalette={closePalette} issue={issueDetails} />
          )} */}

          {/* theme actions */}
          {page === "change-interface-theme" && (
            <CommandPaletteThemeActions
              closePalette={() => {
                closePalette();
                setPages((pages) => pages.slice(0, -1));
              }}
            />
          )}
        </Command.List>
      </Command>
    </ModalCore>
  );
});
