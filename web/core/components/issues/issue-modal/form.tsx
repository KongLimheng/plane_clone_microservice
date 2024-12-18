"use client";

import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import { useForm } from "react-hook-form";
import { EditorRefApi } from "@plane/editor";
import { ISearchIssueResponse, TIssue } from "@plane/types";
import { CreateLabelModal } from "@/components/labels";
import { ETabIndices } from "@/constants/tab-indices";
import { cn } from "@/helpers/common.helper";
import { getTextContent } from "@/helpers/editor.helper";
import { getTabIndex } from "@/helpers/tab-indices.helper";
import { useIssueModal } from "@/hooks/context/use-issue-modal";
import { useRouterParams } from "@/hooks/store";
import { useProject } from "@/hooks/store/use-project";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { IssueTypeSelect } from "@/plane-web/components/issues";
import { useDebouncedDuplicateIssues } from "@/plane-web/hooks/use-debounced-duplicate-issues";
import { IssueDefaultProperties, IssueDescriptionEditor, IssueProjectSelect, IssueTitleInput } from "./components";

const defaultValues: Partial<TIssue> = {
  project_id: "",
  type_id: null,
  name: "",
  description_html: "",
  estimate_point: null,
  state_id: "",
  parent_id: null,
  priority: "none",
  assignee_ids: [],
  label_ids: [],
  cycle_id: null,
  module_ids: null,
  start_date: null,
  target_date: null,
};

export interface IssueFormProps {
  data?: Partial<TIssue>;
  issueTitleRef: React.MutableRefObject<HTMLInputElement | null>;
  isCreateMoreToggleEnabled: boolean;
  onAssetUpload: (assetId: string) => void;
  onCreateMoreToggleChange: (value: boolean) => void;
  onChange?: (formData: Partial<TIssue> | null) => void;
  onClose: () => void;
  onSubmit: (values: Partial<TIssue>, is_draft_issue?: boolean) => Promise<void>;
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

export const IssueFormRoot = observer(
  ({
    data,
    issueTitleRef,
    onAssetUpload,
    onChange,
    onClose,
    onSubmit,
    projectId: defaultProjectId,
    isCreateMoreToggleEnabled,
    onCreateMoreToggleChange,
    isDraft,
    moveToIssue,
    modalTitle = `${data?.id ? "Update" : isDraft ? "Create a draft" : "Create new issue"}`,
    primaryButtonText = {
      default: `${data?.id ? "Update" : isDraft ? "Save to Drafts" : "Save"}`,
      loading: `${data?.id ? "Updating" : "Saving"}`,
    },
    isDuplicateModalOpen,
    handleDuplicateIssueModal,
    isProjectSelectionDisabled = false,
  }: IssueFormProps) => {
    // states
    const [labelModal, setLabelModal] = useState(false);
    const [selectedParentIssue, setSelectedParentIssue] = useState<ISearchIssueResponse | null>(null);
    const [gptAssistantModal, setGptAssistantModal] = useState(false);
    const [isMoving, setIsMoving] = useState<boolean>(false);

    // refs
    const editorRef = useRef<EditorRefApi>(null);
    const submitBtnRef = useRef<HTMLButtonElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);
    const modalContainerRef = useRef<HTMLDivElement | null>(null);

    // router
    const { workspaceSlug, projectId: routeProjectId } = useRouterParams();

    // store hooks
    const { getProjectById } = useProject();
    const {
      getIssueTypeIdOnProjectChange,
      getActiveAdditionalPropertiesLength,
      handlePropertyValuesValidation,
      handleCreateUpdatePropertyValues,
    } = useIssueModal();
    const { isMobile } = usePlatformOS();
    // const { moveIssue } = useWorkspaceDraftIssues();

    // const {
    // 	issue: { getIssueById },
    // } = useIssueDetail();
    // const { fetchCycles } = useProjectIssueProperties();
    // const { getStateById } = useProjectState();

    // form info
    const {
      formState: { errors, isDirty, isSubmitting, dirtyFields },
      handleSubmit,
      reset,
      watch,
      control,
      getValues,
      setValue,
    } = useForm<TIssue>({
      defaultValues: { ...defaultValues, project_id: defaultProjectId, ...data },
      reValidateMode: "onChange",
    });

    const projectId = watch("project_id");
    const activeAdditionalPropertiesLength = getActiveAdditionalPropertiesLength({
      projectId: projectId,
      workspaceSlug: workspaceSlug!,
      watch: watch,
    });
    // derived values
    const projectDetails = projectId ? getProjectById(projectId) : undefined;

    const { getIndex } = getTabIndex(ETabIndices.ISSUE_FORM, isMobile);

    const condition =
      (watch("name") && watch("name") !== "") || (watch("description_html") && watch("description_html") !== "<p></p>");

    const handleFormChange = () => {
      if (!onChange) return;
      if (isDirty && condition) onChange(watch());
      else onChange(null);
    };
    console.log(watch());

    useEffect(() => {
      if (isDirty) {
        const formData = getValues();

        reset({
          ...defaultValues,
          project_id: projectId,
          name: formData.name,
          description_html: formData.description_html,
          priority: formData.priority,
          start_date: formData.start_date,
          target_date: formData.target_date,
          parent_id: formData.parent_id,
        });
      }

      // if (projectId && routeProjectId !== projectId) fetchCycles(workspaceSlug?.toString(), projectId);
    }, [projectId]);

    // Update the issue type id when the project id changes
    useEffect(() => {
      const issueTypeId = watch("type_id");
    });

    // debounced duplicate issues swr
    const { duplicateIssues } = useDebouncedDuplicateIssues(
      projectDetails?.workspace.toString(),
      projectId ?? undefined,
      {
        name: watch("name"),
        description_html: getTextContent(watch("description_html")),
      }
    );

    useEffect(() => {
      const parentId = watch("parent_id") || undefined;
      if (!parentId) return;
    }, [watch, getProjectById]);

    // executing this useEffect when isDirty changes
    useEffect(() => {
      if (!onChange) return;

      if (isDirty && condition) onChange(watch());
      else onChange(null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDirty]);

    useEffect(() => {
      const formElement = formRef.current;
      const modalElement = modalContainerRef.current;
      if (!formElement || !modalElement) return;
      const resizeObserver = new ResizeObserver(() => {
        modalElement.style.maxHeight = `${formElement.offsetHeight}px`;
      });

      resizeObserver.observe(formElement);
      return () => resizeObserver.disconnect();
    }, [formRef, modalContainerRef]);

    const shouldRenderDuplicateModal = isDuplicateModalOpen && duplicateIssues?.length > 0;

    return (
      <>
        {projectId && (
          <CreateLabelModal
            isOpen={labelModal}
            handleClose={() => setLabelModal(false)}
            projectId={projectId}
            onSuccess={(res) => {
              setValue("label_ids", [...watch("label_ids"), res.id]);
            }}
          />
        )}

        <div className="flex gap-2 bg-transparent">
          <div className="rounded-lg w-full">
            <form ref={formRef} className="flex flex-col w-full">
              <div className="p-5 rounded-t-lg bg-custom-background-100">
                <h3 className="text-xl font-medium text-custom-text-200 pb-2">{modalTitle}</h3>
                <div className="flex items-center justify-between pt-2 pb-4">
                  <div className="flex items-center gap-x-1">
                    <IssueProjectSelect
                      control={control}
                      disabled={!!data?.id || !!data?.sourceIssueId || isProjectSelectionDisabled}
                      handleFormChange={handleFormChange}
                    />
                    {projectId && (
                      <IssueTypeSelect
                        control={control}
                        projectId={projectId}
                        disabled={!!data?.sourceIssueId}
                        handleFormChange={handleFormChange}
                        renderChevron
                      />
                    )}
                  </div>
                  {duplicateIssues.length > 0 && <>Dedup</>}
                </div>
                {watch("parent_id") && selectedParentIssue && (
                  <div>
                    <>parent id</>
                  </div>
                )}

                <div className="space-y-1">
                  <IssueTitleInput
                    control={control}
                    issueTitleRef={issueTitleRef}
                    errors={errors}
                    handleFormChange={handleFormChange}
                  />
                </div>
              </div>

              <div
                className={cn("pb-4 space-y-3 bg-custom-background-100", {
                  "max-h-[45vh]": activeAdditionalPropertiesLength > 4,
                })}
              >
                <div className="px-5">
                  <IssueDescriptionEditor
                    control={control}
                    isDraft={isDraft}
                    issueName={watch("name")}
                    issueId={data?.id}
                    descriptionHtmlData={data?.description_html}
                    editorRef={editorRef}
                    submitBtnRef={submitBtnRef}
                    gptAssistantModal={gptAssistantModal}
                    workspaceSlug={workspaceSlug!}
                    projectId={projectId}
                    handleFormChange={handleFormChange}
                    handleDescriptionHTMLDataChange={(description_html) =>
                      setValue("description_html", description_html)
                    }
                    setGptAssistantModal={setGptAssistantModal}
                    handleGptAssistantClose={() => reset(getValues())}
                    onAssetUpload={onAssetUpload}
                    onClose={onClose}
                  />
                </div>
                <div
                  className={cn(
                    "px-5",
                    activeAdditionalPropertiesLength <= 4 &&
                      "max-h-[25vh] overflow-hidden overflow-y-auto vertical-scrollbar scrollbar-sm"
                  )}
                >
                  {projectId && <>addit</>}
                </div>
              </div>

              <div className="px-4 py-3 border-t-[0.5px] border-custom-border-200 shadow-custom-shadow-xs rounded-b-lg bg-custom-background-100">
                <div className="pb-3 border-b-[0.5px] border-custom-border-200">
                  <IssueDefaultProperties
                    control={control}
                    id={data?.id}
                    projectId={projectId}
                    workspaceSlug={workspaceSlug!}
                    selectedParentIssue={selectedParentIssue}
                    startDate={watch("start_date")}
                    targetDate={watch("target_date")}
                    parentId={watch("parent_id")}
                    isDraft={isDraft}
                    handleFormChange={handleFormChange}
                    setLabelModal={setLabelModal}
                    setSelectedParentIssue={setSelectedParentIssue}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }
);
