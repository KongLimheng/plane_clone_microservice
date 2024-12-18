import { action, makeObservable, runInAction } from "mobx";
import {
  IssuePaginationOptions,
  TBulkOperationsPayload,
  TIssue,
  TIssuesResponse,
  TLoader,
  ViewFlags,
} from "@plane/types";
import { BaseIssuesStore, IBaseIssuesStore } from "../helpers/base-issues.store";
import { IIssueRootStore } from "../root.store";
import { IProjectIssuesFilter } from "./filter.store";

export interface IProjectIssues extends IBaseIssuesStore {
  viewFlags: ViewFlags;
  // action
  fetchIssues: (
    workspaceSlug: string,

    projectId: string,
    loadType: TLoader,
    option: IssuePaginationOptions
  ) => Promise<TIssuesResponse | undefined>;
  // fetchIssuesWithExistingPagination: (
  //   workspaceSlug: string,
  //   projectId: string,
  //   loadType: TLoader
  // ) => Promise<TIssuesResponse | undefined>;
  // fetchNextIssues: (
  //   workspaceSlug: string,
  //   projectId: string,
  //   groupId?: string,
  //   subGroupId?: string
  // ) => Promise<TIssuesResponse | undefined>;

  // createIssue: (workspaceSlug: string, projectId: string, data: Partial<TIssue>) => Promise<TIssue>;
  updateIssue: (workspaceSlug: string, projectId: string, issueId: string, data: Partial<TIssue>) => Promise<void>;
  // archiveIssue: (workspaceSlug: string, projectId: string, issueId: string) => Promise<void>;
  // quickAddIssue: (workspaceSlug: string, projectId: string, data: TIssue) => Promise<TIssue | undefined>;
  // removeBulkIssues: (workspaceSlug: string, projectId: string, issueIds: string[]) => Promise<void>;
  // archiveBulkIssues: (workspaceSlug: string, projectId: string, issueIds: string[]) => Promise<void>;
  // bulkUpdateProperties: (workspaceSlug: string, projectId: string, data: TBulkOperationsPayload) => Promise<void>;
}

export class ProjectIssue extends BaseIssuesStore implements IProjectIssues {
  viewFlags = {
    enableQuickAdd: true,
    enableIssueCreation: true,
    enableInlineEditing: true,
  };
  router;

  // filter store
  issueFilterStore: IProjectIssuesFilter;
  constructor(_rootStore: IIssueRootStore, issueFilterStore: IProjectIssuesFilter) {
    super(_rootStore, issueFilterStore);
    makeObservable(this, {
      fetchIssues: action,
      // fetchNextIssues: action,
      // fetchIssuesWithExistingPagination: action,
      // quickAddIssue: action,
    });
    // filter store
    this.issueFilterStore = issueFilterStore;
    this.router = _rootStore.rootStore.router;
  }

  /**
   * This method is called to fetch the first issues of pagination
   * @param workspaceSlug
   * @param projectId
   * @param loadType
   * @param options
   * @returns
   */
  fetchIssues = async (
    workspaceSlug: string,
    projectId: string,
    loadType: TLoader = "init-loader",
    options: IssuePaginationOptions,
    isExistingPaginationOptions: boolean = false
  ) => {
    try {
      // set loader and clear store
      runInAction(() => {
        this.setLoader(loadType);
        this.clear(!isExistingPaginationOptions, false); // clear while fetching from server.
        if (!this.groupBy) this.clear(!isExistingPaginationOptions, true); // clear while using local to have the no load effect.
      });

      // get params from pagination options
      const params = this.issueFilterStore?.getFilterParams(options, projectId, undefined, undefined, undefined);
      // call the fetch issues API with the params
      const response = await this.issueService.getIssues(workspaceSlug, projectId, params, {
        signal: this.controller.signal,
      });

      // after fetching issues, call the base method to process the response further
      this.onfetchIssues(response, options, workspaceSlug, projectId, undefined, !isExistingPaginationOptions);
      return response;
    } catch (error) {
      // set loader to undefined if errored out
      this.setLoader(undefined);
      throw error;
    }
  };
  updateIssue = this.issueUpdate;
}
