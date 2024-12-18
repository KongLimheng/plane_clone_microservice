import { useRef, useState } from "react";
import { observer } from "mobx-react";
import { ChevronDown, LucideIcon } from "lucide-react";
import { ComboDropDown } from "@plane/ui";
import { cn } from "@/helpers/common.helper";
import { useMember } from "@/hooks/store/use-member";
import { useDropdown } from "@/hooks/use-dropdown";
import { DropdownButton } from "../buttons";
import { BUTTON_VARIANTS_WITH_TEXT } from "../constants";
import { ButtonAvatars } from "./avatar";
import { MemberOptions } from "./member.options";
import { MemberDropdownProps } from "./types";

type Props = {
  projectId?: string;
  icon?: LucideIcon;
  onClose?: () => void;
  renderByDefault?: boolean;
  optionsClassName?: string;
} & MemberDropdownProps;

export const MemberDropdown = observer(
  ({
    button,
    buttonClassName,
    buttonContainerClassName,
    buttonVariant,
    className = "",
    disabled = false,
    dropdownArrow = false,
    dropdownArrowClassName = "",
    optionsClassName = "",
    hideIcon = false,
    multiple,
    onChange,
    onClose,
    placeholder = "Members",
    tooltipContent,
    placement,
    projectId,
    showTooltip = false,
    showUserDetails = false,
    tabIndex,
    value,
    icon,
    renderByDefault = true,
  }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    // refs
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    // popper-js refs
    const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
    const { getUserDetails } = useMember();

    const comboboxProps: any = {
      value,
      onChange,
      disabled,
    };

    console.log(value, "drop");

    if (multiple) comboboxProps.multiple = true;

    const { handleClose, handleKeyDown, handleOnClick } = useDropdown({ dropdownRef, isOpen, onClose, setIsOpen });
    const dropdownOnChange = (val: string & string[]) => {
      onChange(val);
      if (!multiple) handleClose();
    };

    const getDisplayName = (value: string | string[] | null, showUserDetails: boolean, placeholder: string = "") => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          if (value.length === 1) {
            return getUserDetails(value[0])?.display_name || placeholder;
          } else {
            return showUserDetails ? `${value.length} members` : "";
          }
        } else {
          return placeholder;
        }
      } else {
        if (showUserDetails && value) {
          return getUserDetails(value)?.display_name || placeholder;
        } else return placeholder;
      }
    };

    const comboButton = () => (
      <>
        {button ? (
          <button
            disabled={disabled}
            ref={setReferenceElement}
            type="button"
            className={cn("clickable block size-full outline-none", buttonContainerClassName)}
            onClick={handleOnClick}
          >
            {button}
          </button>
        ) : (
          <button
            ref={setReferenceElement}
            type="button"
            onClick={handleOnClick}
            disabled={disabled}
            className={cn(
              "clickable block h-full max-w-full outline-none",
              {
                "cursor-not-allowed text-custom-text-200": disabled,
                "cursor-pointer": !disabled,
              },
              buttonContainerClassName
            )}
          >
            <DropdownButton
              className={cn("text-xs", buttonClassName)}
              isActive={isOpen}
              tooltipHeading={placeholder}
              tooltipContent={tooltipContent ?? `${value?.length ?? 0} assignee${value?.length !== 1 ? "s" : ""}`}
              showTooltip={showTooltip}
              variant={buttonVariant}
              renderToolTipByDefault={renderByDefault}
            >
              {!hideIcon && <ButtonAvatars showTooltip={showTooltip} userIds={value} icon={icon} />}
              {BUTTON_VARIANTS_WITH_TEXT.includes(buttonVariant) && (
                <span className="flex-grow truncate leading-5">
                  {getDisplayName(value, showUserDetails, placeholder)}
                </span>
              )}
              {dropdownArrow && (
                <ChevronDown className={cn("size-2.5 flex-shrink-0", dropdownArrowClassName)} aria-hidden="true" />
              )}
            </DropdownButton>
          </button>
        )}
      </>
    );

    return (
      <ComboDropDown
        as="div"
        ref={dropdownRef}
        tabIndex={tabIndex}
        className={cn("h-full", className)}
        onChange={dropdownOnChange}
        onKeyDown={handleKeyDown}
        button={comboButton}
        renderByDefault={renderByDefault}
        {...comboboxProps}
      >
        {isOpen && (
          <MemberOptions
            optionsClassName={optionsClassName}
            isOpen={isOpen}
            projectId={projectId}
            placement={placement}
            referenceElement={referenceElement}
          />
        )}
      </ComboDropDown>
    );
  }
);
