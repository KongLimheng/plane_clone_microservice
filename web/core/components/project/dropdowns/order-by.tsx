"use client";

import { ArrowDownWideNarrow, Check, ChevronDown } from "lucide-react";
import { TProjectOrderByOptions } from "@plane/types";
import { CustomMenu, getButtonStyling } from "@plane/ui";
import { PROJECT_ORDER_BY_OPTIONS } from "@/constants/project";
import { cn } from "@/helpers/common.helper";

type Props = {
  onChange: (value: TProjectOrderByOptions) => void;
  value: TProjectOrderByOptions | undefined;
  isMobile?: boolean;
};

const DISABLED_ORDERING_OPTIONS = ["sort_order"];

export const ProjectOrderByDropdown = ({ onChange, value, isMobile = false }: Props) => {
  const orderByDetails = PROJECT_ORDER_BY_OPTIONS.find((option) => value?.includes(option.key));
  const isDescending = value?.[0] === "-";
  const isOrderingDisabled = !!value && DISABLED_ORDERING_OPTIONS.includes(value);

  return (
    <CustomMenu
      customButton={
        <>
          {isMobile ? (
            <div className="flex text-sm items-center gap-2 neutral-primary text-custom-text-200">
              <ArrowDownWideNarrow className="h-3 w-3" />
              {orderByDetails?.label}
              <ChevronDown className="h-3 w-3" strokeWidth={2} />
            </div>
          ) : (
            <div className={cn(getButtonStyling("neutral-primary", "sm"), "px-2 text-custom-text-200")}>
              <ArrowDownWideNarrow className="h-3 w-3" />
              {orderByDetails?.label}
              <ChevronDown className="h-3 w-3" strokeWidth={2} />
            </div>
          )}
        </>
      }
      className={`${isMobile && "flex w-full justify-center"}`}
      closeOnSelect
      placement="bottom-end"
    >
      {PROJECT_ORDER_BY_OPTIONS.map((opt) => (
        <CustomMenu.MenuItem
          onClick={() => {
            if (isDescending) {
              onChange(opt.key === "sort_order" ? opt.key : (`-${opt.key}` as TProjectOrderByOptions));
            } else {
              onChange(opt.key);
            }
          }}
          key={opt.key}
          className="flex items-center justify-between gap-2"
        >
          {opt.label}
          {value?.includes(opt.key) && <Check className="size-3" />}
        </CustomMenu.MenuItem>
      ))}
      <hr className="my-2 border-custom-border-200" />
      <CustomMenu.MenuItem
        onClick={() => {
          if (isDescending) onChange(value.slice(1) as TProjectOrderByOptions);
        }}
        disabled={isOrderingDisabled}
        className="flex items-center justify-between gap-2"
      >
        Ascending
        {!isOrderingDisabled && !isDescending && <Check className="h-3 w-3" />}
      </CustomMenu.MenuItem>
      <CustomMenu.MenuItem
        className="flex items-center justify-between gap-2"
        onClick={() => {
          if (!isDescending) onChange(`-${value}` as TProjectOrderByOptions);
        }}
        disabled={isOrderingDisabled}
      >
        Descending
        {!isOrderingDisabled && isDescending && <Check className="h-3 w-3" />}
      </CustomMenu.MenuItem>
    </CustomMenu>
  );
};
