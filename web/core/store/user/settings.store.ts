import { action, makeObservable, observable, runInAction } from "mobx";
import { IUserSettings } from "@plane/types";
import { getValueFromLocalStorage, setValueIntoLocalStorage } from "@/hooks/use-local-storage";
import { persistence } from "@/local-db/storage.sqlite";
import { UserService } from "@/services/user.service";

type TError = {
  status: string;
  message: string;
};

const LOCAL_DB_ENABLED = "LOCAL_DB_ENABLED";

export interface IUserSettingsStore {
  // observables
  isLoading: boolean;
  error: TError | undefined;
  data: IUserSettings;
  canUseLocalDB: boolean;
  // actions
  fetchCurrentUserSettings: () => Promise<IUserSettings | undefined>;
  toggleLocalDB: (workspaceSlug: string | undefined, projectId: string | undefined) => Promise<void>;
}

export class UserSettingsStore implements IUserSettingsStore {
  // observables
  isLoading: boolean = false;
  error: TError | undefined = undefined;
  data: IUserSettings = {
    id: undefined,
    email: undefined,
    workspace: {
      last_workspace_id: undefined,
      last_workspace_slug: undefined,
      fallback_workspace_id: undefined,
      fallback_workspace_slug: undefined,
      invites: undefined,
    },
  };
  canUseLocalDB: boolean = getValueFromLocalStorage(LOCAL_DB_ENABLED, true);
  // services
  userService: UserService;

  constructor() {
    makeObservable(this, {
      // observables
      isLoading: observable.ref,
      error: observable,
      data: observable,
      canUseLocalDB: observable.ref,
      // actions
      fetchCurrentUserSettings: action,
      toggleLocalDB: action,
    });

    this.userService = new UserService();
  }

  fetchCurrentUserSettings = async () => {
    try {
      runInAction(() => {
        this.isLoading = true;
        this.error = undefined;
      });
      const userSettings = await this.userService.currentUserSettings();
      runInAction(() => {
        this.isLoading = false;
        this.data = userSettings;
      });

      return userSettings;
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
        this.error = {
          status: "error",
          message: "Failed to fetch user settings",
        };
      });

      throw error;
    }
  };

  toggleLocalDB = async (workspaceSlug: string | undefined, projectId: string | undefined) => {
    const currentLocalDBValue = this.canUseLocalDB;

    console.log(currentLocalDBValue, "<><>");
    try {
      runInAction(() => {
        this.canUseLocalDB = !currentLocalDBValue;
      });
      const transactionResult = setValueIntoLocalStorage(LOCAL_DB_ENABLED, !currentLocalDBValue);

      if (!transactionResult) {
        throw new Error("error while toggling local DB");
      }

      if (currentLocalDBValue) {
        await persistence.clearStorage();
      } else if (workspaceSlug) {
        await persistence.initialize(workspaceSlug);
        persistence.syncWorkspace();
        projectId && persistence.syncIssues(projectId);
      }
    } catch (e) {
      console.warn("error while toggling local DB");
      runInAction(() => {
        this.canUseLocalDB = currentLocalDBValue;
      });
    }
  };
}
