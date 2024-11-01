"use client";

import { FC } from "react";
import { observer } from "mobx-react";
import { useParams, usePathname } from "next/navigation";
import { useCommandPalette, useRouterParams, useWorkspace } from "@/hooks/store";
import { useAppRouter } from "@/hooks/use-app-router";
import { ShortcutsModal } from "./shortcuts-modal";

export const CommandPalette: FC = observer(() => {
  // router
  const router = useAppRouter();

  const { isShortcutModalOpen, toggleShortcutModal } = useCommandPalette();
  // pathname
  const pathname = usePathname();
  const { workspaceSlug, projectId, query } = useRouterParams();

  return (
    <>
      <ShortcutsModal isOpen={isShortcutModalOpen} onClose={toggleShortcutModal} />
    </>
  );
});
