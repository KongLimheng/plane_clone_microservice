import { concat, get, indexOf, orderBy, set, uniq, update } from "lodash";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import {
  IssuePaginationOptions,
  TGroupedIssueCount,
  TGroupedIssues,
  TIssue,
  TIssueGroupByOptions,
  TIssueOrderByOptions,
  TIssuePaginationData,
  TIssues,
  TIssuesResponse,
  TLoader,
  TPaginationData,
  TSubGroupedIssues,
} from "@plane/types";
import { ALL_ISSUES, EIssueLayoutTypes, ISSUE_PRIORITIES } from "@/constants/issue";
import { convertToISODateString } from "@/helpers/date-time.helper";
import { SPECIAL_ORDER_BY } from "@/local-db/utils/query-constructor";
import { IssueService } from "@/services/issue";
import { IIssueRootStore } from "../root.store";
import { getGroupKey, getIssueIds, getSortOrderToFilterEmptyValues } from "./base-issues-utils";
import { IBaseIssueFilterStore } from "./issue-filter-helper.store";

export type TIssueDisplayFilterOptions = Exclude<TIssueGroupByOptions, null> | "target_date";

export enum EIssueGroupedAction {
  ADD = "ADD",
  DELETE = "DELETE",
  REORDER = "REORDER",
}

export interface IBaseIssuesStore {
  // observable
  loader: Record<string, TLoader>;

  groupedIssueIds: TGroupedIssues | TSubGroupedIssues | undefined; // object to store Issue Ids based on group or subgroup
  groupedIssueCount: TGroupedIssueCount; // map of groupId/subgroup and issue count of that particular group/subgroup
  issuePaginationData: TIssuePaginationData; // map of groupId/subgroup and pagination Data of that particular group/subgroup

  // //actions
  // removeIssue: (workspaceSlug: string, projectId: string, issueId: string) => Promise<void>;
  clear(shouldClearPaginationOptions?: boolean, clearForLocal?: boolean): void;
  // // helper methods
  // getIssueIds: (groupId?: string, subGroupId?: string) => string[] | undefined;
  // issuesSortWithOrderBy(issueIds: string[], key: Partial<TIssueOrderByOptions>): string[];
  // getPaginationData(groupId: string | undefined, subGroupId: string | undefined): TPaginationData | undefined;
  getIssueLoader(groupId?: string, subGroupId?: string): TLoader;
  getGroupIssueCount: (
    groupId: string | undefined,
    subGroupId: string | undefined,
    isSubGroupCumulative: boolean
  ) => number | undefined;

  // addIssueToCycle: (
  //   workspaceSlug: string,
  //   projectId: string,
  //   cycleId: string,
  //   issueIds: string[],
  //   fetchAddedIssues?: boolean
  // ) => Promise<void>;
  // removeIssueFromCycle: (workspaceSlug: string, projectId: string, cycleId: string, issueId: string) => Promise<void>;
  // addCycleToIssue: (workspaceSlug: string, projectId: string, cycleId: string, issueId: string) => Promise<void>;
  // removeCycleFromIssue: (workspaceSlug: string, projectId: string, issueId: string) => Promise<void>;

  // addIssuesToModule: (
  //   workspaceSlug: string,
  //   projectId: string,
  //   moduleId: string,
  //   issueIds: string[],
  //   fetchAddedIssues?: boolean
  // ) => Promise<void>;
  // removeIssuesFromModule: (
  //   workspaceSlug: string,
  //   projectId: string,
  //   moduleId: string,
  //   issueIds: string[]
  // ) => Promise<void>;
  // changeModulesInIssue(
  //   workspaceSlug: string,
  //   projectId: string,
  //   issueId: string,
  //   addModuleIds: string[],
  //   removeModuleIds: string[]
  // ): Promise<void>;
  // updateIssueDates(workspaceSlug: string, projectId: string, updates: IBlockUpdateDependencyData[]): Promise<void>;
}

// This constant maps the group by keys to the respective issue property that the key relies on
const ISSUE_GROUP_BY_KEY: Record<TIssueDisplayFilterOptions, keyof TIssue> = {
  project: "project_id",
  state: "state_id",
  "state_detail.group": "state_id" as keyof TIssue, // state_detail.group is only being used for state_group display,
  priority: "priority",
  labels: "label_ids",
  created_by: "created_by",
  assignees: "assignee_ids",
  target_date: "target_date",
  cycle: "cycle_id",
  module: "module_ids",
};

export const ISSUE_FILTER_DEFAULT_DATA: Record<TIssueDisplayFilterOptions, keyof TIssue> = {
  project: "project_id",
  cycle: "cycle_id",
  module: "module_ids",
  state: "state_id",
  "state_detail.group": "state_group" as keyof TIssue, // state_detail.group is only being used for state_group display,
  priority: "priority",
  labels: "label_ids",
  created_by: "created_by",
  assignees: "assignee_ids",
  target_date: "target_date",
};

// This constant maps the order by keys to the respective issue property that the key relies on
const ISSUE_ORDERBY_KEY: Record<TIssueOrderByOptions, keyof TIssue> = {
  created_at: "created_at",
  "-created_at": "created_at",
  updated_at: "updated_at",
  "-updated_at": "updated_at",
  priority: "priority",
  "-priority": "priority",
  sort_order: "sort_order",
  state__name: "state_id",
  "-state__name": "state_id",
  assignees__first_name: "assignee_ids",
  "-assignees__first_name": "assignee_ids",
  labels__name: "label_ids",
  "-labels__name": "label_ids",
  issue_module__module__name: "module_ids",
  "-issue_module__module__name": "module_ids",
  issue_cycle__cycle__name: "cycle_id",
  "-issue_cycle__cycle__name": "cycle_id",
  target_date: "target_date",
  "-target_date": "target_date",
  estimate_point__key: "estimate_point",
  "-estimate_point__key": "estimate_point",
  start_date: "start_date",
  "-start_date": "start_date",
  link_count: "link_count",
  "-link_count": "link_count",
  attachment_count: "attachment_count",
  "-attachment_count": "attachment_count",
  sub_issues_count: "sub_issues_count",
  "-sub_issues_count": "sub_issues_count",
};

export abstract class BaseIssuesStore implements IBaseIssuesStore {
  loader: Record<string, TLoader> = {};
  groupedIssueIds: TIssues | undefined = undefined;
  issuePaginationData: TIssuePaginationData = {};

  groupedIssueCount: TGroupedIssueCount = {};
  paginationOptions: IssuePaginationOptions | undefined = undefined;
  isArchived: boolean;

  // services
  issueService;
  // issueArchiveService;
  // issueDraftService;
  // moduleService;
  // cycleService;
  // root store
  rootIssueStore;
  issueFilterStore;
  // API Abort controller
  controller: AbortController;

  constructor(_rootStore: IIssueRootStore, issueFilterStore: IBaseIssueFilterStore, isArchived = false) {
    makeObservable(this, {
      // observable
      loader: observable,
      groupedIssueIds: observable,
      issuePaginationData: observable,
      groupedIssueCount: observable,
      paginationOptions: observable,

      // computed
      //  moduleId: computed,
      //  cycleId: computed,
      //  orderBy: computed,
      groupBy: computed,
      //  subGroupBy: computed,
      //  orderByKey: computed,

      // action
      //  storePreviousPaginationValues: action.bound,

      onfetchIssues: action.bound,
      //  onfetchNexIssues: action.bound,
      clear: action.bound,
      setLoader: action.bound,
    });

    this.rootIssueStore = _rootStore;
    this.issueFilterStore = issueFilterStore;
    this.issueService = new IssueService();

    this.isArchived = isArchived;

    this.controller = new AbortController();
  }

  /**
   * gets the issue count of particular group/subgroup/ALL_ISSUES
   *
   * if isSubGroupCumulative is true, sum up all the issueCount of the subGroupId, across all the groupIds
   */
  getGroupIssueCount = computedFn(
    (
      groupId: string | undefined,
      subGroupId: string | undefined,
      isSubGroupCumulative: boolean
    ): number | undefined => {
      if (isSubGroupCumulative && subGroupId) {
        const groupIssuesKeys = Object.keys(this.groupedIssueCount);
        let subGroupCumulativeCount = 0;

        for (const groupKey of groupIssuesKeys) {
          if (groupKey.includes(`_${subGroupId}`)) subGroupCumulativeCount += this.groupedIssueCount[groupKey];
        }

        return subGroupCumulativeCount;
      }

      return get(this.groupedIssueCount, [this.getGroupKey(groupId, subGroupId)]);
    }
  );

  /**
   * returns,
   * A compound key, if both groupId & subGroupId are defined
   * groupId, only if groupId is defined
   * ALL_ISSUES, if both groupId & subGroupId are not defined
   * @param groupId
   * @param subGroupId
   * @returns
   */
  getGroupKey = (groupId?: string, subGroupId?: string) => {
    if (groupId && subGroupId && subGroupId !== "null") return `${groupId}_${subGroupId}`;

    if (groupId) return groupId;

    return ALL_ISSUES;
  };

  // current Group by value
  get groupBy() {
    const displayFilters = this.issueFilterStore?.issueFilters?.displayFilters;
    if (!displayFilters || !displayFilters?.layout) return;

    const layout = displayFilters?.layout;

    return layout === EIssueLayoutTypes.CALENDAR
      ? "target_date"
      : [EIssueLayoutTypes.LIST, EIssueLayoutTypes.KANBAN]?.includes(layout)
        ? displayFilters?.group_by
        : undefined;
  }

  // current Order by value
  get orderBy() {
    const displayFilters = this.issueFilterStore?.issueFilters?.displayFilters;
    if (!displayFilters) return;

    const layout = displayFilters.layout;
    const orderBy = displayFilters.order_by;

    // Temporary code to fix no load order by
    if (
      this.rootIssueStore.rootStore.user.localDBEnabled &&
      layout !== EIssueLayoutTypes.SPREADSHEET &&
      orderBy &&
      Object.keys(SPECIAL_ORDER_BY).includes(orderBy)
    ) {
      return "sort_order";
    }

    return displayFilters?.order_by;
  }

  /**
   * gets the Loader value of particular group/subgroup/ALL_ISSUES
   */
  getIssueLoader = (groupId?: string, subGroupId?: string) => get(this.loader, getGroupKey(groupId, subGroupId));

  /**
   * Sets the loader value of the particular groupId/subGroupId, or to ALL_ISSUES if both are undefined
   * @param loaderValue
   * @param groupId
   * @param subGroupId
   */
  setLoader(loaderValue: TLoader, groupId?: string, subGroupId?: string) {
    runInAction(() => {
      set(this.loader, getGroupKey(groupId, subGroupId), loaderValue);
    });
  }

  /**
   * Method called to clear out the current store
   */
  clear(shouldClearPaginationOptions = true, clearForLocal = false) {
    if (
      (this.rootIssueStore.rootStore.user?.localDBEnabled && clearForLocal) ||
      (!this.rootIssueStore.rootStore.user?.localDBEnabled && !clearForLocal)
    ) {
      runInAction(() => {
        this.groupedIssueIds = undefined;
        this.issuePaginationData = {};
        this.groupedIssueCount = {};
        if (shouldClearPaginationOptions) {
          this.paginationOptions = undefined;
        }
      });
      this.controller.abort();
      this.controller = new AbortController();
    }
  }

  /**
   * Updates the Issue, by calling the API and also updating the store
   * @param workspaceSlug
   * @param projectId
   * @param issueId
   * @param data Partial Issue Data to be updated
   * @param shouldSync If False then only issue is to be updated in the store not call API to update
   * @returns
   */
  async issueUpdate(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    data: Partial<TIssue>,
    shouldSync = true
  ) {}

  /**
   * This method processes the issueResponse to provide data that can be used to update the store
   * @param issueResponse
   * @returns  issueList, list of issue Data
   * @returns groupedIssues, grouped issue Ids
   * @returns groupedIssueCount, object containing issue counts of individual groups
   */
  processIssueResponse(issueResponse: TIssuesResponse): {
    issueList: TIssue[];
    groupedIssues: TIssues;
    groupedIssueCount: TGroupedIssueCount;
  } {
    const issueResult = issueResponse?.results;

    // if undefined return empty objects
    if (!issueResult)
      return {
        issueList: [],
        groupedIssues: {},
        groupedIssueCount: {},
      };

    //if is an array then it's an ungrouped response. return values with groupId as ALL_ISSUES
    if (Array.isArray(issueResult)) {
      return {
        issueList: issueResult,
        groupedIssues: {
          [ALL_ISSUES]: issueResult.map((issue) => issue.id),
        },
        groupedIssueCount: {
          [ALL_ISSUES]: issueResponse.total_count,
        },
      };
    }

    const issueList: TIssue[] = [];
    const groupedIssues: TGroupedIssues | TSubGroupedIssues = {};
    const groupedIssueCount: TGroupedIssueCount = {};

    // update total issue count to ALL_ISSUES
    set(groupedIssueCount, [ALL_ISSUES], issueResponse.total_count);

    // loop through all the groupIds from issue Result
    for (const groupId in issueResult) {
      const groupIssuesObject = issueResult[groupId];
      const groupIssueResult = groupIssuesObject?.results;

      // if groupIssueResult is undefined then continue the loop
      if (!groupIssueResult) continue;

      // set grouped Issue count of the current groupId
      set(groupedIssueCount, [groupId], groupIssuesObject.total_results);

      // if groupIssueResult, the it is not subGrouped
      if (Array.isArray(groupIssueResult)) {
        // add the result to issueList
        issueList.push(...groupIssueResult);
        // set the issue Ids to the groupId path
        set(
          groupedIssues,
          [groupId],
          groupIssueResult.map((issue) => issue.id)
        );
        continue;
      }

      // loop through all the subGroupIds from issue Result
      for (const subGroupId in groupIssueResult) {
        const subGroupIssuesObject = groupIssueResult[subGroupId];
        const subGroupIssueResult = subGroupIssuesObject?.results;

        // if subGroupIssueResult is undefined then continue the loop
        if (!subGroupIssueResult) continue;

        // set sub grouped Issue count of the current groupId
        set(groupedIssueCount, [getGroupKey(groupId, subGroupId)], subGroupIssuesObject.total_results);

        if (Array.isArray(subGroupIssueResult)) {
          // add the result to issueList
          issueList.push(...subGroupIssueResult);
          // set the issue Ids to the [groupId, subGroupId] path
          set(
            groupedIssues,
            [groupId, subGroupId],
            subGroupIssueResult.map((issue) => issue.id)
          );

          continue;
        }
      }
    }

    return { issueList, groupedIssues, groupedIssueCount };
  }

  /**
   * This method is used to update the grouped issue Ids to it's respected lists and also to update group Issue Counts
   * @param groupedIssues Object that contains list of issueIds with respect to their groups/subgroups
   * @param groupedIssueCount Object the contains the issue count of each groups
   * @param groupId groupId string
   * @param subGroupId subGroupId string
   * @returns updates the store with the values
   */
  updateGroupedIssueIds(
    groupedIssues: TIssues,
    groupedIssueCount: TGroupedIssueCount,
    groupId?: string,
    subGroupId?: string
  ) {
    // if groupId exists and groupedIssues has ALL_ISSUES as a group,
    // then it's an individual group/subgroup pagination
    if (groupId && groupedIssues[ALL_ISSUES] && Array.isArray(groupedIssues[ALL_ISSUES])) {
      const issueGroup = groupedIssues[ALL_ISSUES];
      const issueGroupCount = groupedIssueCount[ALL_ISSUES];
      const issuesPath = [groupId];
      // issuesPath is the path for the issue List in the Grouped Issue List
      // issuePath is either [groupId] for grouped pagination or [groupId, subGroupId] for subGrouped pagination
      if (subGroupId) issuesPath.push(subGroupId);

      // update the issue Count of the particular group/subGroup
      set(this.groupedIssueCount, [getGroupKey(groupId, subGroupId)], issueGroupCount);

      // update the issue list in the issuePath
      this.updateIssueGroup(issueGroup, issuesPath);
      return;
    }

    // if not in the above condition the it's a complete grouped pagination not individual group/subgroup pagination
    // update total issue count as ALL_ISSUES count in `groupedIssueCount` object
    set(this.groupedIssueCount, [ALL_ISSUES], groupedIssueCount[ALL_ISSUES]);

    // loop through the groups of groupedIssues.
    for (const groupId in groupedIssues) {
      const issueGroup = groupedIssues[groupId];
      const issueGroupCount = groupedIssueCount[groupId];

      // update the groupId's issue count
      set(this.groupedIssueCount, [groupId], issueGroupCount);

      // This updates the group issue list in the store, if the issueGroup is a string
      const storeUpdated = this.updateIssueGroup(issueGroup, [groupId]);
      // if issueGroup is indeed a string, continue
      if (storeUpdated) continue;

      // if issueGroup is not a string, loop through the sub group Issues
      for (const subGroupId in issueGroup) {
        const issueSubGroup = (issueGroup as TGroupedIssues)[subGroupId];
        const issueSubGroupCount = groupedIssueCount[getGroupKey(groupId, subGroupId)];

        // update the subGroupId's issue count
        set(this.groupedIssueCount, [getGroupKey(groupId, subGroupId)], issueSubGroupCount);
        // This updates the subgroup issue list in the store
        this.updateIssueGroup(issueSubGroup, [groupId, subGroupId]);
      }
    }
  }

  /**
   * This Method is used to update the issue Id list at the particular issuePath
   * @param groupedIssueIds could be an issue Id List for grouped issues or an object that contains a issue Id list in case of subGrouped
   * @param issuePath array of string, to identify the path of the issueList to be updated with the above issue Id list
   * @returns a boolean that indicates if the groupedIssueIds is indeed a array Id list, in which case the issue Id list is added to the store at issuePath
   */
  updateIssueGroup(groupedIssueIds: TGroupedIssues | string[], issuePath: string[]): boolean {
    if (!groupedIssueIds) return true;

    // if groupedIssueIds is an array, update the `groupedIssueIds` store at the issuePath
    if (groupedIssueIds && Array.isArray(groupedIssueIds)) {
      update(this, ["groupedIssueIds", ...issuePath], (issueIds: string[] = []) =>
        this.issuesSortWithOrderBy(uniq(concat(issueIds, groupedIssueIds as string[])), this.orderBy)
      );
      // return true to indicate the store has been updated
      return true;
    }

    // return false to indicate the store has been updated and the groupedIssueIds is likely Object for subGrouped Issues
    return false;
  }

  /**
   * This Method is used to get data of the issue based on the ids of the data for states, labels adn assignees
   * @param dataType what type of data is being sent
   * @param dataIds id/ids of the data that is to be populated
   * @param order ascending or descending for arrays of data
   * @returns string | string[] of sortable fields to be used for sorting
   */
  populateIssueDataForSorting(
    dataType: "state_id" | "label_ids" | "assignee_ids" | "module_ids" | "cycle_id" | "estimate_point",
    dataIds: string | string[] | null | undefined,
    projectId: string | undefined | null,
    order?: "asc" | "desc"
  ) {
    if (!dataIds) return;

    const dataValues: (string | number)[] = [];
    const isDataIdsArray = Array.isArray(dataIds);
    const dataIdsArray = isDataIdsArray ? dataIds : [dataIds];

    switch (dataType) {
      case "state_id": {
        const stateMap = this.rootIssueStore?.stateMap;
        if (!stateMap) break;
        for (const dataId of dataIdsArray) {
          const state = stateMap[dataId];
          if (state && state.name) dataValues.push(state.name.toLocaleLowerCase());
        }
        break;
      }
      case "label_ids": {
        const labelMap = this.rootIssueStore?.labelMap;
        if (!labelMap) break;
        for (const dataId of dataIdsArray) {
          const label = labelMap[dataId];
          if (label && label.name) dataValues.push(label.name.toLocaleLowerCase());
        }
        break;
      }
      case "assignee_ids": {
        const memberMap = this.rootIssueStore?.memberMap;
        if (!memberMap) break;
        for (const dataId of dataIdsArray) {
          const member = memberMap[dataId];
          if (member && member.first_name) dataValues.push(member.first_name.toLocaleLowerCase());
        }
        break;
      }
      // case "module_ids": {
      //   const moduleMap = this.rootIssueStore?.moduleMap;
      //   if (!moduleMap) break;
      //   for (const dataId of dataIdsArray) {
      //     const currentModule = moduleMap[dataId];
      //     if (currentModule && currentModule.name) dataValues.push(currentModule.name.toLocaleLowerCase());
      //   }
      //   break;
      // }
      // case "cycle_id": {
      //   const cycleMap = this.rootIssueStore?.cycleMap;
      //   if (!cycleMap) break;
      //   for (const dataId of dataIdsArray) {
      //     const cycle = cycleMap[dataId];
      //     if (cycle && cycle.name) dataValues.push(cycle.name.toLocaleLowerCase());
      //   }
      //   break;
      // }
      // case "estimate_point": {
      //   // return if project Id does not exist
      //   if (!projectId) break;
      //   // get the estimate ID for the current Project
      //   const currentProjectEstimateId =
      //     this.rootIssueStore.rootStore.projectEstimate.currentActiveEstimateIdByProjectId(projectId);
      //   // return if current Estimate Id for the project is not available
      //   if (!currentProjectEstimateId) break;
      //   // get Estimate based on Id
      //   const estimate = this.rootIssueStore.rootStore.projectEstimate.estimateById(currentProjectEstimateId);
      //   // If Estimate is not available, then return
      //   if (!estimate) break;
      //   // Get Estimate Value
      //   const estimateKey = estimate?.estimatePointById(dataIds as string)?.key;

      //   // If Value string i not available or empty then return
      //   if (estimateKey === undefined) break;

      //   dataValues.push(estimateKey);
      // }
    }

    return isDataIdsArray ? (order ? orderBy(dataValues, undefined, [order]) : dataValues) : dataValues;
  }

  issuesSortWithOrderBy = (issueIds: string[], key: TIssueOrderByOptions | undefined): string[] => {
    const issues = this.rootIssueStore.issues.getIssuesByIds(issueIds, this.isArchived ? "archived" : "un-archived");
    const array = orderBy(issues, (issue) => convertToISODateString(issue["created_at"]), ["desc"]);

    switch (key) {
      case "sort_order":
        return getIssueIds(orderBy(array, "sort_order"));
      case "state__name":
        return getIssueIds(
          orderBy(array, (issue) =>
            this.populateIssueDataForSorting("state_id", issue?.["state_id"], issue?.["project_id"])
          )
        );
      case "-state__name":
        return getIssueIds(
          orderBy(
            array,
            (issue) => this.populateIssueDataForSorting("state_id", issue?.["state_id"], issue?.["project_id"]),
            ["desc"]
          )
        );
      // dates
      case "created_at":
        return getIssueIds(orderBy(array, (issue) => convertToISODateString(issue["created_at"])));
      case "-created_at":
        return getIssueIds(orderBy(array, (issue) => convertToISODateString(issue["created_at"]), ["desc"]));
      case "updated_at":
        return getIssueIds(orderBy(array, (issue) => convertToISODateString(issue["updated_at"])));
      case "-updated_at":
        return getIssueIds(orderBy(array, (issue) => convertToISODateString(issue["updated_at"]), ["desc"]));
      case "start_date":
        return getIssueIds(orderBy(array, [getSortOrderToFilterEmptyValues.bind(null, "start_date"), "start_date"])); //preferring sorting based on empty values to always keep the empty values below
      case "-start_date":
        return getIssueIds(
          orderBy(
            array,
            [getSortOrderToFilterEmptyValues.bind(null, "start_date"), "start_date"], //preferring sorting based on empty values to always keep the empty values below
            ["asc", "desc"]
          )
        );

      case "target_date":
        return getIssueIds(orderBy(array, [getSortOrderToFilterEmptyValues.bind(null, "target_date"), "target_date"])); //preferring sorting based on empty values to always keep the empty values below
      case "-target_date":
        return getIssueIds(
          orderBy(
            array,
            [getSortOrderToFilterEmptyValues.bind(null, "target_date"), "target_date"], //preferring sorting based on empty values to always keep the empty values below
            ["asc", "desc"]
          )
        );

      // custom
      case "-priority": {
        const sortArray = ISSUE_PRIORITIES.map((i) => i.key);
        return getIssueIds(orderBy(array, (currentIssue: TIssue) => indexOf(sortArray, currentIssue?.priority)));
      }
      case "priority": {
        const sortArray = ISSUE_PRIORITIES.map((i) => i.key);
        return getIssueIds(
          orderBy(array, (currentIssue: TIssue) => indexOf(sortArray, currentIssue?.priority), ["desc"])
        );
      }

      // number
      case "attachment_count":
        return getIssueIds(orderBy(array, "attachment_count"));
      case "-attachment_count":
        return getIssueIds(orderBy(array, "attachment_count", ["desc"]));

      case "estimate_point__key":
        return getIssueIds(
          orderBy(array, [
            getSortOrderToFilterEmptyValues.bind(null, "estimate_point"),
            (issue) =>
              this.populateIssueDataForSorting("estimate_point", issue?.["estimate_point"], issue?.["project_id"]),
          ])
        ); //preferring sorting based on empty values to always keep the empty values below
      case "-estimate_point__key":
        return getIssueIds(
          orderBy(
            array,
            [
              getSortOrderToFilterEmptyValues.bind(null, "estimate_point"),
              (issue) =>
                this.populateIssueDataForSorting("estimate_point", issue?.["estimate_point"], issue?.["project_id"]),
            ], //preferring sorting based on empty values to always keep the empty values below
            ["asc", "desc"]
          )
        );

      case "link_count":
        return getIssueIds(orderBy(array, "link_count"));
      case "-link_count":
        return getIssueIds(orderBy(array, "link_count", ["desc"]));

      case "sub_issues_count":
        return getIssueIds(orderBy(array, "sub_issues_count"));
      case "-sub_issues_count":
        return getIssueIds(orderBy(array, "sub_issues_count", ["desc"]));

      // Array
      case "labels__name":
        return getIssueIds(
          orderBy(array, [
            getSortOrderToFilterEmptyValues.bind(null, "label_ids"), //preferring sorting based on empty values to always keep the empty values below
            (issue) =>
              this.populateIssueDataForSorting("label_ids", issue?.["label_ids"], issue?.["project_id"], "asc"),
          ])
        );
      case "-labels__name":
        return getIssueIds(
          orderBy(
            array,
            [
              getSortOrderToFilterEmptyValues.bind(null, "label_ids"), //preferring sorting based on empty values to always keep the empty values below
              (issue) =>
                this.populateIssueDataForSorting("label_ids", issue?.["label_ids"], issue?.["project_id"], "asc"),
            ],
            ["asc", "desc"]
          )
        );

      case "issue_module__module__name":
        return getIssueIds(
          orderBy(array, [
            getSortOrderToFilterEmptyValues.bind(null, "module_ids"), //preferring sorting based on empty values to always keep the empty values below
            (issue) =>
              this.populateIssueDataForSorting("module_ids", issue?.["module_ids"], issue?.["project_id"], "asc"),
          ])
        );
      case "-issue_module__module__name":
        return getIssueIds(
          orderBy(
            array,
            [
              getSortOrderToFilterEmptyValues.bind(null, "module_ids"), //preferring sorting based on empty values to always keep the empty values below
              (issue) =>
                this.populateIssueDataForSorting("module_ids", issue?.["module_ids"], issue?.["project_id"], "asc"),
            ],
            ["asc", "desc"]
          )
        );

      case "issue_cycle__cycle__name":
        return getIssueIds(
          orderBy(array, [
            getSortOrderToFilterEmptyValues.bind(null, "cycle_id"), //preferring sorting based on empty values to always keep the empty values below
            (issue) => this.populateIssueDataForSorting("cycle_id", issue?.["cycle_id"], issue?.["project_id"], "asc"),
          ])
        );
      case "-issue_cycle__cycle__name":
        return getIssueIds(
          orderBy(
            array,
            [
              getSortOrderToFilterEmptyValues.bind(null, "cycle_id"), //preferring sorting based on empty values to always keep the empty values below
              (issue) =>
                this.populateIssueDataForSorting("cycle_id", issue?.["cycle_id"], issue?.["project_id"], "asc"),
            ],
            ["asc", "desc"]
          )
        );

      case "assignees__first_name":
        return getIssueIds(
          orderBy(array, [
            getSortOrderToFilterEmptyValues.bind(null, "assignee_ids"), //preferring sorting based on empty values to always keep the empty values below
            (issue) =>
              this.populateIssueDataForSorting("assignee_ids", issue?.["assignee_ids"], issue?.["project_id"], "asc"),
          ])
        );
      case "-assignees__first_name":
        return getIssueIds(
          orderBy(
            array,
            [
              getSortOrderToFilterEmptyValues.bind(null, "assignee_ids"), //preferring sorting based on empty values to always keep the empty values below
              (issue) =>
                this.populateIssueDataForSorting("assignee_ids", issue?.["assignee_ids"], issue?.["project_id"], "asc"),
            ],
            ["asc", "desc"]
          )
        );

      default:
        return getIssueIds(array);
    }
  };

  // Abstract class to be implemented to fetch parent stats such as project, module or cycle details
  abstract fetchParentStats: (workspaceSlug: string, projectId?: string, id?: string) => void;
  abstract updateParentStats: (prevIssueState?: TIssue, nextIssueState?: TIssue, id?: string) => void;

  /**
   * This Method is called after fetching the first paginated issues
   *
   * This method updates the appropriate issue list based on if groupByKey or subGroupByKey are defined
   * If both groupByKey and subGroupByKey are not defined, then the issue list are added to another group called ALL_ISSUES
   * @param issuesResponse  Paginated Response received from the API
   * @param options Pagination options
   * @param workspaceSlug
   * @param projectId
   * @param id Id can be anything from cycleId, moduleId, viewId or userId based on the store
   */
  onfetchIssues(
    issuesResponse: TIssuesResponse,
    options: IssuePaginationOptions,
    workspaceSlug: string,
    projectId?: string,
    id?: string,
    shouldClearPaginationOptions = true
  ) {
    // Process the Issue Response to get the following data from it
    const { issueList, groupedIssues, groupedIssueCount } = this.processIssueResponse(issuesResponse);

    // The Issue list is added to the main Issue Map
    this.rootIssueStore.issues.addIssue(issueList);

    // Update all the GroupIds to this Store's groupedIssueIds and update Individual group issue counts
    runInAction(() => {
      this.clear(shouldClearPaginationOptions, true);
      this.updateGroupedIssueIds(groupedIssues, groupedIssueCount);
      this.loader[getGroupKey()] = undefined;
    });

    // fetch parent stats if required, to be handled in the Implemented class
    this.fetchParentStats(workspaceSlug, projectId, id);

    this.rootIssueStore.issueDetail.relation.extractRelationsFromIssues(issueList);

    // store Pagination options for next subsequent calls and data like next cursor etc
    this.storePreviousPaginationValues(issuesResponse, options);
  }

  /**
   * Store the pagination data required for next subsequent issue pagination calls
   * @param prevCursor cursor value of previous page
   * @param nextCursor cursor value of next page
   * @param nextPageResults boolean to indicate if the next page results exist i.e, have we reached end of pages
   * @param groupId groupId and subGroupId to add the pagination data for the particular group/subgroup
   * @param subGroupId
   */
  setPaginationData(
    prevCursor: string,
    nextCursor: string,
    nextPageResults: boolean,
    groupId?: string,
    subGroupId?: string
  ) {
    const cursorObject = {
      prevCursor,
      nextCursor,
      nextPageResults,
    };

    set(this.issuePaginationData, [getGroupKey(groupId, subGroupId)], cursorObject);
  }

  /**
   * This Method is called to store the pagination options and paginated data from response
   * @param issuesResponse issue list response
   * @param options pagination options to be stored for next page call
   * @param groupId
   * @param subGroupId
   */
  storePreviousPaginationValues = (
    issuesResponse: TIssuesResponse,
    options?: IssuePaginationOptions,
    groupId?: string,
    subGroupId?: string
  ) => {
    if (options) this.paginationOptions = options;

    this.setPaginationData(
      issuesResponse.prev_cursor,
      issuesResponse.next_cursor,
      issuesResponse.next_page_results,
      groupId,
      subGroupId
    );
  };
}
