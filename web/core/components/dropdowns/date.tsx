import { useRef, useState } from "react";
import { DayPicker, Matcher } from "react-day-picker";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";
import { CalendarDays, X } from "lucide-react";
import { Combobox } from "@headlessui/react";
import { ComboDropDown } from "@plane/ui";
import { cn } from "@/helpers/common.helper";
import { getDate, renderFormattedDate } from "@/helpers/date-time.helper";
import { useDropdown } from "@/hooks/use-dropdown";
import { DropdownButton } from "./buttons";
import { BUTTON_VARIANTS_WITH_TEXT } from "./constants";
import { TDropdownProps } from "./types";

type Props = TDropdownProps & {
  clearIconClassName?: string;
  optionsClassName?: string;
  icon?: React.ReactNode;
  isClearable?: boolean;
  minDate?: Date;
  maxDate?: Date;
  onChange: (val: Date | null) => void;
  onClose?: () => void;
  value: Date | string | null;
  closeOnSelect?: boolean;
  formatToken?: string;
  renderByDefault?: boolean;
};

export const DateDropdown = ({
  buttonClassName = "",
  buttonContainerClassName,
  buttonVariant,
  className = "",
  clearIconClassName = "",
  optionsClassName = "",
  closeOnSelect = true,
  disabled = false,
  hideIcon = false,
  icon = <CalendarDays className="h-3 w-3 flex-shrink-0" />,
  isClearable = true,
  minDate,
  maxDate,
  onChange,
  onClose,
  placeholder = "Date",
  placement,
  showTooltip = false,
  tabIndex,
  value,
  formatToken,
  renderByDefault = true,
}: Props) => {
  // states
  const [isOpen, setIsOpen] = useState(false);
  // refs
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  // popper-js refs
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  // popper-js init
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: placement ?? "bottom-start",
    modifiers: [
      {
        name: "preventOverflow",
        options: {
          padding: 12,
        },
      },
    ],
  });
  const onOpen = () => {
    if (referenceElement) referenceElement.focus();
  };

  const { handleClose, handleKeyDown, handleOnClick } = useDropdown({
    dropdownRef,
    isOpen,
    onClose,
    onOpen,
    setIsOpen,
  });
  const isDateSelected = value && value.toString().trim() !== "";
  const dropdownOnChange = (val: Date | null) => {
    onChange(val);
    if (closeOnSelect) {
      handleClose();
      referenceElement?.blur();
    }
  };

  const disabledDays: Matcher[] = [];
  if (minDate) disabledDays.push({ before: minDate });
  if (maxDate) disabledDays.push({ after: maxDate });

  const customButton = (
    <button
      type="button"
      className={cn(
        "clickable block h-full max-w-full outline-none",
        {
          "cursor-not-allowed": disabled,
          "cursor-pointer": !disabled,
        },
        buttonContainerClassName
      )}
      ref={setReferenceElement}
      onClick={handleOnClick}
      disabled={disabled}
    >
      <DropdownButton
        className={buttonClassName}
        isActive={isOpen}
        tooltipHeading={placeholder}
        tooltipContent={value ? renderFormattedDate(value, formatToken) : "None"}
        variant={buttonVariant}
        renderToolTipByDefault={renderByDefault}
        showTooltip={showTooltip}
      >
        {!hideIcon && icon}
        {BUTTON_VARIANTS_WITH_TEXT.includes(buttonVariant) && (
          <span className="flex-grow truncate">{value ? renderFormattedDate(value, formatToken) : placeholder}</span>
        )}
        {isClearable && !disabled && isDateSelected && (
          <X
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onChange(null);
            }}
            className={cn("size-2.5 flex-shrink-0", clearIconClassName)}
          />
        )}
      </DropdownButton>
    </button>
  );
  return (
    <ComboDropDown
      disabled={disabled}
      renderByDefault={renderByDefault}
      as={"div"}
      ref={dropdownRef}
      tabIndex={tabIndex}
      className={cn("h-full", className)}
      button={customButton}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          if (!isOpen) handleKeyDown(e);
        } else {
          handleKeyDown(e);
        }
      }}
    >
      {isOpen &&
        createPortal(
          <Combobox.Options data-prevent-outside-click static>
            <div
              ref={setPopperElement}
              style={styles.popper}
              className={cn(
                "my-1 bg-custom-background-100 shadow-custom-shadow-rg rounded-md overflow-hidden p-3 z-20",
                optionsClassName
              )}
              {...attributes.popper}
            >
              <DayPicker
                selected={getDate(value)}
                defaultMonth={getDate(value)}
                onSelect={(date) => dropdownOnChange(date ?? null)}
                showOutsideDays
                initialFocus
                disabled={disabledDays}
                mode="single"
              />
            </div>
          </Combobox.Options>,
          document.body
        )}
    </ComboDropDown>
  );
};
