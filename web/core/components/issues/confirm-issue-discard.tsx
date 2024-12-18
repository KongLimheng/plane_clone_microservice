import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { ModalCore } from "@plane/ui";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  onDiscard: () => void;
  onConfirm: () => Promise<void>;
};

export const ConfirmIssueDiscard = ({ isOpen, handleClose, onDiscard, onConfirm }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClose = () => {
    handleClose();
    setIsLoading(false);
  };

  const handleDeletion = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose}>
      <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start">
          <div className="mt-3 text-center sm:mt-0 sm:text-left">
            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-custom-text-100">
              Save this draft?
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm text-custom-text-200">
                You can save this issue to Drafts so you can come back to it later.{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModalCore>
  );
};
