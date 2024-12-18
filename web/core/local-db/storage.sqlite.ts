import { set } from "lodash";
import { TIssue } from "@plane/types";
import { EIssueGroupBYServerToProperty } from "@/constants/issue";
import { rootStore } from "@/lib/store-context";
import { IssueService } from "@/services/issue";
import { ARRAY_FIELDS, BOOLEAN_FIELDS } from "./utils/constants";
import { issueFilterCountQueryConstructor, issueFilterQueryConstructor } from "./utils/query-constructor";
import { runQuery } from "./utils/query-executor";
import { createTables } from "./utils/tables";
import { getGroupedIssueResults, getSubGroupedIssueResults, log, logError, logInfo } from "./utils/utils";

declare module "@sqlite.org/sqlite-wasm" {
  export function sqlite3Worker1Promiser(...args: any): any;
}

const DB_VERSION = 1;
const PAGE_SIZE = 1000;
const BATCH_SIZE = 200;

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
  }

  reset = () => {
    this.db = null;
    this.status = undefined;
    this.projectStatus = {};
    this.workspaceSlug = "";
  };

  clearStorage = async () => {
    try {
      const storageManager = window.navigator.storage;
      const fileSystemDirectoryHandle = await storageManager.getDirectory();
      //@ts-expect-error , clear local issue cache
      await fileSystemDirectoryHandle.remove({ recursive: true });
    } catch (error) {
      console.error("Error clearing sqlite sync storage", error);
    }
  };

  initialize = async (workspaceSlug: string) => {
    console.log(workspaceSlug, "from db");
    if (document.hidden || !rootStore.user.localDBEnabled) return false;
    if (workspaceSlug !== this.workspaceSlug) this.reset();

    try {
      await this._initialize(workspaceSlug);
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

    logInfo("Loading and initializing SQLite3 module...");

    this.workspaceSlug = workspaceSlug;
    this.dbName = workspaceSlug;

    const { sqlite3Worker1Promiser } = await import("@sqlite.org/sqlite-wasm");

    try {
      const promiser: any = await new Promise((resolve) => {
        const _promiser = sqlite3Worker1Promiser({
          onready: () => resolve(_promiser),
        });
      });

      const configResponse = await promiser("config-set", {});
      log("Running SQLite3 version", configResponse.result.version.libVersion);

      const openResponse = await promiser("open", {
        filename: `file:${this.dbName}.sqlite3?vfs=opfs`,
      });

      const { dbId } = openResponse;
      this.db = {
        dbId,
        exec: async (val: any) => {
          if (typeof val === "string") {
            val = { sql: val };
          }

          return promiser("exec", { dbId, ...val });
        },
      };

      // dump DB of db version is matching
      const dbVersion = await this.getOption("DB_VERSION");
      if (dbVersion !== "" && parseInt(dbVersion) !== DB_VERSION) {
        await this.clearStorage();
        this.reset();
        await this._initialize(workspaceSlug);
        return false;
      }

      log(
        "OPFS is available, created persisted database at",
        openResponse.result.filename.replace(/^file:(.*?)\?vfs=opfs$/, "$1")
      );
      this.status = "ready";

      // Your SQLite code here.
      await createTables();
      await this.setOption("DB_VERSION", DB_VERSION.toString());
    } catch (error) {}
  };

  syncWorkspace = async () => {
    if (document.hidden || !rootStore.user.localDBEnabled) return; // return if the window gets hidden
    // await Sentry.startSpan({ name: "LOAD_WS", attributes: { slug: this.workspaceSlug } }, async () => {
    // await loadWorkSpaceData(this.workspaceSlug);
    // });
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

  getOption = async (key: string, fallback = "") => {
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
      [issuesRaw, count] = await startSpan(
        { name: "GET_ISSUES" },
        async () => await Promise.all([runQuery(query), runQuery(countQuery)])
      );
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
