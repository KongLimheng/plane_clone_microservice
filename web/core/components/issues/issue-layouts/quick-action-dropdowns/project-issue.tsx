"use client";

import { useState } from "react";
import { omit } from "lodash";
import { observer } from "mobx-react";
import { usePathname } from "next/navigation";
import { Copy, ExternalLink, Link, Pencil, Trash2 } from "lucide-react";
import { TIssue } from "@plane/types";
import { ArchiveIcon, ContextMenu, setToast, TContextMenuItem, TOAST_TYPE } from "@plane/ui";
import { copyUrlToClipboard } from "@/helpers/string.helper";
import { useRouterParams, useUserPermissions } from "@/hooks/store";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";
import { IQuickActionProps } from "../list/list-view-types";

export const ProjectIssueQuickActions: React.FC<IQuickActionProps> = observer((props) => {
  const {
    issue,
    handleDelete,
    handleUpdate,
    handleArchive,
    customActionButton,
    portalElement,
    readOnly = false,
    placements = "bottom-end",
    parentRef,
  } = props;

  // router
  const { workspaceSlug } = useRouterParams();
  const pathname = usePathname();
  // states
  const [createUpdateIssueModal, setCreateUpdateIssueModal] = useState(false);
  const [issueToEdit, setIssueToEdit] = useState<TIssue | undefined>(undefined);
  const [deleteIssueModal, setDeleteIssueModal] = useState(false);
  const [archiveIssueModal, setArchiveIssueModal] = useState(false);
  // store hooks
  const { allowPermissions } = useUserPermissions();

  // auth
  const isEditingAllowed =
    allowPermissions([EUserPermissions.ADMIN, EUserPermissions.MEMBER], EUserPermissionsLevel.PROJECT) && !readOnly;
  const isArchivingAllowed = handleArchive && isEditingAllowed;
  // const isInArchivableGroup = !!stateDetails && ARCHIVABLE_STATE_GROUPS.includes(stateDetails?.group);
  const isDeletingAllowed = isEditingAllowed;

  const issueLink = `${workspaceSlug}/projects/${issue.project_id}/issues/${issue.id}`;
  const handleCopyIssueLink = () =>
    copyUrlToClipboard(issueLink).then(() =>
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Link copied",
        message: "Issue link copied to clipboard",
      })
    );
  const handleOpenInNewTab = () => window.open(`/${issueLink}`, "_blank");

  const isDraftIssue = pathname?.includes("draft-issues") || false;

  const duplicateIssuePayload = omit(
    {
      ...issue,
      name: `${issue.name} (copy)`,
      is_draft: isDraftIssue ? false : issue.is_draft,
      sourceIssueId: issue.id,
    },
    ["id"]
  );

  const MENU_ITEMS: TContextMenuItem[] = [
    {
      key: "edit",
      title: "Edit",
      icon: Pencil,
      action: () => {
        // setTrackElement(activeLayout);
        setIssueToEdit(issue);
        setCreateUpdateIssueModal(true);
      },
      shouldRender: isEditingAllowed,
    },
    {
      key: "make-a-copy",
      title: "Make a copy",
      icon: Copy,
      action: () => {
        // setTrackElement(activeLayout);
        setCreateUpdateIssueModal(true);
      },
      shouldRender: isEditingAllowed,
    },
    {
      key: "open-in-new-tab",
      title: "Open in new tab",
      icon: ExternalLink,
      action: handleOpenInNewTab,
    },
    {
      key: "copy-link",
      title: "Copy link",
      icon: Link,
      action: handleCopyIssueLink,
    },
    // {
    //   key: "archive",
    //   title: "Archive",
    //   description: isInArchivableGroup ? undefined : "Only completed or canceled\nissues can be archived",
    //   icon: ArchiveIcon,
    //   className: "items-start",
    //   iconClassName: "mt-1",
    //   action: () => setArchiveIssueModal(true),
    //   disabled: !isInArchivableGroup,
    //   shouldRender: isArchivingAllowed,
    // },
    {
      key: "delete",
      title: "Delete",
      icon: Trash2,
      action: () => {
        // setTrackElement(activeLayout);
        setDeleteIssueModal(true);
      },
      shouldRender: isDeletingAllowed,
    },
  ];
  return (
    <>
      <ContextMenu parentRef={parentRef} items={MENU_ITEMS} />
      {/* <Custo */}
    </>
  );
});
