"use client";

import { useState } from "react";
import { observer } from "mobx-react";
import { usePathname } from "next/navigation";
import { TIssue } from "@plane/types";
import { useIssueModal } from "@/hooks/context/use-issue-modal";
import { useRouterParams } from "@/hooks/store";
import { ConfirmIssueDiscard } from "../confirm-issue-discard";
import { IssueFormRoot } from "./form";

export interface DraftIssueProps {
  changesMade: Partial<TIssue> | null;
  data?: Partial<TIssue>;
  issueTitleRef: React.MutableRefObject<HTMLInputElement | null>;
  isCreateMoreToggleEnabled: boolean;
  onAssetUpload: (assetId: string) => void;
  onCreateMoreToggleChange: (value: boolean) => void;
  onChange: (formData: Partial<TIssue> | null) => void;
  onClose: (saveDraftIssueInLocalStorage?: boolean) => void;
  onSubmit: (formData: Partial<TIssue>, is_draft_issue?: boolean) => Promise<void>;
  projectId: string;
  isDraft: boolean;
  moveToIssue?: boolean;
  modalTitle?: string;
  primaryButtonText?: {
    default: string;
    loading: string;
  };
  isDuplicateModalOpen: boolean;
  handleDuplicateIssueModal: (isOpen: boolean) => void;
  isProjectSelectionDisabled?: boolean;
}

export const DraftIssueLayout = observer(
  ({
    changesMade,
    data,
    issueTitleRef,
    onAssetUpload,
    onChange,
    onClose,
    onSubmit,
    projectId,
    isCreateMoreToggleEnabled,
    onCreateMoreToggleChange,
    isDraft,
    moveToIssue = false,
    modalTitle,
    primaryButtonText,
    isDuplicateModalOpen,
    handleDuplicateIssueModal,
    isProjectSelectionDisabled = false,
  }: DraftIssueProps) => {
    // states
    const [issueDiscardModal, setIssueDiscardModal] = useState(false);
    // router params
    const { workspaceSlug } = useRouterParams();
    // pathname
    const pathname = usePathname();
    // store hooks
    const { handleCreateUpdatePropertyValues } = useIssueModal();
    // const { createIssue } = useWorkspaceDraftIssues();
    const handleCreateDraftIssue = async () => {};

    const handleClose = () => {};

    return (
      <>
        <ConfirmIssueDiscard
          isOpen={issueDiscardModal}
          handleClose={() => setIssueDiscardModal(false)}
          onConfirm={handleCreateDraftIssue}
          onDiscard={() => {
            onChange(null);
            setIssueDiscardModal(false);
            onClose(false);
          }}
        />

        <IssueFormRoot
          isCreateMoreToggleEnabled={isCreateMoreToggleEnabled}
          onCreateMoreToggleChange={onCreateMoreToggleChange}
          data={data}
          issueTitleRef={issueTitleRef}
          onAssetUpload={onAssetUpload}
          onChange={onChange}
          onSubmit={onSubmit}
          onClose={handleClose}
          projectId={projectId}
          isDraft={isDraft}
          moveToIssue={moveToIssue}
          modalTitle={modalTitle}
          primaryButtonText={primaryButtonText}
          isDuplicateModalOpen={isDuplicateModalOpen}
          handleDuplicateIssueModal={handleDuplicateIssueModal}
          isProjectSelectionDisabled={isProjectSelectionDisabled}
        />
      </>
    );
  }
);
