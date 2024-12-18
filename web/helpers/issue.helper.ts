import { IIssueDisplayFilterOptions, IIssueDisplayProperties, TIssueParams } from "@plane/types";
import { EIssueLayoutTypes, ISSUE_DISPLAY_FILTERS_BY_LAYOUT } from "@/constants/issue";

/**
 * @description This method is used to apply the display filters on the issues
 * @param {IIssueDisplayFilterOptions} displayFilters
 * @returns {IIssueDisplayFilterOptions}
 */
export const getComputedDisplayFilters = (
  displayFilters: IIssueDisplayFilterOptions = {},
  defaultValues?: IIssueDisplayFilterOptions
): IIssueDisplayFilterOptions => {
  const filters = displayFilters || defaultValues;

  return {
    calendar: {
      show_weekends: filters?.calendar?.show_weekends || false,
      layout: filters?.calendar?.layout || "month",
    },
    layout: filters?.layout || EIssueLayoutTypes.LIST,
    order_by: filters?.order_by || "sort_order",
    group_by: filters?.group_by || null,
    sub_group_by: filters?.sub_group_by || null,
    type: filters?.type || null,
    sub_issue: filters?.sub_issue || false,
    show_empty_groups: filters?.show_empty_groups || false,
  };
};

/**
 * @description This method is used to apply the display properties on the issues
 * @param {IIssueDisplayProperties} displayProperties
 * @returns {IIssueDisplayProperties}
 */
export const getComputedDisplayProperties = (
  displayProperties: IIssueDisplayProperties = {}
): IIssueDisplayProperties => ({
  assignee: displayProperties?.assignee ?? true,
  start_date: displayProperties?.start_date ?? true,
  due_date: displayProperties?.due_date ?? true,
  labels: displayProperties?.labels ?? true,
  priority: displayProperties?.priority ?? true,
  state: displayProperties?.state ?? true,
  sub_issue_count: displayProperties?.sub_issue_count ?? true,
  attachment_count: displayProperties?.attachment_count ?? true,
  link: displayProperties?.link ?? true,
  estimate: displayProperties?.estimate ?? true,
  key: displayProperties?.key ?? true,
  created_on: displayProperties?.created_on ?? true,
  updated_on: displayProperties?.updated_on ?? true,
  modules: displayProperties?.modules ?? true,
  cycle: displayProperties?.cycle ?? true,
  issue_type: displayProperties?.issue_type ?? true,
});

export const handleIssueQueryParamsByLayout = (
  layout: EIssueLayoutTypes | undefined,
  viewType: "my_issues" | "issues" | "profile_issues" | "archived_issues" | "draft_issues"
): TIssueParams[] | null => {
  const queryParams: TIssueParams[] = [];

  if (!layout) return null;

  const layoutOptions = ISSUE_DISPLAY_FILTERS_BY_LAYOUT[viewType][layout];

  // add filters query params
  layoutOptions.filters.forEach((option) => {
    queryParams.push(option);
  });

  // add display filters query params
  Object.keys(layoutOptions.display_filters).forEach((option) => {
    queryParams.push(option as TIssueParams);
  });

  // add extra options query params
  if (layoutOptions.extra_options.access) {
    layoutOptions.extra_options.values.forEach((option) => {
      queryParams.push(option);
    });
  }

  return queryParams;
};

export const getDescriptionPlaceholder = (isFocused: boolean, description: string | undefined): string => {
  const isDescriptionEmpty = !description || description === "<p></p>" || description.trim() === "";
  if (!isDescriptionEmpty || isFocused) return "Press '/' for commands...";
  else return "Click to add description";
};
