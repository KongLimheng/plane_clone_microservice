"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { IProject } from "@plane/types";
import { EModalWidth, ModalCore } from "@plane/ui";
import { useUserPermissions } from "@/hooks/store";
import { useProject } from "@/hooks/store/use-project";
import { useAppRouter } from "@/hooks/use-app-router";

// type
type TJoinProjectModalProps = {
  isOpen: boolean;
  workspaceSlug: string;
  project: IProject;
  handleClose: () => void;
};

export const JoinProjectModal = ({ isOpen, workspaceSlug, project, handleClose }: TJoinProjectModalProps) => {
  // states
  const [isJoiningLoading, setIsJoiningLoading] = useState(false);
  // store hooks
  // const { joinProject } = useUserPermissions();
  const { fetchProjects } = useProject();
  // router
  const router = useAppRouter();

  return (
    <ModalCore isOpen={isOpen} handleClose={handleClose} width={EModalWidth.XXL}>
      <div className="space-y-5">
        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-custom-text-100">
          Join Project?
        </Dialog.Title>

        <p>
          Are you sure you want to join the project <span className="break-words font-semibold">{project?.name}</span>?
          Please click the &apos;Join Project&apos; button below to continue.
        </p>
        <div className="space-y-3" />
      </div>
    </ModalCore>
  );
};
