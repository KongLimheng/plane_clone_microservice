import { set, sortBy } from "lodash";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import { orderProjects, shouldFilterProject } from "@/helpers/project.helper";
import { TProject } from "@/plane-web/types/projects";
import { ProjectService } from "@/services/project";
import { CoreRootStore } from "../root.store";

export interface IProjectStore {
  // observables
  isUpdatingProject: boolean;
  loader: boolean;
  projectMap: {
    [projectId: string]: TProject; // projectId: project Info
  };
  // computed
  filteredProjectIds: string[] | undefined;
  workspaceProjectIds: string[] | undefined;
  archivedProjectIds: string[] | undefined;
  totalProjectIds: string[] | undefined;
  joinedProjectIds: string[];
  // favoriteProjectIds: string[];
  currentProjectDetails: TProject | undefined;
  // actions
  getProjectById: (projectId: string | undefined | null) => TProject | undefined;
  // getProjectIdentifierById: (projectId: string | undefined | null) => string;
  // fetch actions
  fetchProjects: (workspaceSlug: string) => Promise<TProject[]>;
  fetchProjectDetails: (workspaceSlug: string, projectId: string) => Promise<TProject>;
  // // favorites actions
  // addProjectToFavorites: (workspaceSlug: string, projectId: string) => Promise<any>;
  // removeProjectFromFavorites: (workspaceSlug: string, projectId: string) => Promise<any>;
  // // project-view action
  updateProjectView: (workspaceSlug: string, projectId: string, viewProps: any) => Promise<any>;
  // // CRUD actions
  createProject: (workspaceSlug: string, data: Partial<TProject>) => Promise<TProject>;
  updateProject: (workspaceSlug: string, projectId: string, data: Partial<TProject>) => Promise<TProject>;
  // deleteProject: (workspaceSlug: string, projectId: string) => Promise<void>;
  // // archive actions
  // archiveProject: (workspaceSlug: string, projectId: string) => Promise<void>;
  // restoreProject: (workspaceSlug: string, projectId: string) => Promise<void>;
}

export class ProjectStore implements IProjectStore {
  // observables
  isUpdatingProject: boolean = false;
  loader: boolean = false;
  projectMap: {
    [projectId: string]: TProject; // projectId: project Info
  } = {};
  // root store
  rootStore: CoreRootStore;
  // service
  projectService;
  // projectArchiveService;
  // issueLabelService;
  // issueService;
  // stateService;

  constructor(_rootStore: CoreRootStore) {
    makeObservable(this, {
      // observables
      isUpdatingProject: observable,
      loader: observable.ref,
      projectMap: observable,
      // computed
      workspaceProjectIds: computed,
      archivedProjectIds: computed,
      joinedProjectIds: computed,
      totalProjectIds: computed,
      currentProjectDetails: computed,

      // CRUD actions
      createProject: action,
      fetchProjects: action,
    });
    // root store
    this.rootStore = _rootStore;

    //services
    this.projectService = new ProjectService();
  }

  /**
   * @description returns filtered projects based on filters and search query
   */
  get filteredProjectIds() {
    const workspaceDetails = this.rootStore.workspaceRoot.currentWorkspace;
    const {
      currentWorkspaceDisplayFilters: displayFilters,
      currentWorkspaceFilters: filters,
      searchQuery,
    } = this.rootStore.projectRoot.projectFilter;
    if (!workspaceDetails || !displayFilters || !filters) return;
    let workspaceProjects = Object.values(this.projectMap).filter(
      (p) =>
        p.workspace === workspaceDetails.id &&
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.identifier.toLowerCase().includes(searchQuery.toLowerCase())) &&
        shouldFilterProject(p, displayFilters, filters)
    );
    workspaceProjects = orderProjects(workspaceProjects, displayFilters.order_by);
    return workspaceProjects.map((p) => p.id);
  }

  get joinedProjectIds() {
    const currentWorkspace = this.rootStore.workspaceRoot.currentWorkspace;
    if (!currentWorkspace) return [];
    let projects = Object.values(this.projectMap ?? {});
    projects = sortBy(projects, "sort_order");
    const projectIds = projects
      .filter((project) => project.workspace === currentWorkspace.id && project.is_member && !project.archived_at)
      .map((project) => project.id);

    return projectIds;
  }

  /**
   * Returns project IDs belong to the current workspace
   */
  get workspaceProjectIds() {
    const workspaceDetails = this.rootStore.workspaceRoot.currentWorkspace;
    if (!workspaceDetails) return;
    const workspaceProjects = Object.values(this.projectMap).filter(
      (p) => p.workspace === workspaceDetails.id && !p.archived_at
    );
    const projectIds = workspaceProjects.map((p) => p.id);
    return projectIds ?? null;
  }

  get archivedProjectIds() {
    const currentWorkspace = this.rootStore.workspaceRoot.currentWorkspace;
    if (!currentWorkspace) return;

    let projects = Object.values(this.projectMap ?? {});
    projects = sortBy(projects, "archived_at");

    const projectIds = projects
      .filter((project) => project.workspace === currentWorkspace.id && !!project.archived_at)
      .map((project) => project.id);
    return projectIds;
  }

  /**
   * Returns total project IDs belong to the current workspace
   */
  // workspaceProjectIds + archivedProjectIds
  get totalProjectIds() {
    const currentWorkspace = this.rootStore.workspaceRoot.currentWorkspace;
    if (!currentWorkspace) return;

    const workspaceProjects = this.workspaceProjectIds ?? [];
    const archivedProjects = this.archivedProjectIds ?? [];
    return [...workspaceProjects, ...archivedProjects];
  }

  /**
   * Returns current project details
   */
  get currentProjectDetails() {
    if (!this.rootStore.router.projectId) return;
    return this.projectMap?.[this.rootStore.router.projectId];
  }

  createProject = async (workspaceSlug: string, data: any) => {
    try {
      const response = await this.projectService.createProject(workspaceSlug, data);
      runInAction(() => {
        set(this.projectMap, [response.id], response);
        // updating the user project role in workspaceProjectsPermissions
        set(
          this.rootStore.user.permission.workspaceProjectsPermissions,
          [workspaceSlug, response.id],
          response.member_role
        );
      });
      return response;
    } catch (error) {
      console.log("Failed to create project from project store");
      throw error;
    }
  };

  fetchProjects = async (workspaceSlug: string) => {
    try {
      this.loader = true;
      const projectRes = await this.projectService.getProjects(workspaceSlug);
      runInAction(() => {
        projectRes.forEach((project) => {
          set(this.projectMap, [project.id], project);
        });

        this.loader = false;
      });

      return projectRes;
    } catch (error) {
      console.log("Failed to fetch project from workspace store");
      this.loader = false;
      throw error;
    }
  };

  getProjectById = computedFn((projectId: string | undefined | null) => {
    const projectInfo = this.projectMap[projectId ?? ""] || undefined;
    return projectInfo;
  });

  fetchProjectDetails = async (workspaceSlug: string, projectId: string) => {
    try {
      const response = await this.projectService.getProject(workspaceSlug, projectId);
      runInAction(() => {
        set(this.projectMap, [projectId], response);
      });
      return response;
    } catch (error) {
      console.log("Error while fetching project details", error);
      throw error;
    }
  };

  updateProject = async (workspaceSlug: string, projectId: string, data: Partial<TProject>) => {
    try {
      const projectDetails = this.getProjectById(projectId);
      runInAction(() => {
        set(this.projectMap, [projectId], { ...projectDetails, ...data });
        this.isUpdatingProject = true;
      });
      const response = await this.projectService.updateProject(workspaceSlug, projectId, data);
      runInAction(() => {
        this.isUpdatingProject = false;
      });
      return response;
    } catch (error) {
      console.log("Failed to create project from project store");
      this.fetchProjects(workspaceSlug);
      this.fetchProjectDetails(workspaceSlug, projectId);
      runInAction(() => {
        this.isUpdatingProject = false;
      });
      throw error;
    }
  };

  /**
   * Updates the project view
   * @param workspaceSlug
   * @param projectId
   * @param viewProps
   * @returns
   */
  updateProjectView = async (workspaceSlug: string, projectId: string, viewProps: { sort_order: number }) => {
    const currentProjectSortOrder = this.getProjectById(projectId)?.sort_order;
    try {
      runInAction(() => {
        set(this.projectMap, [projectId, "sort_order"], viewProps?.sort_order);
      });
      const response = await this.projectService.setProjectView(workspaceSlug, projectId, viewProps);
      return response;
    } catch (error) {
      runInAction(() => {
        set(this.projectMap, [projectId, "sort_order"], currentProjectSortOrder);
      });
      console.log("Failed to update sort order of the projects");
      throw error;
    }
  };
}
