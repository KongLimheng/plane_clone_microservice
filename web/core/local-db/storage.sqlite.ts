import * as Comlink from "comlink";
import { set } from "lodash";
import { TIssue } from "@plane/types";
import { EIssueGroupBYServerToProperty } from "@/constants/issue";
import { rootStore } from "@/lib/store-context";
import { IssueService } from "@/services/issue";
import { ARRAY_FIELDS, BOOLEAN_FIELDS } from "./utils/constants";
import { loadWorkSpaceData } from "./utils/load-workspace";
import { issueFilterCountQueryConstructor, issueFilterQueryConstructor } from "./utils/query-constructor";
import { runQuery } from "./utils/query-executor";
import { createTables } from "./utils/tables";
import { clearOPFS, getGroupedIssueResults, getSubGroupedIssueResults, log, logError, logInfo } from "./utils/utils";

const DB_VERSION = 1;
const PAGE_SIZE = 500;
const BATCH_SIZE = 50;

type TProjectStatus = {
  issues: { status: undefined | "loading" | "ready" | "error" | "syncing"; sync: Promise<void> | undefined };
};

type TDBStatus = "initializing" | "ready" | "error" | undefined;

export class Storage {
  db: any;
  status: TDBStatus = undefined;
  dbName = "plane";
  projectStatus: Record<string, TProjectStatus> = {};
  workspaceSlug: string = "";

  constructor() {
    this.db = null;
    if (typeof window !== undefined) {
      window.addEventListener("beforeunload", this.closeDBConnection);
    }
  }

  reset = () => {
    if (this.db) {
      this.db.close();
    }
    this.db = null;
    this.status = undefined;
    this.projectStatus = {};
    this.workspaceSlug = "";
  };

  closeDBConnection = async () => {
    if (this.db) {
      await this.db.close();
    }
  };

  clearStorage = async (force = false) => {
    try {
      await this.db?.close();
      await clearOPFS(force);
      this.reset();
    } catch (e) {
      console.error("Error clearing sqlite sync storage", e);
    }
  };

  initialize = async (workspaceSlug: string) => {
    if (!rootStore.user.localDBEnabled) return false; // return if the window gets hidden

    console.log(workspaceSlug, "from db");
    if (workspaceSlug !== this.workspaceSlug) this.reset();

    try {
      await this._initialize(workspaceSlug);
      return true;
    } catch (error) {
      logError(error);
      this.status = "error";
      return false;
    }
  };

  _initialize = async (workspaceSlug: string) => {
    if (this.status === "initializing") {
      console.warn(`Initialization already in progress for workspace ${workspaceSlug}`);
      return false;
    }

    if (this.status === "ready") {
      console.warn(`Already initialized for workspace ${workspaceSlug}`);
      return true;
    }
    if (this.status === "error") {
      console.warn(`Initialization failed for workspace ${workspaceSlug}`);
      return false;
    }

    try {
      const { DBClass } = await import("./worker/db");
      const worker = new Worker(new URL("./worker/db.ts", import.meta.url));
      const MyWorker = Comlink.wrap<typeof DBClass>(worker);

      // Add cleanup on window unload
      window.addEventListener("unload", () => worker.terminate());
      this.workspaceSlug = workspaceSlug;
      this.dbName = workspaceSlug;
      const instance = await new MyWorker();
      await instance.init(workspaceSlug);
      this.db = {
        exec: instance.exec,
        close: instance.close,
      };

      this.status = "ready";
      // Your SQLite code here.
      await createTables();

      await this.setOption("DB_VERSION", DB_VERSION.toString());
      return true;
    } catch (error) {
      this.status = "error";
      this.db = null;
      throw new Error(`Failed to initialize database worker: ${error}`);
    }
  };

  syncWorkspace = async () => {
    if (!rootStore.user.localDBEnabled) return;
    const syncInProgress = await this.getIsWriteInProgress("sync_workspace");
    if (syncInProgress) {
      log("Sync in progress, skipping");
      return;
    }

    try {
      // await startSpan({ name: "LOAD_WS", attributes: { slug: this.workspaceSlug } }, async () => {
      this.setOption("sync_workspace", new Date().toUTCString());
      await loadWorkSpaceData(this.workspaceSlug);
      this.deleteOption("sync_workspace");
      // });
    } catch (e) {
      logError(e);
      this.deleteOption("sync_workspace");
    }
  };

  syncProject = async (projectId: string) => {
    if (document.hidden || !rootStore.user.localDBEnabled) return false; // return if the window gets hidden

    // Load labels, members, states, modules, cycles
    await this.syncIssues(projectId);
  };

  syncIssues = async (projectId: string) => {
    if (document.hidden || !rootStore.user.localDBEnabled) return false; // return if the window gets hidden

    // try {
    //   const sync = Sentry.startSpan({ name: `SYNC_ISSUES` }, () => this._syncIssues(projectId));
    //   this.setSync(projectId, sync);
    //   await sync;
    // } catch (e) {
    //   logError(e);
    //   this.setStatus(projectId, "error");
    // }
  };

  getOption = async (key: string, fallback?: string | boolean | number) => {
    try {
      const options = await runQuery(`select * from options where key='${key}'`);
      if (options.length) {
        return options[0].value;
      }

      return fallback;
    } catch (e) {
      return fallback;
    }
  };

  deleteOption = async (key: string) => {
    await runQuery(` DELETE FROM options where key='${key}'`);
  };

  getIsWriteInProgress = async (op: string) => {
    const writeStartTime = await this.getOption(op, false);
    if (writeStartTime) {
      // Check if it has been more than 5seconds
      const current = new Date();
      const start = new Date(writeStartTime);

      if (current.getTime() - start.getTime() < 5000) {
        return true;
      }
      return false;
    }
    return false;
  };

  setOption = async (key: string, value: string) => {
    await runQuery(`insert or replace into options (key, value) values ('${key}', '${value}')`);
  };

  getStatus = (projectId: string) => this.projectStatus[projectId]?.issues?.status || undefined;
  setStatus = (projectId: string, status: "loading" | "ready" | "error" | "syncing" | undefined = undefined) => {
    set(this.projectStatus, `${projectId}.issues.status`, status);
  };

  getIssue = async (issueId: string) => {
    try {
      if (!rootStore.user.localDBEnabled) return;

      const issues = await runQuery(`select * from issues where id='${issueId}'`);
      if (issues.length) {
        return formatLocalIssue(issues[0]);
      }
    } catch (err) {
      logError(err);
      console.warn("unable to fetch issue from local db");
    }

    return;
  };

  getIssues = async (workspaceSlug: string, projectId: string, queries: any, config: any) => {
    log("#### Queries", queries);

    const currentProjectStatus = this.getStatus(projectId);
    if (
      !currentProjectStatus ||
      this.status !== "ready" ||
      currentProjectStatus === "loading" ||
      currentProjectStatus === "error" ||
      !rootStore.user.localDBEnabled
    ) {
      if (rootStore.user.localDBEnabled) {
        log(`Project ${projectId} is loading, falling back to server`);
      }
      const issueService = new IssueService();
      return await issueService.getIssuesFromServer(workspaceSlug, projectId, queries, config);
    }

    const { cursor, group_by, sub_group_by } = queries;

    const query = issueFilterQueryConstructor(this.workspaceSlug, projectId, queries);
    log("#### Query", query);
    const countQuery = issueFilterCountQueryConstructor(this.workspaceSlug, projectId, queries);
    const start = performance.now();
    let issuesRaw: any[] = [];
    let count: any[];
    try {
      [issuesRaw, count] = await Promise.all([runQuery(query), runQuery(countQuery)]);
    } catch (e) {
      logError(e);
      const issueService = new IssueService();
      return await issueService.getIssuesFromServer(workspaceSlug, projectId, queries, config);
    }
    const end = performance.now();

    const { total_count } = count[0];

    const [pageSize, page, offset] = cursor.split(":");

    const groupByProperty: string =
      EIssueGroupBYServerToProperty[group_by as keyof typeof EIssueGroupBYServerToProperty];
    const subGroupByProperty =
      EIssueGroupBYServerToProperty[sub_group_by as keyof typeof EIssueGroupBYServerToProperty];

    const parsingStart = performance.now();
    let issueResults = issuesRaw.map((issue: any) => formatLocalIssue(issue));

    log("#### Issue Results", issueResults.length);

    const parsingEnd = performance.now();

    const grouping = performance.now();
    if (groupByProperty && page === "0") {
      if (subGroupByProperty) {
        issueResults = getSubGroupedIssueResults(issueResults);
      } else {
        issueResults = getGroupedIssueResults(issueResults);
      }
    }
    const groupCount = group_by ? Object.keys(issueResults).length : undefined;
    // const subGroupCount = sub_group_by ? Object.keys(issueResults[Object.keys(issueResults)[0]]).length : undefined;
    const groupingEnd = performance.now();

    const times = {
      IssueQuery: end - start,
      Parsing: parsingEnd - parsingStart,
      Grouping: groupingEnd - grouping,
    };
    if ((window as any).DEBUG) {
      console.table(times);
    }
    const total_pages = Math.ceil(total_count / Number(pageSize));
    const next_page_results = total_pages > parseInt(page) + 1;

    const out = {
      results: issueResults,
      next_cursor: `${pageSize}:${parseInt(page) + 1}:${Number(offset) + Number(pageSize)}`,
      prev_cursor: `${pageSize}:${parseInt(page) - 1}:${Number(offset) - Number(pageSize)}`,
      total_results: total_count,
      total_count,
      next_page_results,
      total_pages,
    };

    // const activeSpan = getActiveSpan();
    // activeSpan?.setAttributes({
    //   projectId,
    //   count: total_count,
    //   groupBy: group_by,
    //   subGroupBy: sub_group_by,
    //   queries: queries,
    //   local: true,
    //   groupCount,
    //   // subGroupCount,
    // });
    return out;
  };
}

export const persistence = new Storage();

/**
 * format the issue fetched from local db into an issue
 * @param issue
 * @returns
 */
export const formatLocalIssue = (issue: any) => {
  const currIssue = issue;
  ARRAY_FIELDS.forEach((field: string) => {
    currIssue[field] = currIssue[field] ? JSON.parse(currIssue[field]) : [];
  });
  // Convert boolean fields to actual boolean values
  BOOLEAN_FIELDS.forEach((field: string) => {
    currIssue[field] = currIssue[field] === 1;
  });
  return currIssue as TIssue & { group_id?: string; total_issues: number; sub_group_id?: string };
};
