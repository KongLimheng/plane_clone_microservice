import { useEffect } from "react";
import { useOutsideClickDetector } from "@plane/helpers";
import { useDropdownKeyDown } from "./use-dropdown-key-down";
import { usePlatformOS } from "./use-platform-os";

type TArguments = {
  dropdownRef: React.RefObject<HTMLDivElement>;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  isOpen: boolean;
  onClose?: () => void;
  onOpen?: () => Promise<void> | void;
  query?: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setQuery?: React.Dispatch<React.SetStateAction<string>>;
};

export const useDropdown = ({
  dropdownRef,
  inputRef,
  isOpen,
  onClose,
  onOpen,
  query,
  setIsOpen,
  setQuery,
}: TArguments) => {
  const { isMobile } = usePlatformOS();
  const searchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (query !== "" && e.key === "Escape") {
      e.stopPropagation();
      setQuery?.("");
    }
  };

  const handleClose = () => {
    if (!isOpen) return;
    setIsOpen(false);
    onClose?.();
    setQuery?.("");
  };

  const toggleDropdown = () => {
    if (!isOpen) onOpen?.();
    setIsOpen((prevIsOpen) => !prevIsOpen);
    if (isOpen) onClose?.();
  };

  const handleKeyDown = useDropdownKeyDown(toggleDropdown, handleClose);

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    toggleDropdown();
  };

  // close the dropdown when the user clicks outside of the dropdown
  useOutsideClickDetector(dropdownRef, handleClose);

  // focus the search input when the dropdown is open
  useEffect(() => {
    if (isOpen && inputRef?.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [inputRef, isOpen, isMobile]);

  return {
    handleClose,
    handleKeyDown,
    handleOnClick,
    searchInputKeyDown,
  };
};
