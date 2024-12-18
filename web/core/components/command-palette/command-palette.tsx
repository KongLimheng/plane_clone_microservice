"use client";

import { FC, useCallback, useEffect, useMemo } from "react";
import { observer } from "mobx-react";
import { useParams, usePathname } from "next/navigation";
import useSWR from "swr";
import { setToast, TOAST_TYPE } from "@plane/ui";
import { ISSUE_DETAILS } from "@/constants/fetch-key";
import { copyTextToClipboard } from "@/helpers/string.helper";
import {
  useAppTheme,
  useCommandPalette,
  useRouterParams,
  useUser,
  useUserPermissions,
  useWorkspace,
} from "@/hooks/store";
import { useAppRouter } from "@/hooks/use-app-router";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";
import { IssueService } from "@/services/issue";
import { CreateUpdateIssueModal } from "../issues";
import { CreateProjectModal } from "../project";
import { CommandModal } from "./command-modal";
import { ShortcutsModal } from "./shortcuts-modal";

const issueService = new IssueService();

export const CommandPalette: FC = observer(() => {
  // router
  const router = useAppRouter();

  // pathname
  const pathname = usePathname();
  // router params
  const { workspaceSlug, projectId, issueId, cycleId, moduleId } = useParams();
  // store hooks
  const { toggleSidebar } = useAppTheme();
  // const { setTrackElement } = useEventTracker();
  const { platform } = usePlatformOS();
  const { data: currentUser, canPerformAnyCreateAction } = useUser();

  const {
    toggleCommandPaletteModal,
    isCreateIssueModalOpen,
    toggleCreateIssueModal,
    isCreateCycleModalOpen,
    toggleCreateCycleModal,
    createPageModal,
    toggleCreatePageModal,
    isCreateProjectModalOpen,
    toggleCreateProjectModal,
    isCreateModuleModalOpen,
    toggleCreateModuleModal,
    isCreateViewModalOpen,
    toggleCreateViewModal,
    isShortcutModalOpen,
    toggleShortcutModal,
    isBulkDeleteIssueModalOpen,
    toggleBulkDeleteIssueModal,
    isDeleteIssueModalOpen,
    toggleDeleteIssueModal,
    isAnyModalOpen,
  } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();

  // const { data: issueDetails } = useSWR(
  //   workspaceSlug && projectId && issueId ? ISSUE_DETAILS(issueId as string) : null,
  //   workspaceSlug && projectId && issueId
  //     ? () => issueService.retrieve(workspaceSlug as string, projectId as string, issueId as string)
  //     : null
  // );

  // derived values
  const canPerformWorkspaceMemberActions = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );
  const canPerformProjectMemberActions = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.PROJECT
  );
  const canPerformProjectAdminActions = allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.PROJECT);

  const copyIssueUrlToClipboard = useCallback(() => {
    if (!issueId) return;

    const url = new URL(window.location.href);
    copyTextToClipboard(url.href)
      .then(() => {
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Copied to clipboard",
        });
      })
      .catch(() => {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Some error occurred",
        });
      });
  }, [issueId]);

  // auth
  const performProjectCreateActions = useCallback(
    (showToast: boolean = true) => {
      if (!canPerformProjectMemberActions && showToast)
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "You don't have permission to perform this action.",
        });

      return canPerformProjectMemberActions;
    },
    [canPerformProjectMemberActions]
  );

  const performProjectBulkDeleteActions = useCallback(
    (showToast: boolean = true) => {
      if (!canPerformProjectAdminActions && projectId && showToast)
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "You don't have permission to perform this action.",
        });

      return canPerformProjectAdminActions;
    },
    [canPerformProjectAdminActions, projectId]
  );

  const performWorkspaceCreateActions = useCallback(
    (showToast: boolean = true) => {
      if (!canPerformWorkspaceMemberActions && showToast)
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "You don't have permission to perform this action.",
        });
      return canPerformWorkspaceMemberActions;
    },
    [canPerformWorkspaceMemberActions]
  );

  const performAnyProjectCreateActions = useCallback(
    (showToast: boolean = true) => {
      if (!canPerformAnyCreateAction && showToast)
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "You don't have permission to perform this action.",
        });
      return canPerformAnyCreateAction;
    },
    [canPerformAnyCreateAction]
  );

  const shortcutsList: {
    global: Record<string, { title: string; description: string; action: () => void }>;
    workspace: Record<string, { title: string; description: string; action: () => void }>;
    project: Record<string, { title: string; description: string; action: () => void }>;
  } = useMemo(
    () => ({
      global: {
        c: {
          title: "Create a new issue",
          description: "Create a new issue in the current project",
          action: () => toggleCreateIssueModal(true),
        },
      },
      workspace: {
        p: {
          title: "Create a new project",
          description: "Create a new project in the current workspace",
          action: () => toggleCreateProjectModal(true),
        },
      },
      project: {
        d: {
          title: "Create a new page",
          description: "Create a new page in the current project",
          action: () => toggleCreatePageModal({ isOpen: true }),
        },
        m: {
          title: "Create a new module",
          description: "Create a new module in the current project",
          action: () => toggleCreateModuleModal(true),
        },
        q: {
          title: "Create a new cycle",
          description: "Create a new cycle in the current project",
          action: () => toggleCreateCycleModal(true),
        },
        v: {
          title: "Create a new view",
          description: "Create a new view in the current project",
          action: () => toggleCreateViewModal(true),
        },
        backspace: {
          title: "Bulk delete issues",
          description: "Bulk delete issues in the current project",
          action: () => toggleBulkDeleteIssueModal(true),
        },
        delete: {
          title: "Bulk delete issues",
          description: "Bulk delete issues in the current project",
          action: () => toggleBulkDeleteIssueModal(true),
        },
      },
    }),
    [
      toggleBulkDeleteIssueModal,
      toggleCreateCycleModal,
      toggleCreateIssueModal,
      toggleCreateModuleModal,
      toggleCreatePageModal,
      toggleCreateProjectModal,
      toggleCreateViewModal,
    ]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, altKey, shiftKey } = e;
      if (!key) return;

      const keyPressed = key.toLowerCase();
      const cmdClicked = ctrlKey || metaKey;
      const shiftClicked = shiftKey;
      const deleteKey = keyPressed === "backspace" || keyPressed === "delete";

      if (cmdClicked && keyPressed === "k" && !isAnyModalOpen) {
        e.preventDefault();
        toggleCommandPaletteModal(true);
      }

      // if on input, textarea or editor, don't do anything
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement ||
        (e.target as Element)?.classList?.contains("ProseMirror")
      )
        return;

      if (shiftClicked && (keyPressed === "?" || keyPressed === "/") && !isAnyModalOpen) {
        e.preventDefault();
        toggleShortcutModal(true);
      }

      if (deleteKey) {
      } else if (cmdClicked) {
      } else if (!isAnyModalOpen) {
        // setTrackElement("Shortcut key");

        if (
          Object.keys(shortcutsList.global).includes(keyPressed) &&
          ((!projectId && performAnyProjectCreateActions()) || performProjectCreateActions())
        ) {
          shortcutsList.global[keyPressed].action();
        }
        // workspace authorized actions
        else if (
          Object.keys(shortcutsList.workspace).includes(keyPressed) &&
          workspaceSlug &&
          performWorkspaceCreateActions()
        ) {
          e.preventDefault();
          shortcutsList.workspace[keyPressed].action();
        }

        // project authorized actions
        else if (
          Object.keys(shortcutsList.project).includes(keyPressed) &&
          projectId &&
          performProjectCreateActions()
        ) {
          e.preventDefault();
          // actions that can be performed only inside a project
          shortcutsList.project[keyPressed].action();
        }
      }
    },
    [
      isAnyModalOpen,
      performAnyProjectCreateActions,
      performProjectCreateActions,
      performWorkspaceCreateActions,
      projectId,
      shortcutsList,
      toggleCommandPaletteModal,
      toggleShortcutModal,
      workspaceSlug,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const isDraftIssue = pathname?.includes("draft-issues") || false;
  if (!currentUser) return null;
  return (
    <>
      <ShortcutsModal isOpen={isShortcutModalOpen} onClose={toggleShortcutModal} />
      {workspaceSlug && (
        <CreateProjectModal
          onClose={() => toggleCreateProjectModal(false)}
          isOpen={isCreateProjectModalOpen}
          workspaceSlug={workspaceSlug.toString()}
        />
      )}

      <CreateUpdateIssueModal
        isOpen={isCreateIssueModalOpen}
        onClose={() => toggleCreateIssueModal(false)}
        isDraft={isDraftIssue}
        data={cycleId ? { cycle_id: cycleId.toString() } : moduleId ? { module_ids: [moduleId.toString()] } : undefined}
      />
      <CommandModal />
    </>
  );
});
