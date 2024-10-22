import React, { useRef } from "react";
import { Tooltip } from "../tooltip";
import { cn } from "../../helpers";

export type TAvatarSize = "sm" | "md" | "base" | "lg" | number;

type Props = {
  /**
   * The name of the avatar which will be displayed on the tooltip
   */
  name?: string;
  /**
   * The background color if the avatar image fails to load
   */
  fallbackBackgroundColor?: string;
  /**
   * The text to display if the avatar image fails to load
   */
  fallbackText?: string;
  /**
   * The text color if the avatar image fails to load
   */
  fallbackTextColor?: string;
  /**
   * Whether to show the tooltip or not
   * @default true
   */
  showTooltip?: boolean;
  /**
   * The size of the avatars
   * Possible values: "sm", "md", "base", "lg"
   * @default "md"
   */
  size?: TAvatarSize;
  /**
   * The shape of the avatar
   * Possible values: "circle", "square"
   * @default "circle"
   */
  shape?: "circle" | "square";
  /**
   * The source of the avatar image
   */
  src?: string;
  /**
   * The custom CSS class name to apply to the component
   */
  className?: string;
};

export const getSizeInfo = (size: TAvatarSize) => {
  switch (size) {
    case "sm":
      return {
        avatarSize: "h-4 w-4",
        fontSize: "text-xs",
        spacing: "-space-x-1",
      };

    case "md":
      return {
        avatarSize: "h-5 w-5",
        fontSize: "text-xs",
        spacing: "-space-x-1",
      };
    case "base":
      return {
        avatarSize: "h-6 w-6",
        fontSize: "text-sm",
        spacing: "-space-x-1.5",
      };
    case "lg":
      return {
        avatarSize: "h-7 w-7",
        fontSize: "text-sm",
        spacing: "-space-x-1.5",
      };
    default:
      return {
        avatarSize: "h-5 w-5",
        fontSize: "text-xs",
        spacing: "-space-x-1",
      };
  }
};

export const getBorderRadius = (shape: "circle" | "square") => {
  switch (shape) {
    case "circle":
      return "rounded-full";
    case "square":
      return "rounded";
    default:
      return "rounded-full";
  }
};

export const isAValidNumber = (value: any) => typeof value === "number" && !isNaN(value);

export const Avatar = ({
  size = "md",
  shape = "circle",
  src,
  className,
  showTooltip,
  fallbackBackgroundColor,
  fallbackText,
  fallbackTextColor,
  name,
}: Props) => {
  // get size details based on the size prop
  const sizeInfo = getSizeInfo(size);

  return (
    <Tooltip tooltipContent={fallbackText ?? name ?? "?"} disabled={!showTooltip}>
      <div
        className={cn("grid place-items-center overflow-hidden", getBorderRadius(shape), {
          [sizeInfo.avatarSize]: !isAValidNumber(size),
        })}
        style={isAValidNumber(size) ? { height: `${size}px`, width: `${size}px` } : {}}
        tabIndex={-1}
      >
        {src ? (
          <img src={src} className={cn("h-full w-full", getBorderRadius(shape), className)} alt={name} />
        ) : (
          <div
            className={cn(
              sizeInfo.fontSize,
              "grid h-full w-full place-items-center",
              getBorderRadius(shape),
              className
            )}
            style={{
              backgroundColor: fallbackBackgroundColor ?? "rgba(var(--color-primary-500))",
              color: fallbackTextColor ?? "#fff",
            }}
          >
            {name ? name[0].toUpperCase() : (fallbackText ?? "?")}
          </div>
        )}
      </div>
    </Tooltip>
  );
};
