"use client";

import { observer } from "mobx-react";
import { Control, Controller } from "react-hook-form";
import { TIssue } from "@plane/types";
import { ProjectDropdown } from "@/components/dropdowns/project";
import { ETabIndices } from "@/constants/tab-indices";
import { shouldRenderProject } from "@/helpers/project.helper";
import { getTabIndex } from "@/helpers/tab-indices.helper";
import { useUser } from "@/hooks/store";
import { usePlatformOS } from "@/hooks/use-platform-os";

type TIssueProjectSelectProps = {
  control: Control<TIssue>;
  disabled?: boolean;
  handleFormChange: () => void;
};

export const IssueProjectSelect = observer(
  ({ control, disabled = false, handleFormChange }: TIssueProjectSelectProps) => {
    // store hooks
    const { projectsWithCreatePermissions } = useUser();
    const { isMobile } = usePlatformOS();

    const { getIndex } = getTabIndex(ETabIndices.ISSUE_FORM, isMobile);
    return (
      <Controller
        control={control}
        name="project_id"
        rules={{ required: true }}
        render={({ field: { value, onChange } }) =>
          projectsWithCreatePermissions && projectsWithCreatePermissions[value!] ? (
            <div className="h-7">
              <ProjectDropdown
                value={value}
                buttonVariant="border-with-text"
                renderCondition={(project) => shouldRenderProject(project)}
                onChange={(projectId) => {
                  onChange(projectId);
                  handleFormChange();
                }}
                tabIndex={getIndex("project_id")}
                disabled={disabled}
              />
            </div>
          ) : (
            <></>
          )
        }
      />
    );
  }
);
