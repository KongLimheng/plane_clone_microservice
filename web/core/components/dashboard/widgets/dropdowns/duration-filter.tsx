"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CustomMenu } from "@plane/ui";
import { DateFilterModal } from "@/components/core/filters";
import { DURATION_FILTER_OPTIONS, EDurationFilters } from "@/constants/dashboard";
import { getDurationFilterDropdownLabel } from "@/helpers/dashboard.helper";

type Props = {
  customDates?: string[];
  onChange: (value: EDurationFilters, customDates?: string[]) => void;
  value: EDurationFilters;
};

export const DurationFilterDropdown = ({ customDates, onChange, value }: Props) => {
  // states
  const [isDateFilterModalOpen, setIsDateFilterModalOpen] = useState(false);

  return (
    <>
      <DateFilterModal
        isOpen={isDateFilterModalOpen}
        handleClose={() => setIsDateFilterModalOpen(false)}
        onSelect={(val) => onChange(EDurationFilters.CUSTOM, val)}
        title="Due date"
      />

      <CustomMenu
        className="flex-shrink-0"
        customButton={
          <div className="px-3 py-2 border-[0.5px] border-custom-border-300 hover:bg-custom-background-80 focus:bg-custom-background-80 text-xs font-medium whitespace-nowrap outline-none flex rounded-md items-center gap-2">
            {getDurationFilterDropdownLabel(value, customDates ?? [])}
            <ChevronDown className="size-3" />
          </div>
        }
        placement="bottom-end"
        closeOnSelect
      >
        {DURATION_FILTER_OPTIONS.map((option) => (
          <CustomMenu.MenuItem
            onClick={() => {
              if (option.key === "custom") setIsDateFilterModalOpen(true);
              else onChange(option.key);
            }}
            key={option.key}
          >
            {option.label}
          </CustomMenu.MenuItem>
        ))}
      </CustomMenu>
    </>
  );
};
