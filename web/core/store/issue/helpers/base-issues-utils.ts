import { isEmpty } from "lodash";
import { TIssue } from "@plane/types";
import { ALL_ISSUES } from "@/constants/issue";

/**
 * returns,
 * A compound key, if both groupId & subGroupId are defined
 * groupId, only if groupId is defined
 * ALL_ISSUES, if both groupId & subGroupId are not defined
 * @param groupId
 * @param subGroupId
 * @returns
 */
export const getGroupKey = (groupId?: string, subGroupId?: string) => {
  if (groupId && subGroupId && subGroupId !== "null") return `${groupId}_${subGroupId}`;

  if (groupId) return groupId;

  return ALL_ISSUES;
};

/**
 * This Method is mainly used to filter out empty values in the beginning
 * @param key key of the value that is to be checked if empty
 * @param object any object in which the key's value is to be checked
 * @returns 1 if empty, 0 if not empty
 */
export const getSortOrderToFilterEmptyValues = (key: string, object: any) => {
  const value = object?.[key];

  if (typeof value !== "number" && isEmpty(value)) return 1;

  return 0;
};

// get IssueIds from Issue data List
export const getIssueIds = (issues: TIssue[]) => issues.map((issue) => issue?.id);
