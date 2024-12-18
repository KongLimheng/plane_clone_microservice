"use client";

import { observer } from "mobx-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button, TButtonVariant } from "@plane/ui";
import { EMPTY_STATE_DETAILS, EmptyStateType } from "@/constants/empty-state";
import { cn } from "@/helpers/common.helper";
import { useUserPermissions } from "@/hooks/store";
import { EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";
import { ComicBoxButton } from "./comic-box-button";

export type EmptyStateProps = {
  type: EmptyStateType;
  size?: "sm" | "md" | "lg";
  layout?: "screen-detailed" | "screen-simple";
  additionalPath?: string;
  primaryButtonOnClick?: () => void;
  primaryButtonLink?: string;
  secondaryButtonOnClick?: () => void;
};

export const EmptyState = observer(
  ({
    type,
    size = "lg",
    layout = "screen-detailed",
    additionalPath = "",
    primaryButtonLink,
    primaryButtonOnClick,
    secondaryButtonOnClick,
  }: EmptyStateProps) => {
    // store
    const { allowPermissions } = useUserPermissions();
    // theme
    const { resolvedTheme } = useTheme();
    // if empty state type is not found
    if (!EMPTY_STATE_DETAILS[type]) return null;
    // current empty state details
    const { key, title, description, path, primaryButton, secondaryButton, accessType, access } =
      EMPTY_STATE_DETAILS[type];

    // resolved empty state path
    const resolvedEmptyStatePath = `${additionalPath && additionalPath !== "" ? `${path}${additionalPath}` : path}-${
      resolvedTheme === "light" ? "light" : "dark"
    }.webp`;

    // permission
    const isEditingAllowed =
      access &&
      accessType &&
      allowPermissions(
        access,
        accessType === "workspace" ? EUserPermissionsLevel.WORKSPACE : EUserPermissionsLevel.PROJECT
      );
    const anyButton = primaryButton || secondaryButton;

    // primary button
    const renderPrimaryButton = () => {
      if (!primaryButton) return null;

      const commonProps = {
        size: size,
        variant: "primary" as TButtonVariant,
        prependIcon: primaryButton.icon,
        onClick: primaryButtonOnClick ? primaryButtonOnClick : undefined,
        disabled: !isEditingAllowed,
      };

      if (primaryButton.comicBox) {
        return (
          <ComicBoxButton
            label={primaryButton.text}
            icon={primaryButton.icon}
            title={primaryButton.comicBox?.title}
            description={primaryButton.comicBox?.description}
            onClick={primaryButtonOnClick}
            disabled={!isEditingAllowed}
          />
        );
      } else if (primaryButtonLink) {
        return (
          <Link href={primaryButtonLink}>
            <Button {...commonProps}>{primaryButton.text}</Button>
          </Link>
        );
      } else {
        return <Button {...commonProps}>{primaryButton.text}</Button>;
      }
    };

    // secondary button
    const renderSecondaryButton = () => {
      if (!secondaryButton) return null;

      return (
        <Button
          size={size}
          variant="neutral-primary"
          prependIcon={secondaryButton.icon}
          onClick={secondaryButtonOnClick}
          disabled={!isEditingAllowed}
        >
          {secondaryButton.text}
        </Button>
      );
    };

    return (
      <>
        {layout === "screen-detailed" && (
          <div className="flex items-center justify-center min-h-full overflow-y-auto py-10 md:px-10 px-5">
            <div
              className={cn("flex flex-col gap-5", {
                "md:min-w-[24rem] max-w-[45rem]": size === "sm",
                "md:min-w-[30rem] max-w-[60rem]": size === "lg",
              })}
            >
              <div className="flex flex-col gap-1.5 flex-shrink">
                {description ? (
                  <>
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="text-sm">{description}</p>
                  </>
                ) : (
                  <h3 className="text-xl font-medium">{title}</h3>
                )}
              </div>

              {path && (
                <Image
                  src={resolvedEmptyStatePath}
                  alt={key || "button image"}
                  width={384}
                  height={250}
                  layout="responsive"
                  lazyBoundary="100%"
                />
              )}

              {anyButton && (
                <>
                  <div className="relative flex items-center justify-center gap-2 flex-shrink-0 w-full">
                    {renderPrimaryButton()}
                    {renderSecondaryButton()}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {layout === "screen-simple" && (
          <div className="text-center flex flex-col gap-2.5 items-center">
            <div className={`${size === "sm" ? "size-24" : "size-28"}`}>
              <Image
                src={resolvedEmptyStatePath}
                alt={key || "button image"}
                width={size === "sm" ? 78 : 97}
                height={size === "sm" ? 78 : 96}
                layout="responsive"
                lazyBoundary="100%"
              />
            </div>
            {description ? (
              <>
                <h3 className="text-lg font-medium text-custom-text-300 whitespace-pre-line">{title}</h3>
                <p className="text-base font-medium text-custom-text-400 whitespace-pre-line">{description}</p>
              </>
            ) : (
              <h3 className="text-sm font-medium text-custom-text-400 whitespace-pre-line">{title}</h3>
            )}
          </div>
        )}
      </>
    );
  }
);
