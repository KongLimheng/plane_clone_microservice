"use client";

import { useState } from "react";
import { isEmpty } from "lodash";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { IFormattedInstanceConfiguration, TInstanceGithubAuthenticationConfigurationKeys } from "@plane/types";
import { Button, cn, getButtonStyling, Loader, setToast, Spinner, TOAST_TYPE } from "@plane/ui";
import {
  CodeBlock,
  ConfirmDiscardModal,
  ControllerInput,
  CopyField,
  TControllerInputFormField,
  TCopyField,
} from "@/components/common";
import { API_BASE_URL } from "@/helpers/index";
import { useInstance } from "@/hooks/store";

type Props = {
  config: IFormattedInstanceConfiguration;
};

type GithubConfigFormValues = Record<TInstanceGithubAuthenticationConfigurationKeys, string>;

export const InstanceGithubConfigForm = ({ config }: Props) => {
  // states
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] = useState(false);
  // store hooks
  const { updateInstanceConfigurations } = useInstance();
  // form data
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<GithubConfigFormValues>({
    defaultValues: {
      GITHUB_CLIENT_ID: config["GITHUB_CLIENT_ID"],
      GITHUB_CLIENT_SECRET: config["GITHUB_CLIENT_SECRET"],
    },
  });

  const originURL = !isEmpty(API_BASE_URL) ? API_BASE_URL : typeof window !== "undefined" ? window.location.origin : "";

  const GITHUB_FORM_FIELDS: TControllerInputFormField[] = [
    {
      key: "GITHUB_CLIENT_ID",
      type: "text",
      label: "Client ID",
      description: (
        <>
          You will get this from your{" "}
          <a
            tabIndex={-1}
            href="https://github.com/settings/applications/new"
            target="_blank"
            className="text-custom-primary-100 hover:underline"
            rel="noreferrer"
          >
            GitHub OAuth application settings.
          </a>
        </>
      ),
      placeholder: "70a44354520df8bd9bcd",
      error: Boolean(errors.GITHUB_CLIENT_ID),
      required: true,
    },
    {
      key: "GITHUB_CLIENT_SECRET",
      type: "password",
      label: "Client secret",
      description: (
        <>
          Your client secret is also found in your{" "}
          <a
            tabIndex={-1}
            href="https://github.com/settings/applications/new"
            target="_blank"
            className="text-custom-primary-100 hover:underline"
            rel="noreferrer"
          >
            GitHub OAuth application settings.
          </a>
        </>
      ),
      placeholder: "9b0050f94ec1b744e32ce79ea4ffacd40d4119cb",
      error: Boolean(errors.GITHUB_CLIENT_SECRET),
      required: true,
    },
  ];

  const GITHUB_SERVICE_FIELD: TCopyField[] = [
    {
      key: "Origin_URL",
      label: "Origin URL",
      url: originURL,
      description: (
        <>
          We will auto-generate this. Paste this into the <CodeBlock darkerShade>Authorized origin URL</CodeBlock> field{" "}
          <a
            tabIndex={-1}
            href="https://github.com/settings/applications/new"
            target="_blank"
            className="text-custom-primary-100 hover:underline"
            rel="noreferrer"
          >
            here.
          </a>
        </>
      ),
    },
    {
      key: "Callback_URI",
      label: "Callback URI",
      url: `${originURL}/auth/github/callback/`,
      description: (
        <>
          We will auto-generate this. Paste this into your <CodeBlock darkerShade>Authorized Callback URI</CodeBlock>{" "}
          field{" "}
          <a
            tabIndex={-1}
            href="https://github.com/settings/applications/new"
            target="_blank"
            className="text-custom-primary-100 hover:underline"
            rel="noreferrer"
          >
            here.
          </a>
        </>
      ),
    },
  ];

  const onSubmit = async (formData: GithubConfigFormValues) => {
    updateInstanceConfigurations(formData)
      .then((res) => {
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Done!",
          message: "Your GitHub authentication is configured. You should test it now.",
        });

        reset({
          GITHUB_CLIENT_ID: res.find((item) => item.key === "GITHUB_CLIENT_ID")?.value,
          GITHUB_CLIENT_SECRET: res.find((item) => item.key === "GITHUB_CLIENT_SECRET")?.value,
        });
      })
      .catch((err) => console.error(err));
  };

  const handleGoBack = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (isDirty) {
      e.preventDefault();
      setIsDiscardChangesModalOpen(true);
    }
  };
  return (
    <>
      <ConfirmDiscardModal
        isOpen={isDiscardChangesModalOpen}
        onDiscardHref="/authentication"
        handleClose={() => setIsDiscardChangesModalOpen(false)}
      />

      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full">
          <div className="flex flex-col gap-y-4 col-span-2 md:col-span-1 pt-1">
            <div className="pt-2.5 text-xl font-medium">GitHub-provided details for Plane</div>
            {GITHUB_FORM_FIELDS.map(({ key, type, label, description, placeholder, error, required }) => (
              <ControllerInput
                key={key}
                control={control}
                type={type}
                label={label}
                name={key}
                description={description}
                placeholder={placeholder}
                error={error}
                required={required}
              />
            ))}

            <div className="flex flex-col gap-1 pt-4">
              <div className="flex items-center gap-4">
                <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isSubmitting} disabled={!isDirty}>
                  {isSubmitting ? (
                    <div className="flex justify-center items-center gap-2">
                      <Spinner className="h-4 w-4" />
                      Saving...
                    </div>
                  ) : (
                    "Save change"
                  )}
                </Button>
                <Link
                  href="/authentication"
                  className={cn(getButtonStyling("link-neutral", "md"), "font-medium")}
                  onClick={handleGoBack}
                >
                  Go back
                </Link>
              </div>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="flex flex-col gap-y-4 px-5 pt-1.5 pb-4 bg-custom-background-80/60 rounded-lg">
              <div className="pt-2 text-xl font-medium">Plane-provided details for GitHub</div>
              {GITHUB_SERVICE_FIELD.map(({ label, description, key, url }) => (
                <CopyField key={key} description={description} label={label} url={url} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};