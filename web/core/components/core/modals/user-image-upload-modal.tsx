"use client";

import { Fragment, useState } from "react";
import { observer } from "mobx-react";
import { useDropzone } from "react-dropzone";
import { UserCircle2 } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { EFileAssetType } from "@plane/types/src/enums";
import { Button, setToast, TOAST_TYPE } from "@plane/ui";
import { MAX_STATIC_FILE_SIZE } from "@/constants/common";
import { cn } from "@/helpers/common.helper";
import { getAssetIdFromUrl, getFileURL } from "@/helpers/file.helper";
import { checkURLValidity } from "@/helpers/string.helper";
import { FileService } from "@/services/file.service";

type Props = {
  handleRemove: () => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (url: string) => void;
  value: string | null;
};

const fileService = new FileService();

export const UserImageUploadModal = observer(({ isOpen, handleRemove, onClose, onSuccess, value }: Props) => {
  const [image, setImage] = useState<File | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const onDrop = (acceptedFiles: File[]) => setImage(acceptedFiles[0]);
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxSize: MAX_STATIC_FILE_SIZE,
    multiple: false,
  });

  const handleClose = () => {
    setImage(null);
    setIsImageUploading(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!image) return;
    setIsImageUploading(true);

    try {
      const { asset_url } = await fileService.uploadUserAsset(
        {
          entity_identifier: "",
          entity_type: EFileAssetType.USER_AVATAR,
        },
        image
      );

      console.log(value, "==");
      onSuccess(asset_url);
      setImage(null);
    } catch (error) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error!",
        message: error?.toString() ?? "Something went wrong. Please try again.",
      });
      throw new Error("Error in uploading file.");
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleImageRemove = async () => {
    if (!value) return;
    setIsRemoving(true);
    try {
      if (checkURLValidity(value)) {
        // await fileService.deleteOldUserAsset(value);
      } else {
        const assetId = getAssetIdFromUrl(value);
        // await fileService.deleteUserAsset(assetId);
      }
    } catch (error) {
      console.log("Error in uploading user asset:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className={"relative z-30"} onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-custom-backdrop transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-30 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              as={Fragment}
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-custom-background-100 px-5 py-8 text-left shadow-custom-shadow-md transition-all sm:w-full sm:max-w-xl sm:p-6">
                <div className="space-y-5">
                  <Dialog.Title as="h3" className={"text-lg font-medium leading-6 text-custom-text-100"}>
                    Upload Image
                  </Dialog.Title>

                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div
                        {...getRootProps()}
                        className={cn(
                          "relative grid h-80 w-80 cursor-pointer place-items-center rounded-lg p-12 text-center focus:outline-none focus:ring-2 focus:ring-custom-primary focus:ring-offset-2",
                          {
                            "border-2 border-dashed border-custom-border-200 hover:bg-custom-background-90":
                              (image === null && isDragActive) || !value,
                          }
                        )}
                      >
                        {image !== null || (value && value !== "") ? (
                          <>
                            <button
                              type="button"
                              className="absolute right-0 top-0 z-40 -translate-y-1/2 translate-x-1/2 rounded bg-custom-background-90 px-2 py-0.5 text-xs font-medium text-custom-text-200"
                            >
                              Edit
                            </button>
                            <img
                              className="absolute left-0 top-0 h-full w-full object-cover rounded-md"
                              src={image ? URL.createObjectURL(image) : value ? getFileURL(value) : ""}
                              alt="image"
                            />
                          </>
                        ) : (
                          <div>
                            <UserCircle2 className="mx-auto h-16 w-16 text-custom-text-200" />
                            <span>{isDragActive ? "Drop image here to upload" : "Drag & drop image here"}</span>
                          </div>
                        )}

                        <input {...getInputProps()} />
                      </div>
                    </div>
                    {fileRejections.length > 0 && (
                      <p className="text-sm text-red-500">
                        {fileRejections[0].errors[0].code === "file-too-large"
                          ? "The image size cannot exceed 5 MB."
                          : "Please upload a file in a valid format."}
                      </p>
                    )}
                  </div>
                </div>
                <p className="my-4 text-sm text-custom-text-200">File formats supported- .jpeg, .jpg, .png, .webp</p>
                <div className="flex items-center justify-between">
                  <Button variant="danger" size="sm" onClick={handleImageRemove} disabled={!value}>
                    {isRemoving ? "Removing" : "Remove"}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="neutral-primary" size="sm" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSubmit}
                      disabled={!image}
                      loading={isImageUploading}
                    >
                      {isImageUploading ? "Uploading" : "Upload & Save"}
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}); // states
