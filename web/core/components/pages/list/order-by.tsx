"use client";

import { ArrowDownWideNarrow, ArrowUpWideNarrow, Check, ChevronDown } from "lucide-react";
import { TPageFiltersSortKey, TPageFiltersSortBy } from "@plane/types";
import { CustomMenu, getButtonStyling } from "@plane/ui";
import { PAGE_SORTING_KEY_OPTIONS } from "@/constants/page";
import { cn } from "@/helpers/common.helper";

type Props = {
  onChange: (value: { key?: TPageFiltersSortKey; order?: TPageFiltersSortBy }) => void;
  sortBy: TPageFiltersSortBy;
  sortKey: TPageFiltersSortKey;
};

export const PageOrderByDropdown: React.FC<Props> = (props) => {
  const { onChange, sortBy, sortKey } = props;

  const orderByDetails = PAGE_SORTING_KEY_OPTIONS.find((option) => sortKey === option.key);
  const isDescending = sortBy === "desc";

  return (
    <CustomMenu
      placement="bottom-end"
      maxHeight="lg"
      closeOnSelect
      customButton={
        <div className={cn(getButtonStyling("neutral-primary", "sm"), "px-2 text-custom-text-300")}>
          {!isDescending ? <ArrowUpWideNarrow className="size-3" /> : <ArrowDownWideNarrow className="size-3" />}
          {orderByDetails?.label}
          <ChevronDown className="size-3" strokeWidth={2} />
        </div>
      }
    >
      {PAGE_SORTING_KEY_OPTIONS.map((option) => (
        <CustomMenu.MenuItem
          key={option.key}
          className="flex items-center justify-between gap-2"
          onClick={() => onChange({ key: option.key })}
        >
          {option.label}
          {sortKey === option.key && <Check className="size-3" />}
        </CustomMenu.MenuItem>
      ))}

      <hr className="my-2 border-custom-border-200" />
      <CustomMenu.MenuItem
        onClick={() => isDescending && onChange({ order: "asc" })}
        className="flex items-center justify-between gap-2"
      >
        Ascending
        {!isDescending && <Check className="h-3 w-3" />}
      </CustomMenu.MenuItem>

      <CustomMenu.MenuItem
        className="flex items-center justify-between gap-2"
        onClick={() => {
          if (!isDescending)
            onChange({
              order: "desc",
            });
        }}
      >
        Descending
        {isDescending && <Check className="h-3 w-3" />}
      </CustomMenu.MenuItem>
    </CustomMenu>
  );
};
