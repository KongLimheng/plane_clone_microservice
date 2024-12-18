import { set, update } from "lodash";
import { action, makeObservable, observable, runInAction } from "mobx";
import { TIssue } from "@plane/types";
import { getCurrentDateTimeInISO } from "@/helpers/date-time.helper";

export type IIssueStore = {
  // observables
  issuesMap: Record<string, TIssue>; // Record defines issue_id as key and TIssue as value
  // actions
  // getIssues(workspaceSlug: string, projectId: string, issueIds: string[]): Promise<TIssue[]>;
  addIssue(issues: TIssue[]): void;
  updateIssue(issueId: string, issue: Partial<TIssue>): void;
  // removeIssue(issueId: string): void;
  // helper methods
  // getIssueById(issueId: string): undefined | TIssue;
  // getIssuesByIds(issueIds: string[], type: "archived" | "un-archived"): TIssue[]; // Record defines issue_id as key and TIssue as value
};

export class IssueStore implements IIssueStore {
  // observables
  issuesMap: { [issue_id: string]: TIssue } = {};
  // service
  // issueService;

  constructor() {
    makeObservable(this, {
      // observable
      issuesMap: observable,
      // actions
      //  addIssue: action,
      updateIssue: action,
      //  removeIssue: action,
    });

    // this.issueService = new IssueService();
  }

  /**
   * @description This method will update the issue in the issuesMap
   * @param {string} issueId
   * @param {Partial<TIssue>} issue
   * @returns {void}
   */
  updateIssue = (issueId: string, issue: Partial<TIssue>) => {
    if (!issue || !issueId || !this.issuesMap[issueId]) return;
    runInAction(() => {
      set(this.issuesMap, [issueId, "updated_at"], getCurrentDateTimeInISO());
      Object.keys(issue).forEach((key) => {
        set(this.issuesMap, [issueId, key], issue[key as keyof TIssue]);
      });
    });
    // updatePersistentLayer(issueId);
  };

  // actions
  /**
   * @description This method will add issues to the issuesMap
   * @param {TIssue[]} issues
   * @returns {void}
   */
  addIssue = (issues: TIssue[]): void => {
    if (issues && issues.length <= 0) return;
    runInAction(() => {
      issues.forEach((issue) => {
        if (!this.issuesMap[issue.id]) set(this.issuesMap, issue.id, issue);
        else update(this.issuesMap, issue.id, (prevIssue) => ({ ...prevIssue, ...issue }));
      });
    });
  };
}
