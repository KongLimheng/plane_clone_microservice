import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Controller, useForm } from "react-hook-form";
import { IWorkspace } from "@plane/types";
import { Button, CustomSelect, Input, setToast, TOAST_TYPE } from "@plane/ui";
import { ORGANIZATION_SIZE, RESTRICTED_URLS } from "@/constants/workspace";
import { useWorkspace } from "@/hooks/store";
import { useAppRouter } from "@/hooks/use-app-router";
import { WorkspaceService } from "@/plane-web/services";

type Props = {
  onSubmit?: (res: IWorkspace) => Promise<void>;
  defaultValues: {
    name: string;
    slug: string;
    organization_size: string;
  };
  setDefaultValues: Dispatch<SetStateAction<IWorkspace>>;
  secondaryButton?: React.ReactNode;
  primaryButtonText?: {
    loading: string;
    default: string;
  };
};

const workspaceService = new WorkspaceService();

export const CreateWorkspaceForm = observer(
  ({
    onSubmit,
    defaultValues,
    setDefaultValues,
    secondaryButton,
    primaryButtonText = {
      loading: "Creating...",
      default: "Create Workspace",
    },
  }: Props) => {
    // states
    const [slugError, setSlugError] = useState(false);
    const [invalidSlug, setInvalidSlug] = useState(false);
    // router
    const router = useAppRouter();
    const { createWorkspace } = useWorkspace();
    // form info
    const {
      handleSubmit,
      control,
      setValue,
      getValues,
      formState: { errors, isSubmitting, isValid },
    } = useForm<IWorkspace>({ defaultValues, mode: "onChange" });

    const handleCreateWorkspace = async (formData: IWorkspace) => {
      await workspaceService
        .workspaceSlugCheck(formData.slug)
        .then(async (res) => {
          if (res.status && !RESTRICTED_URLS.includes(formData.slug)) {
            setSlugError(false);
            await createWorkspace(formData)
              .then(async (res) => {
                setToast({
                  type: TOAST_TYPE.SUCCESS,
                  title: "Success!",
                  message: "Workspace created successfully",
                });

                if (onSubmit) await onSubmit(res);
              })
              .catch(() => {
                setToast({
                  type: TOAST_TYPE.ERROR,
                  title: "Error!",
                  message: "Workspace couldn't created.",
                });
              });
          } else setSlugError(true);
        })
        .catch(() => {
          setToast({
            type: TOAST_TYPE.ERROR,
            title: "Error!",
            message: "Some error occurred while creating workspace. Please try again.",
          });
        });
    };

    useEffect(
      () => () => {
        // when the component unmounts set the default values to whatever user typed in
        setDefaultValues(getValues());
      },
      [getValues, setDefaultValues]
    );
    return (
      <form className="space-y-6 sm:space-y-9" onSubmit={handleSubmit(handleCreateWorkspace)}>
        <div className="space-y-6 sm:space-y-7">
          <div className="space-y-1 text-sm">
            <label htmlFor="workspaceName">
              Workspace Name
              <span className="ml-0.5 text-red-500">*</span>
            </label>

            <div>
              <Controller
                control={control}
                name="name"
                rules={{
                  required: "Workspace name is required",
                  validate: (value) =>
                    /^[\w\s-]*$/.test(value) || `Name can only contain (" "), ( - ), ( _ ) & alphanumeric characters.`,
                  maxLength: { value: 80, message: "Workspace name should not exceed 80 characters" },
                }}
                render={({ field: { value, ref, onChange } }) => (
                  <Input
                    ref={ref}
                    id="workspaceName"
                    type="text"
                    value={value}
                    onChange={(e) => {
                      onChange(e.target.value);
                      setValue("slug", e.target.value.toLocaleLowerCase().trim().replace(/ /g, "-"), {
                        shouldValidate: true,
                      });
                    }}
                    hasError={Boolean(errors.name)}
                    placeholder="Enter workspace name..."
                    className="w-full"
                  />
                )}
              />
              <span className="text-xs text-red-500">{errors?.name?.message}</span>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <label htmlFor="workspaceUrl">
              Workspace URL
              <span className="ml-0.5 text-red-500">*</span>
            </label>
            <div className="flex w-full items-center rounded-md border-[0.5px] border-custom-border-200 px-3">
              <span className="whitespace-nowrap text-sm text-custom-text-200">{window && window.location.host}/</span>
              <Controller
                control={control}
                name="slug"
                rules={{
                  required: "Workspace slug is required",
                  maxLength: { value: 48, message: "Workspace slug should not exceed 48 characters" },
                }}
                render={({ field: { value, onChange } }) => (
                  <Input
                    id="workspaceUrl"
                    type="text"
                    value={value.toLocaleLowerCase().trim().replace(/ /g, "-")}
                    onChange={(e) => {
                      /^[a-zA-Z0-9_-]+$/.test(e.target.value) ? setInvalidSlug(false) : setInvalidSlug(true);
                      onChange(e.target.value.toLowerCase());
                    }}
                    hasError={Boolean(errors.slug)}
                    placeholder="Enter workspace url..."
                    className="block w-full rounded-md border-none bg-transparent !px-0 py-2 text-sm"
                  />
                )}
              />
            </div>
            {slugError && <p className="-mt-3 text-sm text-red-500">Workspace URL is already taken!</p>}
            {invalidSlug && (
              <p className="text-sm text-red-500">{`URL can only contain ( - ), ( _ ) & alphanumeric characters.`}</p>
            )}
            {errors.slug && <span className="text-xs text-red-500">{errors.slug.message}</span>}
          </div>
          <div className="space-y-1 text-sm">
            <span>
              What size is your organization?<span className="ml-0.5 text-red-500">*</span>
            </span>
            <div className="w-full">
              <Controller
                control={control}
                name="organization_size"
                rules={{ required: "This field is required" }}
                render={({ field: { value, onChange } }) => (
                  <CustomSelect
                    value={value}
                    onChange={onChange}
                    input
                    label={
                      ORGANIZATION_SIZE.find((c) => c === value) ?? (
                        <span className="text-custom-text-400">Select organization size</span>
                      )
                    }
                    buttonClassName="!border-[0.5px] !border-custom-border-200 !shadow-none"
                    optionsClassName="w-full"
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
          </div>
        </div>

        <div className="flex items-center gap-4">
          {secondaryButton}
          <Button variant="primary" type="submit" size="md" disabled={!isValid} loading={isSubmitting}>
            {isSubmitting ? primaryButtonText.loading : primaryButtonText.default}
          </Button>
          {!secondaryButton && (
            <Button variant="neutral-primary" type="button" size="md" onClick={() => router.back()}>
              Go back
            </Button>
          )}
        </div>
      </form>
    );
  }
);
