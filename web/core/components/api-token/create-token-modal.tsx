"use client";

import { useState } from "react";
import { mutate } from "swr";
import { IApiToken } from "@plane/types";
import { EModalPosition, EModalWidth, ModalCore, setToast, TOAST_TYPE } from "@plane/ui";
import { API_TOKENS_LIST } from "@/constants/fetch-key";
import { renderFormattedDate } from "@/helpers/date-time.helper";
import { csvDownload } from "@/helpers/download.helper";
import { useRouterParams } from "@/hooks/store";
import { APITokenService } from "@/services/api_token.service";
import { CreateApiTokenForm } from "./form";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

// services
const apiTokenService = new APITokenService();

export const CreateApiTokenModal: React.FC<Props> = (props) => {
  const { isOpen, onClose } = props;
  // states
  const [neverExpires, setNeverExpires] = useState<boolean>(false);
  const [generatedToken, setGeneratedToken] = useState<IApiToken | null | undefined>(null);
  // router
  const { workspaceSlug } = useRouterParams();
  const handleClose = () => {
    onClose();

    setTimeout(() => {
      setNeverExpires(false);
      setGeneratedToken(null);
    }, 350);
  };

  console.log(generatedToken);

  const downloadSecretKey = (data: IApiToken) => {
    const csvData = {
      Title: data.label,
      Description: data.description,
      Expiry: data.expired_at ? (renderFormattedDate(data.expired_at)?.replace(",", " ") ?? "") : "Never expires",
      "Secret key": data.token ?? "",
    };

    csvDownload(csvData, `secret-key-${Date.now()}`);
  };

  const handleCreateToken = async (data: Partial<IApiToken>) => {
    if (!workspaceSlug) return;

    await apiTokenService
      .createApiToken(workspaceSlug, data)
      .then((res) => {
        setGeneratedToken(res);
        downloadSecretKey(res);

        mutate<IApiToken[]>(
          API_TOKENS_LIST(workspaceSlug),
          (prev) => {
            if (!prev) return;
            return [res, ...prev];
          },
          false
        );
      })
      .catch((err) => {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: err.message,
        });

        throw err;
      });
  };
  //   {
  //     "id": "cb593429-e336-4f93-a303-939928802e75",
  //     "created_at": "2024-11-26T12:23:52.274709+07:00",
  //     "updated_at": "2024-11-26T12:23:52.274709+07:00",
  //     "deleted_at": null,
  //     "label": "new",
  //     "description": "",
  //     "is_active": true,
  //     "last_used": null,
  //     "token": "plane_api_d05a6c5f2c54431e9ebb5719847d9274",
  //     "user_type": 0,
  //     "expired_at": null,
  //     "is_service": false,
  //     "created_by": "8f341c5f-940f-42cb-8949-83adc2f91bd5",
  //     "updated_by": "8f341c5f-940f-42cb-8949-83adc2f91bd5",
  //     "user": "8f341c5f-940f-42cb-8949-83adc2f91bd5",
  //     "workspace": "93e31888-1738-42c8-9cd1-693f6a21b1a2"
  // }
  return (
    <ModalCore isOpen={isOpen} handleClose={onClose} position={EModalPosition.TOP} width={EModalWidth.XXL}>
      {generatedToken ? (
        <div>hi</div>
      ) : (
        <CreateApiTokenForm
          handleClose={handleClose}
          neverExpires={neverExpires}
          toggleNeverExpires={() => setNeverExpires((prev) => !prev)}
          onSubmit={handleCreateToken}
        />
      )}
    </ModalCore>
  );
};
