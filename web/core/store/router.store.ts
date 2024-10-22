import { ParsedUrlQuery } from "node:querystring";
import { action, makeObservable, observable, runInAction } from "mobx";
import { TProfileViews } from "@plane/types";

export interface IRouterStore {
  // observables
  query: ParsedUrlQuery;
  // actions
  setQuery: (query: ParsedUrlQuery) => void;
  // computed
  workspaceSlug: string | undefined;
  projectId: string | undefined;
  cycleId: string | undefined;
  moduleId: string | undefined;
  viewId: string | undefined;
  globalViewId: string | undefined;
  profileViewId: TProfileViews | undefined;
  userId: string | undefined;
  peekId: string | undefined;
  issueId: string | undefined;
  inboxId: string | undefined;
  webhookId: string | undefined;
}

export class RouterStore implements IRouterStore {
  query: ParsedUrlQuery = {};

  constructor() {
    makeObservable(this, {
      query: observable,
      setQuery: action.bound,
    });
  }

  setQuery = (query: ParsedUrlQuery) => {
    runInAction(() => {
      this.query = query;
    });
  };
}
