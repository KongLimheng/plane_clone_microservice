"use client";

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Controller, useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { IWorkspace } from "@plane/types";
import { Button, CustomSelect, Input, setToast, TOAST_TYPE } from "@plane/ui";
import { LogoSpinner } from "@/components/common";
import { WorkspaceImageUploadModal } from "@/components/core";
import { ORGANIZATION_SIZE } from "@/constants/workspace";
import { cn } from "@/helpers/common.helper";
import { getFileURL } from "@/helpers/file.helper";
import { copyUrlToClipboard } from "@/helpers/string.helper";
import { useUserPermissions, useWorkspace } from "@/hooks/store";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";

const defaultValues: Partial<IWorkspace> = {
  name: "",
  url: "",
  organization_size: "2-10",
  logo_url: null,
};

export const WorkspaceDetails = observer(() => {
  // states
  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  // store hooks
  const { currentWorkspace, updateWorkspace } = useWorkspace();
  const { allowPermissions } = useUserPermissions();
  // form info
  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<IWorkspace>({
    defaultValues: { ...defaultValues, ...currentWorkspace },
  });
  // derived values
  const workspaceLogo = watch("logo_url");

  const isAdmin = allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.WORKSPACE);

  const handleCopyUrl = () => {
    if (!currentWorkspace) return;

    copyUrlToClipboard(`${currentWorkspace.slug}`).then(() => {
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Workspace URL copied to the clipboard.",
      });
    });
  };

  const handleRemoveLogo = async () => {
    if (!currentWorkspace) return;

    await updateWorkspace(currentWorkspace.slug, {
      logo_url: "",
    })
      .then(() => {
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Success!",
          message: "Workspace picture removed successfully",
        });
      })
      .catch(() => {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: "There was some error in deleting your profile picture. Please try again.",
        });
      });
  };

  const onSubmit = async (formData: IWorkspace) => {
    if (!currentWorkspace) return;

    setIsLoading(true);
    const payload: Partial<IWorkspace> = {
      name: formData.name,
      organization_size: formData.organization_size,
    };

    await updateWorkspace(currentWorkspace.slug, payload)
      .then((res) =>
        setToast({
          title: "Success!",
          type: TOAST_TYPE.SUCCESS,
          message: "Workspace updated successfully",
        })
      )
      .catch((err) => console.error(err));

    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (currentWorkspace) reset({ ...currentWorkspace });
  }, [currentWorkspace, reset]);

  if (!currentWorkspace)
    return (
      <div className="grid h-full w-full place-items-center px-4 sm:px-0">
        <LogoSpinner />
      </div>
    );

  return (
    <>
      <Controller
        control={control}
        name="logo_url"
        render={({ field: { value, onChange } }) => (
          <WorkspaceImageUploadModal
            value={value}
            handleRemove={handleRemoveLogo}
            isOpen={isImageUploadModalOpen}
            onClose={() => setIsImageUploadModalOpen(false)}
            onSuccess={(imgUrl) => {
              onChange(imgUrl);
              setIsImageUploadModalOpen(false);
            }}
          />
        )}
      />
      <div className={cn("w-full overflow-y-auto md:pr-9 pr-4", { "opacity-60": !isAdmin })}>
        <div className="flex gap-5 border-b border-custom-border-100 pb-7 items-start">
          <div className="flex flex-col gap-1">
            <button type="button" onClick={() => setIsImageUploadModalOpen(true)} disabled={!isAdmin}>
              {workspaceLogo && workspaceLogo !== "" ? (
                <div className="relative mx-auto flex h-14 w-14">
                  <img
                    src={getFileURL(workspaceLogo)}
                    className="absolute left-0 top-0 h-full w-full rounded-md object-cover"
                    alt="Workspace Logo"
                  />
                </div>
              ) : (
                <div className="relative flex h-14 w-14 items-center justify-center rounded bg-gray-700 p-4 uppercase text-white">
                  {currentWorkspace?.name?.charAt(0) ?? "N"}
                </div>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <div className="text-lg font-semibold leading-6 mb:-my-5">{watch("name")}</div>
            <button type="button" onClick={handleCopyUrl} className="text-sm tracking-tight text-left">{`${
              typeof window !== "undefined" && window.location.origin.replace("http://", "").replace("https://", "")
            }/${currentWorkspace.slug}`}</button>
            {isAdmin && (
              <button
                className="flex items-center gap-1.5 text-left text-xs font-medium text-custom-primary-100"
                onClick={() => setIsImageUploadModalOpen(true)}
              >
                {workspaceLogo && workspaceLogo !== "" ? (
                  <>
                    <Pencil className="size-3" />
                    Edit logo
                  </>
                ) : (
                  "Upload logo"
                )}
              </button>
            )}
          </div>
        </div>

        <div className="my-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 w-full items-center justify-between gap-10 xl:grid-cols-2 2xl:grid-cols-3">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm">Workspace name</h4>
              <Controller
                control={control}
                name="name"
                rules={{
                  required: "Name is required",
                  maxLength: { value: 80, message: "Workspace name should not exceed 80 characters" },
                }}
                render={({ field: { value, onChange } }) => (
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={value}
                    onChange={onChange}
                    hasError={Boolean(errors.name)}
                    placeholder="Name"
                    className="w-full rounded-md font-medium"
                    disabled={!isAdmin}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="text-sm">Company size</h4>
              <Controller
                control={control}
                name="organization_size"
                render={({ field: { value, onChange } }) => (
                  <CustomSelect
                    value={value}
                    input
                    onChange={onChange}
                    label={ORGANIZATION_SIZE.find((c) => c === value) ?? "Select organization size"}
                    optionsClassName="w-full"
                    disabled={!isAdmin}
                    buttonClassName="!border-[0.5px] !border-custom-border-200 !shadow-none"
                  >
                    {ORGANIZATION_SIZE.map((item) => (
                      <CustomSelect.Option key={item} value={item}>
                        {item}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="text-sm">Workspace URL</h4>
              <Controller
                control={control}
                name="url"
                render={({ field: { onChange, ref } }) => (
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    value={`${
                      typeof window !== "undefined" &&
                      window.location.origin.replace("http://", "").replace("https://", "")
                    }/${currentWorkspace.slug}`}
                    onChange={onChange}
                    ref={ref}
                    hasError={Boolean(errors.url)}
                    className="w-full"
                    disabled
                  />
                )}
              />
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center justify-between py-2">
              <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isLoading}>
                {isLoading ? "Updating" : "Update workspace"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
});