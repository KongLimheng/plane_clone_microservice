"use client";

import { useEffect } from "react";
import { observer } from "mobx-react";
import { useForm } from "react-hook-form";
import { Dialog } from "@headlessui/react";
import { IIssueLabel, IState } from "@plane/types";
import { ModalCore } from "@plane/ui";
import { getRandomLabelColor } from "@/constants/label";
import { ETabIndices } from "@/constants/tab-indices";
import { getTabIndex } from "@/helpers/tab-indices.helper";
import { useRouterParams } from "@/hooks/store";
import { usePlatformOS } from "@/hooks/use-platform-os";

// types
type Props = {
  isOpen: boolean;
  projectId: string;
  handleClose: () => void;
  onSuccess?: (response: IIssueLabel) => void;
};

const defaultValues: Partial<IState> = {
  name: "",
  color: "rgb(var(--color-text-200))",
};

export const CreateLabelModal = observer(({ isOpen, projectId, handleClose, onSuccess }: Props) => {
  // router
  const { workspaceSlug } = useRouterParams();
  // store hooks
  // const { createLabel } = useLabel();
  const { isMobile } = usePlatformOS();

  // form info
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    setFocus,
  } = useForm<IIssueLabel>({
    defaultValues,
  });
  const { getIndex } = getTabIndex(ETabIndices.CREATE_LABEL, isMobile);

  /**
   * For setting focus on name input
   */
  useEffect(() => {
    if (isOpen) setValue("color", getRandomLabelColor());
    setFocus("name");
  }, [setFocus, isOpen, setValue]);

  return (
    <ModalCore isOpen={isOpen} handleClose={handleClose}>
      <form>
        <div>
          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-custom-text-100">
            Create Label
          </Dialog.Title>
        </div>
      </form>
    </ModalCore>
  );
});
