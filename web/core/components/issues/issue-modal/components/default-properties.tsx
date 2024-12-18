"use client";

import { useState } from "react";
import { observer } from "mobx-react";
import { Control, Controller } from "react-hook-form";
import { LayoutPanelTop } from "lucide-react";
import { ISearchIssueResponse, TIssue } from "@plane/types";
import { DateDropdown } from "@/components/dropdowns/date";
import { MemberDropdown } from "@/components/dropdowns/member";
import { ETabIndices } from "@/constants/tab-indices";
import { getDate, renderFormattedPayloadDate } from "@/helpers/date-time.helper";
import { getTabIndex } from "@/helpers/tab-indices.helper";
import { useUserPermissions } from "@/hooks/store";
import { useProject } from "@/hooks/store/use-project";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";

type TIssueDefaultPropertiesProps = {
  control: Control<TIssue>;
  id: string | undefined;
  projectId: string | null;
  workspaceSlug: string;
  selectedParentIssue: ISearchIssueResponse | null;
  startDate: string | null;
  targetDate: string | null;
  parentId: string | null;
  isDraft: boolean;
  handleFormChange: () => void;
  setLabelModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedParentIssue: (issue: ISearchIssueResponse) => void;
};

export const IssueDefaultProperties = observer(
  ({
    control,
    id,
    projectId,
    workspaceSlug,
    selectedParentIssue,
    startDate,
    targetDate,
    parentId,
    isDraft,
    handleFormChange,
    setLabelModal,
    setSelectedParentIssue,
  }: TIssueDefaultPropertiesProps) => {
    // states
    const [parentIssueListModalOpen, setParentIssueListModalOpen] = useState(false);
    // store hooks
    // const { areEstimateEnabledByProjectId } = useProjectEstimates();
    const { getProjectById } = useProject();
    const { isMobile } = usePlatformOS();
    const { allowPermissions } = useUserPermissions();
    // derived values
    const projectDetails = getProjectById(projectId);

    const { getIndex } = getTabIndex(ETabIndices.ISSUE_FORM, isMobile);

    const canCreateLabel = allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.PROJECT);

    const minDate = getDate(startDate);
    minDate?.setDate(minDate.getDate());

    const maxDate = getDate(targetDate);
    maxDate?.setDate(maxDate.getDate());

    return (
      <div className="flex flex-wrap items-center gap-2">
        <Controller
          control={control}
          name="state_id"
          render={({ field: { value, onChange } }) => <div className="h-7">drop</div>}
        />

        <Controller
          control={control}
          name="assignee_ids"
          render={({ field: { value, onChange } }) => (
            <div className="h-7">
              <MemberDropdown
                projectId={projectId!}
                value={value}
                onChange={(assigneeIds) => {
                  onChange(assigneeIds);
                  handleFormChange();
                }}
                buttonVariant={value.length > 0 ? "transparent-without-text" : "border-with-text"}
                buttonClassName={value?.length > 0 ? "hover:bg-transparent" : ""}
                placeholder="Assignees"
                multiple
                tabIndex={getIndex("assignee_ids")}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="start_date"
          render={({ field: { value, onChange } }) => (
            <div className="h-7">
              <DateDropdown
                value={value}
                onChange={(date) => {
                  onChange(date ? renderFormattedPayloadDate(date) : null);
                  handleFormChange();
                }}
                buttonVariant="border-with-text"
                maxDate={maxDate}
                placeholder="Start date"
                tabIndex={getIndex("start_date")}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="target_date"
          render={({ field: { value, onChange } }) => (
            <div className="h-7">
              <DateDropdown
                value={value}
                onChange={(date) => {
                  onChange(date ? renderFormattedPayloadDate(date) : null);
                  handleFormChange();
                }}
                buttonVariant="border-with-text"
                minDate={minDate ?? undefined}
                placeholder="Due date"
                tabIndex={getIndex("target_date")}
              />
            </div>
          )}
        />

        <div className="h-7">
          {parentId ? (
            <div>hi</div>
          ) : (
            <button
              onClick={() => setParentIssueListModalOpen(true)}
              type="button"
              className="flex cursor-pointer items-center justify-between gap-1 h-full"
            >
              <LayoutPanelTop className="h-3 w-3 flex-shrink-0" />
              <span className="whitespace-nowrap">Add parent</span>
            </button>
          )}
        </div>
      </div>
    );
  }
);
