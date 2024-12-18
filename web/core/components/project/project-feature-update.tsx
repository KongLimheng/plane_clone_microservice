"use client";

import { observer } from "mobx-react";
import Link from "next/link";
import { Button, getButtonStyling, Logo, Row } from "@plane/ui";
import { useProject } from "@/hooks/store/use-project";
import { ProjectFeaturesList } from "./settings";

type Props = {
  workspaceSlug: string;
  projectId: string | null;
  onClose: () => void;
};
export const ProjectFeatureUpdate = observer(({ workspaceSlug, projectId, onClose }: Props) => {
  const { getProjectById } = useProject();
  if (!workspaceSlug || !projectId) return null;
  const currentProjectDetail = getProjectById(projectId);
  if (!currentProjectDetail) return null;

  return (
    <>
      <Row className="py-6">
        <ProjectFeaturesList workspaceSlug={workspaceSlug} projectId={projectId} isAdmin />
      </Row>
      <div className="flex items-center justify-between gap-2 mt-4 px-6 py-4 border-t border-custom-border-100">
        <div className="flex gap-1 text-sm text-custom-text-300 font-medium">
          Congrats! Project <Logo logo={currentProjectDetail.logo_props} />{" "}
          <p className="break-all">{currentProjectDetail.name}</p> created.
        </div>

        <div className="flex gap-2">
          <Button variant="neutral-primary" size="sm" onClick={onClose} tabIndex={1}>
            Close
          </Button>
          <Link
            onClick={onClose}
            className={getButtonStyling("primary", "sm")}
            tabIndex={2}
            href={`/${workspaceSlug}/projects/${projectId}/issues`}
          >
            Open project
          </Link>
        </div>
      </div>
    </>
  );
});
