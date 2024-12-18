import { Tooltip } from "@plane/ui";
import { cn } from "@/helpers/common.helper";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { BACKGROUND_BUTTON_VARIANTS, BORDER_BUTTON_VARIANTS } from "./constants";
import { TButtonVariants } from "./types";

export type DropdownButtonProps = {
  children: React.ReactNode;
  className?: string;
  isActive: boolean;
  tooltipContent: string | React.ReactNode;
  tooltipHeading: string;
  showTooltip: boolean;
  variant: TButtonVariants;
  renderToolTipByDefault?: boolean;
};

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  isActive: boolean;
  tooltipContent: string | React.ReactNode;
  tooltipHeading: string;
  showTooltip: boolean;
  renderToolTipByDefault?: boolean;
};

export const DropdownButton = ({
  children,
  className,
  isActive,
  tooltipContent,
  renderToolTipByDefault = true,
  tooltipHeading,
  showTooltip,
  variant,
}: DropdownButtonProps) => {
  const ButtonToRender: React.FC<ButtonProps> = BORDER_BUTTON_VARIANTS.includes(variant)
    ? BorderButton
    : BACKGROUND_BUTTON_VARIANTS.includes(variant)
      ? BackgroundButton
      : TransparentButton;

  return (
    <ButtonToRender
      className={className}
      isActive={isActive}
      tooltipContent={tooltipContent}
      tooltipHeading={tooltipHeading}
      showTooltip={showTooltip}
      renderToolTipByDefault={renderToolTipByDefault}
    >
      {children}
    </ButtonToRender>
  );
};

const BorderButton = ({
  children,
  className,
  isActive,
  tooltipContent,
  renderToolTipByDefault,
  tooltipHeading,
  showTooltip,
}: ButtonProps) => {
  const { isMobile } = usePlatformOS();
  return (
    <Tooltip
      tooltipHeading={tooltipHeading}
      tooltipContent={tooltipContent}
      disabled={!showTooltip}
      isMobile={isMobile}
      renderByDefault={renderToolTipByDefault}
    >
      <div
        className={cn(
          "size-full flex items-center gap-1.5 border-[0.5px] border-custom-border-300 hover:bg-custom-background-80 rounded text-xs px-2 py-0.5",
          { "bg-custom-background-80": isActive },
          className
        )}
      >
        {children}
      </div>
    </Tooltip>
  );
};

const BackgroundButton = ({
  children,
  className,
  isActive,
  tooltipContent,
  renderToolTipByDefault,
  tooltipHeading,
  showTooltip,
}: ButtonProps) => <></>;

const TransparentButton = ({
  children,
  className,
  isActive,
  tooltipContent,
  renderToolTipByDefault,
  tooltipHeading,
  showTooltip,
}: ButtonProps) => {
  const { isMobile } = usePlatformOS();
  return (
    <Tooltip
      tooltipHeading={tooltipHeading}
      tooltipContent={tooltipContent}
      disabled={!showTooltip}
      isMobile={isMobile}
      renderByDefault={renderToolTipByDefault}
    >
      <div>{children}</div>
    </Tooltip>
  );
};
