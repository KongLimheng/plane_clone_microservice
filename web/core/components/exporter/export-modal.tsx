"use client";

import { useState } from "react";
import { intersection } from "lodash";
import { observer } from "mobx-react";
import { IImporterService, IUser } from "@plane/types";
import { Button, CustomSearchSelect, EModalWidth, ModalCore, setToast, TOAST_TYPE } from "@plane/ui";
import { useRouterParams, useUser } from "@/hooks/store";
import { useProject } from "@/hooks/store/use-project";
import { useAppRouter } from "@/hooks/use-app-router";
import { ProjectExportService } from "@/services/project";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  data: IImporterService | null;
  user: IUser | null;
  provider: string | string[];
  mutateServices: () => void;
};

const projectExportService = new ProjectExportService();
export const Exporter = observer(({ isOpen, handleClose, user, provider, mutateServices }: Props) => {
  // states
  const [exportLoading, setExportLoading] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  // router
  const router = useAppRouter();
  const { workspaceSlug } = useRouterParams();
  // store hooks
  const { workspaceProjectIds, getProjectById } = useProject();
  const { projectsWithCreatePermissions } = useUser();

  const wsProjectIdsWithCreatePermissions = projectsWithCreatePermissions
    ? intersection(workspaceProjectIds, Object.keys(projectsWithCreatePermissions))
    : [];

  const options = wsProjectIdsWithCreatePermissions.map((projectId) => {
    const projectDetails = getProjectById(projectId);

    return {
      value: projectDetails?.id,
      query: `${projectDetails?.name} ${projectDetails?.identifier}`,
      content: (
        <div className="flex items-center gap-2">
          <span className="text-[0.65rem] text-custom-text-200 flex-shrink-0">{projectDetails?.identifier}</span>
          <span className="truncate">{projectDetails?.name}</span>
        </div>
      ),
    };
  });

  const [value, setValue] = useState<string[]>([]);
  const [multiple, setMultiple] = useState<boolean>(false);

  const onChange = (val: any) => {
    setValue(val);
  };

  const ExportCSVToMail = async () => {
    setExportLoading(true);
    if (workspaceSlug && user && typeof provider === "string") {
      const payload = {
        provider: provider,
        project: value,
        multiple: multiple,
      };

      projectExportService
        .csvExport(workspaceSlug, payload)
        .then(() => {
          mutateServices();
          router.push(`/${workspaceSlug}/settings/exports`);
          setExportLoading(false);
          setToast({
            type: TOAST_TYPE.SUCCESS,
            title: "Export Successful",
            message: `You will be able to download the exported ${
              provider === "csv" ? "CSV" : provider === "xlsx" ? "Excel" : provider === "json" ? "JSON" : ""
            } from the previous export.`,
          });
        })
        .catch(() => {
          setExportLoading(false);
          setToast({
            type: TOAST_TYPE.ERROR,
            title: "Error!",
            message: "Export was unsuccessful. Please try again.",
          });
        });
    }
  };

  return (
    <ModalCore
      isOpen={isOpen}
      handleClose={() => {
        if (!isSelectOpen) handleClose();
      }}
      width={EModalWidth.XL}
      className="sm:my-8"
    >
      <div className="flex flex-col gap-6 gap-y-4 p-6">
        <div className="flex w-full items-center justify-start gap-6">
          <span className="flex items-center justify-start">
            <h3 className="text-xl font-medium 2xl:text-2xl">
              Export to {provider === "csv" ? "CSV" : provider === "xlsx" ? "Excel" : provider === "json" ? "JSON" : ""}
            </h3>
          </span>
        </div>

        <div>
          <CustomSearchSelect
            input
            value={value}
            onChange={(val: string[]) => onChange(val)}
            options={options}
            multiple
            label={
              value && value.length > 0
                ? value
                    .map((projectId) => {
                      const projectDetails = getProjectById(projectId);
                      return projectDetails?.identifier;
                    })
                    .join(", ")
                : "All projects"
            }
            onOpen={() => setIsSelectOpen(true)}
            onClose={() => {
              setIsSelectOpen(false);
            }}
            placement="bottom-end"
            optionsClassName="max-w-48 sm:max-w-[532px]"
          />
        </div>

        <div onClick={() => setMultiple(!multiple)} className="flex max-w-min cursor-pointer items-center gap-2">
          <input type="checkbox" checked={multiple} onChange={() => setMultiple(!multiple)} />
          <div className="whitespace-nowrap text-sm">Export the data into separate files</div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="neutral-primary" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={ExportCSVToMail}
            disabled={exportLoading}
            loading={exportLoading}
          >
            {exportLoading ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>
    </ModalCore>
  );
});
