"use client";

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Control, Controller } from "react-hook-form";
import { EditorRefApi } from "@plane/editor";
import { TIssue } from "@plane/types";
import { Loader } from "@plane/ui";
import { RichTextEditor } from "@/components/editor";
import { ETabIndices } from "@/constants/tab-indices";
import { getDescriptionPlaceholder } from "@/helpers/issue.helper";
import { getTabIndex } from "@/helpers/tab-indices.helper";
import { useWorkspace } from "@/hooks/store";
import { useInstance } from "@/hooks/store/use-instance";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { FileService } from "@/services/file.service";

type TIssueDescriptionEditorProps = {
  control: Control<TIssue>;
  isDraft: boolean;
  issueName: string;
  issueId: string | undefined;
  descriptionHtmlData: string | undefined;
  editorRef: React.MutableRefObject<EditorRefApi | null>;
  submitBtnRef: React.MutableRefObject<HTMLButtonElement | null>;
  gptAssistantModal: boolean;
  workspaceSlug: string;
  projectId: string | null;
  handleFormChange: () => void;
  handleDescriptionHTMLDataChange: (descriptionHtmlData: string) => void;
  setGptAssistantModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleGptAssistantClose: () => void;
  onAssetUpload: (assetId: string) => void;
  onClose: () => void;
};
const fileService = new FileService();

export const IssueDescriptionEditor = observer(
  ({
    control,
    isDraft,
    issueName,
    issueId,
    descriptionHtmlData,
    editorRef,
    submitBtnRef,
    gptAssistantModal,
    workspaceSlug,
    projectId,
    handleFormChange,
    handleDescriptionHTMLDataChange,
    setGptAssistantModal,
    handleGptAssistantClose,
    onAssetUpload,
    onClose,
  }: TIssueDescriptionEditorProps) => {
    // states
    const [iAmFeelingLucky, setIAmFeelingLucky] = useState(false);
    // store hooks
    const { getWorkspaceBySlug } = useWorkspace();
    const workspaceId = getWorkspaceBySlug(workspaceSlug?.toString())?.id as string;
    const { config } = useInstance();
    const { isMobile } = usePlatformOS();
    const { getIndex } = getTabIndex(ETabIndices.ISSUE_FORM, isMobile);

    useEffect(() => {
      if (descriptionHtmlData) handleDescriptionHTMLDataChange(descriptionHtmlData);
    }, [descriptionHtmlData]);

    console.log(config?.has_openai_configured);
    return (
      <div>
        {descriptionHtmlData === undefined || !projectId ? (
          <Loader className="min-h-[120px] max-h-64 space-y-2 overflow-hidden rounded-md border border-custom-border-200 p-3 py-2 pt-3">
            <Loader.Item width="100%" height="26px" />
            <div className="flex items-center gap-2">
              <Loader.Item width="26px" height="26px" />
              <Loader.Item width="400px" height="26px" />
            </div>
            <div className="flex items-center gap-2">
              <Loader.Item width="26px" height="26px" />
              <Loader.Item width="400px" height="26px" />
            </div>
            <Loader.Item width="80%" height="26px" />
            <div className="flex items-center gap-2">
              <Loader.Item width="50%" height="26px" />
            </div>
            <div className="border-0.5 absolute bottom-2 right-3.5 z-10 flex items-center gap-2">
              <Loader.Item width="100px" height="26px" />
              <Loader.Item width="50px" height="26px" />
            </div>
          </Loader>
        ) : (
          <>
            <Controller
              control={control}
              name="description_html"
              render={({ field: { value, onChange } }) => (
                <RichTextEditor
                  id="issue-modal-editor"
                  initialValue={value ?? ""}
                  value={descriptionHtmlData}
                  workspaceSlug={workspaceSlug}
                  workspaceId={workspaceId}
                  projectId={projectId}
                  onChange={(_description: object, description_html: string) => {
                    onChange(description_html);
                    handleFormChange();
                  }}
                  onEnterKeyPress={() => submitBtnRef?.current?.click()}
                  ref={editorRef}
                  tabIndex={getIndex("description_html")}
                  placeholder={getDescriptionPlaceholder}
                  containerClassName="pt-3 min-h-[120px]"
                  // uploadFile={async (file) => {}}
                />
              )}
            />

            <div>{issueName && issueName.trim() !== "" && config?.has_openai_configured && <button>hi</button>}</div>
          </>
        )}
      </div>
    );
  }
);
