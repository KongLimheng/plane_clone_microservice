"use client";

import { observer } from "mobx-react";
import { IProject } from "@plane/types";
import { setPromiseToast, ToggleSwitch, Tooltip } from "@plane/ui";
import { useUser } from "@/hooks/store";
import { useProject } from "@/hooks/store/use-project";
import { UpgradeBadge } from "@/plane-web/components/workspace";
import { PROJECT_FEATURES_LIST } from "./features";

type Props = {
  workspaceSlug: string;
  projectId: string;
  isAdmin: boolean;
};
export const ProjectFeaturesList = observer(({ workspaceSlug, projectId, isAdmin }: Props) => {
  const { data: currentUser } = useUser();
  const { getProjectById, updateProject } = useProject();

  // derived values
  const currentProjectDetails = getProjectById(projectId);

  const handleSubmit = async (featureKey: string, featureProperty: string) => {
    if (!workspaceSlug || !projectId || !currentProjectDetails) return;

    // making the request to update the project feature
    const settingsPayload = {
      [featureProperty]: !currentProjectDetails?.[featureProperty as keyof IProject],
    };

    const updateProjectPromise = updateProject(workspaceSlug, projectId, settingsPayload);
    setPromiseToast(updateProjectPromise, {
      loading: "Updating project feature...",
      success: {
        title: "Success!",
        message: () => "Project feature updated successfully.",
      },
      error: {
        title: "Error!",
        message: () => "Something went wrong while updating project feature. Please try again.",
      },
    });
  };

  if (!currentUser) return <></>;

  return (
    <div className="space-y-6">
      {Object.keys(PROJECT_FEATURES_LIST).map((featureSectionKey) => {
        const feature = PROJECT_FEATURES_LIST[featureSectionKey];

        return (
          <div key={featureSectionKey}>
            <div className="flex flex-col justify-center pb-2 border-b border-custom-border-100">
              <h3 className="text-xl font-medium">{feature.title}</h3>
              <h4 className="text-sm leading-5 text-custom-text-200">{feature.description}</h4>
            </div>
            {Object.keys(feature.featureList).map((featureItemKey) => {
              const featureItem = feature.featureList[featureItemKey];

              return (
                <div
                  key={featureItemKey}
                  className="gap-x-8 gap-y-2 border-b border-custom-border-100 bg-custom-background-100 pb-2 pt-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center rounded bg-custom-background-90 p-3">
                        {featureItem.icon}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium leading-5">{featureItem.title}</h4>
                          {featureItem.isPro && (
                            <Tooltip tooltipContent="Pro feature" position="top">
                              <UpgradeBadge />
                            </Tooltip>
                          )}
                        </div>

                        <p className="text-sm leading-5 tracking-tight text-custom-text-300">
                          {featureItem.description}
                        </p>
                      </div>
                    </div>

                    <ToggleSwitch
                      size="sm"
                      value={Boolean(currentProjectDetails?.[featureItem.property as keyof IProject])}
                      onChange={() => handleSubmit(featureItemKey, featureItem.property)}
                      disabled={!featureItem.isEnabled || !isAdmin}
                    />
                  </div>

                  <div className="pl-14">
                    {currentProjectDetails?.[featureItem.property as keyof IProject] &&
                      featureItem.renderChildren &&
                      featureItem.renderChildren(currentProjectDetails, isAdmin, handleSubmit)}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
});
