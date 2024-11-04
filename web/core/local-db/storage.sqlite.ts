import { rootStore } from "@/lib/store-context";
import { runQuery } from "./utils/query-executor";
import { createTables } from "./utils/tables";
import { log, logError, logInfo } from "./utils/utils";

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
    console.log(rootStore.user.localDBEnabled);
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
}

export const persistence = new Storage();
