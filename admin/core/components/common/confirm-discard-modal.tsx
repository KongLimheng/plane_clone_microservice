import { Fragment } from "react";
import Link from "next/link";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Button, getButtonStyling } from "@plane/ui";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  onDiscardHref: string;
};

export const ConfirmDiscardModal = ({ isOpen, handleClose, onDiscardHref }: Props) => (
  <Transition as={Fragment} show={isOpen}>
    <Dialog onClose={handleClose} as="div" className={"relative z-50"}>
      <TransitionChild
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-custom-backdrop transition-opacity" />
      </TransitionChild>

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="my-10 flex items-center justify-center p-4 text-center sm:p-0 md:my-32">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-custom-background-100 text-left shadow-custom-shadow-md transition-all sm:my-8 sm:w-[30rem]">
              <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <DialogTitle as="h3" className="text-lg font-medium leading-6 text-custom-text-300">
                      You have unsaved changes
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-custom-text-400">
                        Changes you made be lost if you go back. Do you wish to go back?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center p-4 sm:px-6 gap-2">
                <Button variant="neutral-primary" size="sm" onClick={handleClose}>
                  Keep editing
                </Button>
                <Link href={onDiscardHref} className={getButtonStyling("primary", "sm")}>
                  Go back
                </Link>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </Transition>
);
