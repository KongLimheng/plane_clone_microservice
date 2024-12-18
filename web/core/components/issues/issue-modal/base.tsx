"use client";

import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { TIssue } from "@plane/types";
import { EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
import { useRouterParams, useUser } from "@/hooks/store";
import { useIssueStoreType } from "@/hooks/use-issue-layout-store";
import { DraftIssueLayout } from "./draft-issue-layout";
import { IssuesModalProps } from "./modal";

export const CreateUpdateIssueModalBase = observer(
  ({
    data,
    isOpen,
    onClose,
    beforeFormSubmit,
    onSubmit,
    withDraftIssueWrapper = true,
    storeType: issueStoreFromProps,
    isDraft = false,
    fetchIssueDetails = true,
    moveToIssue = false,
    modalTitle,
    primaryButtonText,
    isProjectSelectionDisabled = false,
  }: IssuesModalProps) => {
    const issueStoreType = useIssueStoreType();

    const storeType = issueStoreFromProps ?? issueStoreType;
    // ref
    const issueTitleRef = useRef<HTMLInputElement>(null);
    // states
    const [changesMade, setChangesMade] = useState<Partial<TIssue> | null>(null);
    const [createMore, setCreateMore] = useState(false);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [uploadedAssetIds, setUploadedAssetIds] = useState<string[]>([]);
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

    // store hooks
    const { workspaceSlug, projectId: routerProjectId, cycleId, moduleId } = useRouterParams();
    // derived values
    const projectId = data?.project_id ?? routerProjectId?.toString();
    const { projectsWithCreatePermissions } = useUser();

    const projectIdsWithCreatePermissions = Object.keys(projectsWithCreatePermissions ?? {});
    const handleClose = (saveAsDraft?: boolean) => {
      // if(changesMade && saveAsDraft && !data)}
      // hancrea
    };
    const handleFormChange = (formData: Partial<TIssue> | null) => {};
    const handleCreateMoreToggleChange = (value: boolean) => {};
    const handleFormSubmit = async (payload: Partial<TIssue>, is_draft_issue: boolean = false) => {};
    const handleDuplicateIssueModal = (value: boolean) => {};

    const fetchIssueDetail = async (issueId: string | undefined) => {
      setDescription(undefined);
      if (!workspaceSlug) return;
      if (!projectId || issueId === undefined || !fetchIssueDetails) {
        setDescription(data?.description_html || "<p></p>");
        return;
      }

      // const response = await fetis
    };

    useEffect(() => {
      if (isOpen) fetchIssueDetail(data?.id);
      // if modal is closed, reset active project to null
      // and return to avoid activeProjectId being set to some other project

      if (!isOpen) {
        setActiveProjectId(null);
        return;
      }

      if (data && data.project_id) {
        setActiveProjectId(data.project_id);
        return;
      }
      // if data is not present, set active project to the project
      // in the url. This has the least priority.
      if (projectIdsWithCreatePermissions && projectIdsWithCreatePermissions.length > 0 && !activeProjectId)
        setActiveProjectId(projectId?.toString() ?? projectIdsWithCreatePermissions?.[0]);

      // clearing up the description state when we leave the component
      return () => setDescription(undefined);
    }, [data, projectId, isOpen, activeProjectId]);

    if (!projectIdsWithCreatePermissions || projectIdsWithCreatePermissions.length === 0 || !activeProjectId)
      return null;

    return (
      <ModalCore
        isOpen={isOpen}
        handleClose={() => handleClose(true)}
        position={EModalPosition.TOP}
        width={isDuplicateModalOpen ? EModalWidth.VIXL : EModalWidth.XXXXL}
        className="!bg-transparent rounded-lg shadow-none transition-[width] ease-linear"
      >
        {withDraftIssueWrapper ? (
          <DraftIssueLayout
            changesMade={changesMade}
            data={{
              ...data,
              description_html: description,
              cycle_id: data?.cycle_id ? data?.cycle_id : cycleId ? cycleId.toString() : null,
              module_ids: data?.module_ids ? data?.module_ids : moduleId ? [moduleId.toString()] : null,
            }}
            issueTitleRef={issueTitleRef}
            onAssetUpload={() => {}}
            onChange={handleFormChange}
            onClose={handleClose}
            onSubmit={(payload) => handleFormSubmit(payload, isDraft)}
            projectId={activeProjectId}
            isCreateMoreToggleEnabled={createMore}
            onCreateMoreToggleChange={handleCreateMoreToggleChange}
            isDraft={isDraft}
            moveToIssue={moveToIssue}
            isDuplicateModalOpen={isDuplicateModalOpen}
            handleDuplicateIssueModal={handleDuplicateIssueModal}
            isProjectSelectionDisabled={isProjectSelectionDisabled}
          />
        ) : (
          <>form root</>
        )}
      </ModalCore>
    );
  }
);
