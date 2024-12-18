import { useCallback } from "react";
import { observer } from "mobx-react";
import { ListFilter } from "lucide-react";
import { TPageFilterProps, TPageNavigationTabs } from "@plane/types";
import { EHeaderVariant, Header } from "@plane/ui";
import { FiltersDropdown } from "@/components/issues";
import { calculateTotalFilters } from "@/helpers/filter.helper";
import { useProjectPages } from "@/hooks/store/pages";
import { useMember } from "@/hooks/store/use-member";
import { PageAppliedFiltersList, PageOrderByDropdown, PageSearchInput, PageTabNavigation } from "../list";
import { PageFiltersSelection } from "../list/filters";

type Props = {
  pageType: TPageNavigationTabs;
  projectId: string;
  workspaceSlug: string;
};

export const PagesListHeaderRoot = observer(({ pageType, projectId, workspaceSlug }: Props) => {
  // store hooks
  const { filters, updateFilters, clearAllFilters } = useProjectPages();
  const {
    workspace: { workspaceMemberIds },
  } = useMember();

  const handleRemoveFilter = useCallback(
    (key: keyof TPageFilterProps, value: string | null) => {
      console.log(key, "====", value);
      let newValues = filters.filters?.[key];
      if (key === "favorites") newValues = !!value;

      if (Array.isArray(newValues)) {
        if (!value) newValues = [];
        else newValues = newValues.filter((val) => val !== value);
      }

      updateFilters("filters", { [key]: newValues });
    },
    [filters.filters, updateFilters]
  );

  console.log(filters);
  const isFiltersApplied = calculateTotalFilters(filters?.filters ?? {}) !== 0;

  return (
    <>
      <Header variant={EHeaderVariant.SECONDARY}>
        <Header.LeftItem>
          <PageTabNavigation workspaceSlug={workspaceSlug} projectId={projectId} pageType={pageType} />
        </Header.LeftItem>
        <Header.RightItem className="items-center">
          <PageSearchInput
            searchQuery={filters.searchQuery}
            updateSearchQuery={(val) => updateFilters("searchQuery", val)}
          />

          <PageOrderByDropdown
            sortBy={filters.sortBy}
            sortKey={filters.sortKey}
            onChange={(val) => {
              if (val.key) updateFilters("sortKey", val.key);
              if (val.order) updateFilters("sortBy", val.order);
            }}
          />

          <FiltersDropdown
            icon={<ListFilter className="size-3" />}
            title="Filters"
            placement="bottom-end"
            isFiltersApplied={isFiltersApplied}
          >
            <PageFiltersSelection
              filters={filters}
              handleFiltersUpdate={updateFilters}
              memberIds={workspaceMemberIds ?? undefined}
            />
          </FiltersDropdown>
        </Header.RightItem>
      </Header>

      {calculateTotalFilters(filters?.filters ?? {}) !== 0 && (
        <Header variant={EHeaderVariant.TERNARY}>
          <PageAppliedFiltersList
            appliedFilters={filters.filters ?? {}}
            handleClearAllFilters={clearAllFilters}
            handleRemoveFilter={handleRemoveFilter}
            alwaysAllowEditing
          />
        </Header>
      )}
    </>
  );
});
