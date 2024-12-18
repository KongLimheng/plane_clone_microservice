"use client";

import { ReactNode, useRef, useState } from "react";
import { observer } from "mobx-react";
import { usePopper } from "react-popper";
import { ComboDropDown } from "@plane/ui";
import { TDropdownProps } from "./types";

type Props = TDropdownProps & {
  button?: ReactNode;
  dropdownArrow?: boolean;
  dropdownArrowClassName?: string;
  onChange: (val: string) => void;
  onClose?: () => void;
  projectId: string | undefined;
  showDefaultState?: boolean;
  value: string | undefined | null;
  renderByDefault?: boolean;
};

export const StateDropdown = observer(
  ({
    button,
    buttonClassName,
    buttonContainerClassName,
    buttonVariant,
    className = "",
    disabled = false,
    dropdownArrow = false,
    dropdownArrowClassName = "",
    hideIcon = false,
    onChange,
    onClose,
    placement,
    projectId,
    showDefaultState = true,
    showTooltip = false,
    tabIndex,
    value,
    renderByDefault = true,
  }: Props) => {
    // states
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [stateLoader, setStateLoader] = useState(false);
    // refs
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
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

    return <ComboDropDown />;
  }
);
