import { useEffect, useState } from "react";
import { EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
import { checkURLValidity } from "@/helpers/string.helper";
import { CreateProjectForm } from "@/plane-web/components/projects/create/root";
import { TProject } from "@/plane-web/types/projects";
import { ProjectFeatureUpdate } from "./project-feature-update";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  setToFavorite?: boolean;
  workspaceSlug: string;
  data?: Partial<TProject>;
};

enum EProjectCreationSteps {
  CREATE_PROJECT = "CREATE_PROJECT",
  FEATURE_SELECTION = "FEATURE_SELECTION",
}

export const CreateProjectModal = ({ isOpen, onClose, setToFavorite, workspaceSlug, data }: Props) => {
  // states
  const [currentStep, setCurrentStep] = useState<EProjectCreationSteps>(EProjectCreationSteps.CREATE_PROJECT);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(EProjectCreationSteps.CREATE_PROJECT);
      setCreatedProjectId("");
    }
  }, [isOpen]);

  const handleNextStep = (projectId: string) => {
    if (!projectId) return;
    setCreatedProjectId(projectId);
    setCurrentStep(EProjectCreationSteps.FEATURE_SELECTION);
  };
  const handleCoverImageStatusUpdate = async (projectId: string, coverImage: string) => {
    if (!checkURLValidity(coverImage)) {
    }
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose} position={EModalPosition.TOP} width={EModalWidth.XXL}>
      <div className="p-3">
        {currentStep === EProjectCreationSteps.CREATE_PROJECT && (
          <CreateProjectForm
            setToFavorite={setToFavorite}
            workspaceSlug={workspaceSlug}
            updateCoverImageStatus={handleCoverImageStatusUpdate}
            handleNextStep={handleNextStep}
            data={data}
            onClose={onClose}
          />
        )}

        {currentStep === EProjectCreationSteps.FEATURE_SELECTION && (
          <ProjectFeatureUpdate projectId={createdProjectId} workspaceSlug={workspaceSlug} onClose={onClose} />
        )}
      </div>
    </ModalCore>
  );
};
