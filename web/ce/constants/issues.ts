import { TIssueActivityComment } from "@plane/types";

export enum EActivityFilterType {
  ACTIVITY = "ACTIVITY",
  COMMENT = "COMMENT",
}

export type TActivityFilters = EActivityFilterType;

export const ACTIVITY_FILTER_TYPE_OPTIONS: Record<EActivityFilterType, { label: string }> = {
  [EActivityFilterType.ACTIVITY]: {
    label: "Updates",
  },
  [EActivityFilterType.COMMENT]: {
    label: "Comments",
  },
};

export const defaultActivityFilters: TActivityFilters[] = [EActivityFilterType.ACTIVITY, EActivityFilterType.COMMENT];

export type TActivityFilterOption = {
  key: EActivityFilterType;
  label: string;
  isSelected: boolean;
  onClick: () => void;
};

export const filterActivityOnSelectedFilters = (
  activity: TIssueActivityComment[],
  filter: TActivityFilters[]
): TIssueActivityComment[] => activity.filter((act) => filter.includes(act.activity_type as TActivityFilters));

export const ENABLE_LOCAL_DB_CACHE = false;
