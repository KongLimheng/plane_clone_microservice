import { useCallback } from "react";
import { observer } from "mobx-react";
import { ListFilter } from "lucide-react";
import { TProjectFilters } from "@plane/types";
import { cn } from "@/helpers/common.helper";
import { calculateTotalFilters } from "@/helpers/filter.helper";
import { useRouterParams } from "@/hooks/store";
import { useMember } from "@/hooks/store/use-member";
import { useProjectFilter } from "@/hooks/store/use-project-filter";
import { FiltersDropdown } from "../issues";
import { ProjectFiltersSelection, ProjectOrderByDropdown } from "./dropdowns";

type Props = {
  filterMenuButton?: React.ReactNode;
  classname?: string;
  filterClassname?: string;
  isMobile?: boolean;
};
const HeaderFilters = observer(({ classname, filterClassname, filterMenuButton, isMobile }: Props) => {
  // router
  const { workspaceSlug } = useRouterParams();
  const {
    currentWorkspaceDisplayFilters: displayFilters,
    currentWorkspaceFilters: filters,
    updateFilters,
    updateDisplayFilters,
  } = useProjectFilter();

  const {
    workspace: { workspaceMemberIds },
  } = useMember();

  const isFiltersApplied = calculateTotalFilters(filters ?? {}) !== 0;

  const handleFilters = useCallback(
    (key: keyof TProjectFilters, value: string | string[]) => {
      if (!workspaceSlug) return;
      let newValues = filters?.[key] ?? [];

      if (Array.isArray(value)) {
        if (key === "created_at" && newValues.find((v) => v.includes("custom"))) newValues = [];
        value.forEach((val) => {
          if (!newValues.includes(val)) newValues.push(val);
          else newValues.splice(newValues.indexOf(val), 1);
        });
      } else {
        if (filters?.[key]?.includes(value)) newValues.splice(newValues.indexOf(value), 1);
        else {
          if (key === "created_at") newValues = [value];
          else newValues.push(value);
        }
      }

      updateFilters(workspaceSlug, { [key]: newValues });
    },
    [filters, updateFilters, workspaceSlug]
  );

  const handleOrderBy = () => {};

  return (
    <div className={cn("flex gap-3", classname)}>
      <ProjectOrderByDropdown onChange={handleOrderBy} isMobile={isMobile} value={displayFilters?.order_by} />
      <div className={cn(filterClassname)}>
        <FiltersDropdown
          icon={<ListFilter className="size-3" />}
          title="Filters"
          placement="bottom-end"
          isFiltersApplied={isFiltersApplied}
          menuButton={filterMenuButton || null}
        >
          <ProjectFiltersSelection
            displayFilters={displayFilters ?? {}}
            filters={filters ?? {}}
            handleFiltersUpdate={handleFilters}
            handleDisplayFiltersUpdate={(val) => {
              if (!workspaceSlug) return;
              updateDisplayFilters(workspaceSlug, val);
            }}
            memberIds={workspaceMemberIds ?? undefined}
          />
        </FiltersDropdown>
      </div>
    </div>
  );
});

export default HeaderFilters;
