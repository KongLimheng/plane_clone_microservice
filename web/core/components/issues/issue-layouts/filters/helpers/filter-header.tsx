import React from "react";
// lucide icons
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/helpers/common.helper";

interface IFilterHeader {
  title: string;
  isPreviewEnabled: boolean;
  handleIsPreviewEnabled: () => void;
}

export const FilterHeader = ({ title, isPreviewEnabled, handleIsPreviewEnabled }: IFilterHeader) => (
  <div
    onClick={handleIsPreviewEnabled}
    className="sticky top-0 flex items-center justify-between gap-2 bg-custom-background-100"
  >
    <div className="select-none flex-grow truncate text-xs font-medium text-custom-text-400">{title}</div>
    <button
      type="button"
      className="select-none grid h-5 w-5 flex-shrink-0 place-items-center rounded hover:bg-custom-background-80"
      onClick={handleIsPreviewEnabled}
    >
      <ChevronUp size={14} className={cn("transition-all", { "rotate-180": isPreviewEnabled })} />
    </button>
  </div>
);
