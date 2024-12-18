import { useState } from "react";
import { mutate } from "swr";
import { IApiToken } from "@plane/types";
import { AlertModalCore, setToast, TOAST_TYPE } from "@plane/ui";
import { API_TOKENS_LIST } from "@/constants/fetch-key";
import { useRouterParams } from "@/hooks/store";
import { APITokenService } from "@/services/api_token.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tokenId: string;
};

const apiTokenService = new APITokenService();

export const DeleteApiTokenModal = ({ isOpen, onClose, tokenId }: Props) => {
  // states
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  // router params
  const { workspaceSlug } = useRouterParams();

  const handleClose = () => {
    onClose();
    setDeleteLoading(false);
  };

  const handleDeletion = async () => {
    if (!workspaceSlug) return;
    setDeleteLoading(true);
    await apiTokenService
      .deleteApiToken(workspaceSlug, tokenId)
      .then(() => {
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Success!",
          message: "Token deleted successfully.",
        });

        mutate<IApiToken[]>(
          API_TOKENS_LIST(workspaceSlug),
          (prevData) => (prevData ?? []).filter((token) => token.id !== tokenId),
          false
        );

        handleClose();
      })
      .catch((err) =>
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: err?.message ?? "Something went wrong. Please try again.",
        })
      )
      .finally(() => setDeleteLoading(false));
  };

  return (
    <AlertModalCore
      handleClose={handleClose}
      handleSubmit={handleDeletion}
      isSubmitting={deleteLoading}
      isOpen={isOpen}
      title="Delete API token"
      content={
        <>
          Any application using this token will no longer have the access to Plane data. This action cannot be undone.
        </>
      }
    />
  );
};
