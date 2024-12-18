"use client";

import { useState } from "react";
import { observer } from "mobx-react";
import { useDropzone } from "react-dropzone";
import { UserCircle2 } from "lucide-react";
import { Dialog } from "@headlessui/react";
import { EFileAssetType } from "@plane/types/src/enums";
import { Button, EModalWidth, ModalCore } from "@plane/ui";
import { MAX_STATIC_FILE_SIZE } from "@/constants/common";
import { cn } from "@/helpers/common.helper";
import { getAssetIdFromUrl, getFileURL } from "@/helpers/file.helper";
import { checkURLValidity } from "@/helpers/string.helper";
import { useRouterParams, useWorkspace } from "@/hooks/store";
import { FileService } from "@/services/file.service";

type Props = {
  handleRemove: () => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (url: string) => void;
  value: string | null;
};

// services
const fileService = new FileService();

export const WorkspaceImageUploadModal = observer(({ handleRemove, isOpen, onClose, onSuccess, value }: Props) => {
  // states
  const [image, setImage] = useState<File | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  // router
  const { workspaceSlug } = useRouterParams();
  // store hooks
  const { currentWorkspace, updateWorkspaceLogo } = useWorkspace();

  const onDrop = (acceptedFiles: File[]) => setImage(acceptedFiles[0]);
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxSize: MAX_STATIC_FILE_SIZE,
    multiple: false,
  });

  const handleClose = () => {
    setIsImageUploading(false);
    onClose();
    setTimeout(() => {
      setImage(null);
    }, 300);
  };

  const handleImageRemove = async () => {
    if (!workspaceSlug || !value) return;
    setIsRemoving(true);
    try {
      if (checkURLValidity(value)) {
        await fileService.deleteOldWorkspaceAsset(currentWorkspace?.id ?? "", value);
      } else {
        const assetId = getAssetIdFromUrl(value);
        await fileService.deleteOldWorkspaceAsset(workspaceSlug, assetId);
      }
      await handleRemove();
      handleClose();
    } catch (error) {
      console.log("Error in removing workspace asset:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSubmit = async () => {
    if (!image || !workspaceSlug || !currentWorkspace) return;
    setIsImageUploading(true);

    try {
      const { asset_url } = await fileService.uploadWorkspaceAsset(
        workspaceSlug,
        { entity_identifier: currentWorkspace.id, entity_type: EFileAssetType.WORKSPACE_LOGO },
        image
      );

      updateWorkspaceLogo(workspaceSlug, asset_url);
      onSuccess(asset_url);
    } catch (error) {
      console.log("error", error);
      throw new Error("Error in uploading file.");
    } finally {
      setIsImageUploading(false);
    }
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose} className="px-5 py-8" width={EModalWidth.XL}>
      <div className="space-y-5">
        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-custom-text-100">
          Upload image
        </Dialog.Title>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div
              {...getRootProps()}
              className={cn(
                " relative grid size-80 cursor-pointer place-items-center rounded-lg p-12 text-center focus:outline-none focus:ring-2 focus:ring-custom-primary focus:ring-offset-2",
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
                    src={image ? URL.createObjectURL(image) : value ? getFileURL(value) : ""}
                    alt="image"
                    className="absolute left-0 top-0 h-full w-full rounded-md object-cover"
                  />
                </>
              ) : (
                <div>
                  <UserCircle2 className="mx-auto h-16 w-16 text-custom-text-200" />
                  <span className="mt-2 block text-sm font-medium text-custom-text-200">
                    {isDragActive ? "Drop image here to upload" : "Drag & drop image here"}
                  </span>
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
        <Button variant="danger" size="sm" onClick={handleImageRemove} disabled={!value} loading={isRemoving}>
          {isRemoving ? "Removing" : "Remove"}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="neutral-primary" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!image} loading={isImageUploading}>
            {isImageUploading ? "Uploading" : "Upload & Save"}
          </Button>
        </div>
      </div>
    </ModalCore>
  );
});
