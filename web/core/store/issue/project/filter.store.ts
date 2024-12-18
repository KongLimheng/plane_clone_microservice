import { filter, isEmpty, set } from "lodash";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import {
  IIssueDisplayFilterOptions,
  IIssueDisplayProperties,
  IIssueFilterOptions,
  IIssueFilters,
  IssuePaginationOptions,
  TIssueKanbanFilters,
  TIssueParams,
  TLoader,
  ViewFlags,
} from "@plane/types";
import { EIssueFilterType, EIssuesStoreType } from "@/constants/issue";
import { handleIssueQueryParamsByLayout } from "@/helpers/issue.helper";
import { IssueFiltersService } from "@/services/issue_filter.service";
import { IBaseIssueFilterStore, IssueFilterHelperStore } from "../helpers/issue-filter-helper.store";
import { IIssueRootStore } from "../root.store";

export interface IProjectIssuesFilter extends IBaseIssueFilterStore {
  //helper actions
  getFilterParams: (
    options: IssuePaginationOptions,
    projectId: string,
    cursor: string | undefined,
    groupId: string | undefined,
    subGroupId: string | undefined
  ) => Partial<Record<TIssueParams, string | boolean>>;
  getIssueFilters(projectId: string): IIssueFilters | undefined;
  // action
  fetchFilters: (workspaceSlug: string, projectId: string) => Promise<void>;
  updateFilters: (
    workspaceSlug: string,
    projectId: string,
    filterType: EIssueFilterType,
    filters: IIssueFilterOptions | IIssueDisplayFilterOptions | IIssueDisplayProperties | TIssueKanbanFilters
  ) => Promise<void>;
}

export class ProjectIssuesFilter extends IssueFilterHelperStore implements IProjectIssuesFilter {
  // observables
  filters: { [projectId: string]: IIssueFilters } = {};
  // root store
  rootIssueStore: IIssueRootStore;
  // services
  issueFilterService;

  constructor(_rootStore: IIssueRootStore) {
    super();
    makeObservable(this, {
      // observables
      filters: observable,
      // // computed
      issueFilters: computed,
      // appliedFilters: computed,
      // // actions
      fetchFilters: action,
      // updateFilters: action,
    });
    // root store
    this.rootIssueStore = _rootStore;
    // services
    this.issueFilterService = new IssueFiltersService();
  }
  // get appliedFilters() {
  //   const userId = this.rootIssueStore.userId;
  //   if (!userId) return undefined;

  //   return this.getAppliedFilters(userId);
  // }

  getAppliedFilters(projectId: string) {
    const userFilters = this.getIssueFilters(projectId);
    if (!userFilters) return undefined;

    const filteredParams = handleIssueQueryParamsByLayout(userFilters?.displayFilters?.layout, "issues");
    if (!filteredParams) return undefined;

    const filteredRouteParams: Partial<Record<TIssueParams, string | boolean>> = this.computedFilteredParams(
      userFilters?.filters as IIssueFilterOptions,
      userFilters?.displayFilters as IIssueDisplayFilterOptions,
      filteredParams
    );

    return filteredRouteParams;
  }

  getFilterParams = computedFn(
    (
      options: IssuePaginationOptions,
      projectId: string,
      cursor: string | undefined,
      groupId: string | undefined,
      subGroupId: string | undefined
    ) => {
      const filterParams = this.getAppliedFilters(projectId);
      const paginationParams = this.getPaginationParams(filterParams, options, cursor, groupId, subGroupId);
      return paginationParams;
    }
  );

  get issueFilters() {
    const projectId = this.rootIssueStore.projectId;
    if (!projectId) return undefined;

    return this.getIssueFilters(projectId);
  }

  getIssueFilters(projectId: string) {
    const displayFilters = this.filters[projectId] || undefined;
    if (isEmpty(displayFilters)) return undefined;

    return this.computedIssueFilters(displayFilters);
  }

  fetchFilters = async (workspaceSlug: string, projectId: string) => {
    const _filters = await this.issueFilterService.fetchProjectIssueFilters(workspaceSlug, projectId);

    const filters = this.computedFilters(_filters?.filters);
    const displayFilters = this.computedDisplayFilters(_filters?.display_filters);
    const displayProperties = this.computedDisplayProperties(_filters?.display_properties);

    // fetching the kanban toggle helpers in the local storage
    const kanbanFilters = {
      group_by: [],
      sub_group_by: [],
    };
    const currentUserId = this.rootIssueStore.currentUserId;
    if (currentUserId) {
      // const _kanbanFilters = this.handleIssuesLocalFilters.get(
      //   EIssuesStoreType.PROJECT,
      //   workspaceSlug,
      //   projectId,
      //   currentUserId
      // );
      // kanbanFilters.group_by = _kanbanFilters?.kanban_filters?.group_by || [];
      // kanbanFilters.sub_group_by = _kanbanFilters?.kanban_filters?.sub_group_by || [];
    }

    runInAction(() => {
      set(this.filters, [projectId, "filters"], filters);
      set(this.filters, [projectId, "displayFilters"], displayFilters);
      set(this.filters, [projectId, "displayProperties"], displayProperties);
      set(this.filters, [projectId, "kanbanFilters"], kanbanFilters);
    });
  };

  updateFilters = async (
    workspaceSlug: string,
    projectId: string,
    type: EIssueFilterType,
    filters: IIssueFilterOptions | IIssueDisplayFilterOptions | IIssueDisplayProperties | TIssueKanbanFilters
  ) => {
    try {
      if (isEmpty(this.filters) || isEmpty(this.filters[projectId]) || isEmpty(this.filters)) return;
      const _filters = {
        filters: this.filters[projectId].filters as IIssueFilterOptions,
        displayFilters: this.filters[projectId].displayFilters as IIssueDisplayFilterOptions,
        displayProperties: this.filters[projectId].displayProperties as IIssueDisplayProperties,
        kanbanFilters: this.filters[projectId].kanbanFilters as TIssueKanbanFilters,
      };

      switch (type) {
        case EIssueFilterType.FILTERS: {
          const updatedFilters = filters as IIssueFilterOptions;
          _filters.filters = { ..._filters.filters, ...updatedFilters };

          runInAction(() => {
            Object.keys(updatedFilters).forEach((_key) => {
              set(this.filters, [projectId, "filters", _key], updatedFilters[_key as keyof IIssueFilterOptions]);
            });
          });

          // this.rootIssueStore.projectIssues.fetchIssuesWithExistingPagination(workspaceSlug, projectId, "mutation");
          // await this.issueFilterService.patchProjectIssueFilters(workspaceSlug, projectId, {
          //   filters: _filters.filters,
          // });
          break;
        }

        default:
          break;
      }
    } catch (error) {}
  };
}
