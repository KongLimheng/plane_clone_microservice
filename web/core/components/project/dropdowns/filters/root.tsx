"use client";

import { useState } from "react";
import { observer } from "mobx-react";
import { Search, X } from "lucide-react";
import { TProjectDisplayFilters, TProjectFilters } from "@plane/types";
import { FilterOption } from "@/components/issues";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { FilterCreatedDate } from "./created-at";
import { FilterAccess } from "./filter-access";
import { FilterLead } from "./lead";
import { FilterMembers } from "./member";

type Props = {
  displayFilters: TProjectDisplayFilters;
  filters: TProjectFilters;
  handleFiltersUpdate: (key: keyof TProjectFilters, value: string | string[]) => void;
  handleDisplayFiltersUpdate: (updatedDisplayProperties: Partial<TProjectDisplayFilters>) => void;
  memberIds?: string[] | undefined;
};
export const ProjectFiltersSelection = observer(
  ({ displayFilters, filters, handleFiltersUpdate, handleDisplayFiltersUpdate, memberIds }: Props) => {
    // states
    const [filtersSearchQuery, setFiltersSearchQuery] = useState("");
    // store
    const { isMobile } = usePlatformOS();

    return (
      <div className="flex size-full flex-col overflow-hidden">
        <div className="bg-custom-background-100 p-2.5 pb-0">
          <div className="flex items-center gap-1.5 rounded border-[0.5px] border-custom-border-200 bg-custom-background-90 px-1.5 py-1 text-xs">
            <Search className="text-custom-text-400" size={12} strokeWidth={2} />
            <input
              type="text"
              className="w-full bg-custom-background-90 outline-none placeholder:text-custom-text-400"
              placeholder="Search"
              value={filtersSearchQuery}
              onChange={(e) => setFiltersSearchQuery(e.target.value)}
              autoFocus={!isMobile}
            />
            {filtersSearchQuery !== "" && (
              <button type="button" className="grid place-items-center" onClick={() => setFiltersSearchQuery("")}>
                <X className="text-custom-text-300" size={12} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        <div className="size-full divide-y divide-custom-border-200 overflow-y-auto px-2.5 vertical-scrollbar scrollbar-sm">
          <div className="py-2">
            <FilterOption
              isChecked={!!displayFilters.my_projects}
              onClick={() => handleDisplayFiltersUpdate({ my_projects: !displayFilters.my_projects })}
              title="My projects"
            />
          </div>

          {/* access */}
          <div className="py-2">
            <FilterAccess
              appliedFilters={filters.access ?? null}
              handleUpdate={(val) => handleFiltersUpdate("access", val)}
              searchQuery={filtersSearchQuery}
            />

            {/* lead */}
            <div className="py-2">
              <FilterLead
                appliedFilters={filters.lead ?? null}
                handleUpdate={(val) => handleFiltersUpdate("lead", val)}
                searchQuery={filtersSearchQuery}
                memberIds={memberIds}
              />
            </div>

            {/* members */}
            <div className="py-2">
              <FilterMembers
                appliedFilters={filters.members ?? null}
                handleUpdate={(val) => handleFiltersUpdate("members", val)}
                searchQuery={filtersSearchQuery}
                memberIds={memberIds}
              />
            </div>

            {/* created date */}
            <div className="py-2">
              <FilterCreatedDate
                appliedFilters={filters.created_at ?? null}
                handleUpdate={(val) => handleFiltersUpdate("created_at", val)}
                searchQuery={filtersSearchQuery}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
