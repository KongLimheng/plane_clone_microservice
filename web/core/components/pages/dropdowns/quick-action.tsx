"use client";

import { useState } from "react";
import { observer } from "mobx-react";
import { ArchiveRestoreIcon, ExternalLink, Link, Trash2, UsersRound, Lock } from "lucide-react";
import { ArchiveIcon, ContextMenu, CustomMenu, setToast, TContextMenuItem, TOAST_TYPE } from "@plane/ui";
import { copyUrlToClipboard } from "@/helpers/string.helper";
import { IPage } from "@/store/pages/page";

type Props = {
  page: IPage;
  pageLink: string;
  parentRef: React.RefObject<HTMLElement>;
};

export const PageQuickActions = observer(({ page, pageLink, parentRef }: Props) => {
  // states
  const [deletePageModal, setDeletePageModal] = useState(false);
  // store hooks
  const {
    access,
    archive,
    archived_at,
    makePublic,
    makePrivate,
    restore,
    canCurrentUserArchivePage,
    canCurrentUserChangeAccess,
    canCurrentUserDeletePage,
  } = page;

  const handleCopyText = () =>
    copyUrlToClipboard(pageLink).then(() => {
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Link Copied!",
        message: "Page link copied to clipboard.",
      });
    });
  const handleOpenInNewTab = () => window.open(`/${pageLink}`, "_blank");

  const MENU_ITEMS: TContextMenuItem[] = [
    {
      key: "make-public-private",
      action: async () => {
        const changedPageType = access === 0 ? "private" : "public";

        try {
          if (access === 0) await makePrivate();
          else await makePublic();

          setToast({
            type: TOAST_TYPE.SUCCESS,
            title: "Success!",
            message: `The page has been marked ${changedPageType} and moved to the ${changedPageType} section.`,
          });
        } catch (err) {
          setToast({
            type: TOAST_TYPE.ERROR,
            title: "Error!",
            message: `The page couldn't be marked ${changedPageType}. Please try again.`,
          });
        }
      },
      title: access === 0 ? "Make private" : "Make public",
      icon: access === 0 ? Lock : UsersRound,
      shouldRender: canCurrentUserChangeAccess && !archived_at,
    },
    {
      key: "open-new-tab",
      action: handleOpenInNewTab,
      title: "Open in new tab",
      icon: ExternalLink,
      shouldRender: true,
    },
    {
      key: "copy-link",
      action: handleCopyText,
      title: "Copy link",
      icon: Link,
      shouldRender: true,
    },
    {
      key: "archive-restore",
      action: archived_at ? restore : archive,
      title: archived_at ? "Restore" : "Archive",
      icon: archived_at ? ArchiveRestoreIcon : ArchiveIcon,
      shouldRender: canCurrentUserArchivePage,
    },
    {
      key: "delete",
      action: () => setDeletePageModal(true),
      title: "Delete",
      icon: Trash2,
      shouldRender: canCurrentUserDeletePage && !!archived_at,
    },
  ];

  return (
    <>
      <ContextMenu parentRef={parentRef} items={MENU_ITEMS} />
      <CustomMenu placement="bottom-end" ellipsis closeOnSelect>
        {MENU_ITEMS.map((item) => {
          if (!item.shouldRender) return null;
          return (
            <CustomMenu.MenuItem
              key={item.key}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                item.action();
              }}
              className="flex items-center gap-2"
              disabled={item.disabled}
            >
              {item.icon && <item.icon className="size-3" />}
              {item.title}
            </CustomMenu.MenuItem>
          );
        })}
      </CustomMenu>
    </>
  );
});