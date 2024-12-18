import { set, unset } from "lodash";
import { action, makeObservable, observable, runInAction } from "mobx";
import { TProjectPublishSettings } from "@plane/types";
import { ProjectPublishService } from "@/services/project";
import { ProjectRootStore } from ".";

export interface IProjectPublishStore {
  // states
  generalLoader: boolean;
  fetchSettingsLoader: boolean;
  // observables
  publishSettingsMap: Record<string, TProjectPublishSettings>; // projectID => TProjectPublishSettings
  // helpers
  getPublishSettingsByProjectID: (projectID: string) => TProjectPublishSettings | undefined;
  // actions
  fetchPublishSettings: (workspaceSlug: string, projectID: string) => Promise<TProjectPublishSettings>;
  updatePublishSettings: (
    workspaceSlug: string,
    projectID: string,
    projectPublishId: string,
    data: Partial<TProjectPublishSettings>
  ) => Promise<TProjectPublishSettings>;
  publishProject: (
    workspaceSlug: string,
    projectID: string,
    data: Partial<TProjectPublishSettings>
  ) => Promise<TProjectPublishSettings>;
  unPublishProject: (workspaceSlug: string, projectID: string, projectPublishId: string) => Promise<void>;
}

export class ProjectPublishStore implements IProjectPublishStore {
  // states
  generalLoader: boolean = false;
  fetchSettingsLoader: boolean = false;
  // observables
  publishSettingsMap: Record<string, TProjectPublishSettings> = {};
  // root store
  projectRootStore: ProjectRootStore;
  // services
  projectPublishService;

  constructor(_projectRootStore: ProjectRootStore) {
    makeObservable(this, {
      // states
      generalLoader: observable.ref,
      fetchSettingsLoader: observable.ref,
      // observables
      publishSettingsMap: observable,
      // actions
      fetchPublishSettings: action,
      updatePublishSettings: action,
      publishProject: action,
      unPublishProject: action,
    });
    // root store
    this.projectRootStore = _projectRootStore;
    // services
    this.projectPublishService = new ProjectPublishService();
  }

  fetchPublishSettings = async (workspaceSlug: string, projectID: string) => {
    try {
      runInAction(() => {
        this.fetchSettingsLoader = true;
      });
      const response = await this.projectPublishService.fetchPublishSettings(workspaceSlug, projectID);

      runInAction(() => {
        set(this.publishSettingsMap, [projectID], response);
        this.fetchSettingsLoader = false;
      });
      return response;
    } catch (error) {
      runInAction(() => {
        this.fetchSettingsLoader = false;
      });
      throw error;
    }
  };

  getPublishSettingsByProjectID = (projectID: string): TProjectPublishSettings | undefined =>
    this.publishSettingsMap?.[projectID] ?? undefined;

  publishProject = async (workspaceSlug: string, projectID: string, data: Partial<TProjectPublishSettings>) => {
    try {
      runInAction(() => {
        this.generalLoader = true;
      });
      const response = await this.projectPublishService.publishProject(workspaceSlug, projectID, data);
      runInAction(() => {
        set(this.publishSettingsMap, [projectID], response);
        set(this.projectRootStore.project.projectMap, [projectID, "anchor"], response.anchor);
        this.generalLoader = false;
      });
      return response;
    } catch (error) {
      runInAction(() => {
        this.generalLoader = false;
      });
      throw error;
    }
  };

  updatePublishSettings = async (
    workspaceSlug: string,
    projectID: string,
    projectPublishId: string,
    data: Partial<TProjectPublishSettings>
  ) => {
    try {
      runInAction(() => {
        this.generalLoader = true;
      });
      const response = await this.projectPublishService.updatePublishSettings(
        workspaceSlug,
        projectID,
        projectPublishId,
        data
      );
      runInAction(() => {
        set(this.publishSettingsMap, [projectID], response);
        this.generalLoader = false;
      });
      return response;
    } catch (error) {
      runInAction(() => {
        this.generalLoader = false;
      });
      throw error;
    }
  };

  unPublishProject = async (workspaceSlug: string, projectID: string, projectPublishId: string) => {
    try {
      runInAction(() => {
        this.generalLoader = true;
      });
      const response = await this.projectPublishService.unpublishProject(workspaceSlug, projectID, projectPublishId);
      runInAction(() => {
        unset(this.publishSettingsMap, [projectID]);
        set(this.projectRootStore.project.projectMap, [projectID, "anchor"], null);
        this.generalLoader = false;
      });
      return response;
    } catch (error) {
      runInAction(() => {
        this.generalLoader = false;
      });
      throw error;
    }
  };
}
