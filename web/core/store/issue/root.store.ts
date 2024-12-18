import { autorun, makeObservable, observable } from "mobx";
import { IProject, IState } from "@plane/types";
import { CoreRootStore } from "../root.store";
import { IIssueStore, IssueStore } from "./issue.store";
import { IProjectIssues, IProjectIssuesFilter, ProjectIssue, ProjectIssuesFilter } from "./project";

export interface IIssueRootStore {
  currentUserId: string | undefined;
  workspaceSlug: string | undefined;
  projectId: string | undefined;
  cycleId: string | undefined;
  moduleId: string | undefined;
  viewId: string | undefined;
  globalViewId: string | undefined; // all issues view id
  userId: string | undefined; // user profile detail Id
  // stateMap: Record<string, IState> | undefined;
  stateDetails: IState[] | undefined;
  // workspaceStateDetails: IState[] | undefined;
  // labelMap: Record<string, IIssueLabel> | undefined;
  // workSpaceMemberRolesMap: Record<string, IWorkspaceMembership> | undefined;
  // memberMap: Record<string, IUserLite> | undefined;
  // projectMap: Record<string, IProject> | undefined;
  // moduleMap: Record<string, IModule> | undefined;
  // cycleMap: Record<string, ICycle> | undefined;

  rootStore: CoreRootStore;
  issues: IIssueStore;

  // state: IStateStore;

  // issueDetail: IIssueDetail;

  // workspaceIssuesFilter: IWorkspaceIssuesFilter;
  // workspaceIssues: IWorkspaceIssues;

  // workspaceDraftIssuesFilter: IWorkspaceDraftIssuesFilter;
  // workspaceDraftIssues: IWorkspaceDraftIssues;

  // profileIssuesFilter: IProfileIssuesFilter;
  // profileIssues: IProfileIssues;

  projectIssuesFilter: IProjectIssuesFilter;
  projectIssues: IProjectIssues;

  // cycleIssuesFilter: ICycleIssuesFilter;
  // cycleIssues: ICycleIssues;

  // moduleIssuesFilter: IModuleIssuesFilter;
  // moduleIssues: IModuleIssues;

  // projectViewIssuesFilter: IProjectViewIssuesFilter;
  // projectViewIssues: IProjectViewIssues;

  // archivedIssuesFilter: IArchivedIssuesFilter;
  // archivedIssues: IArchivedIssues;

  // draftIssuesFilter: IDraftIssuesFilter;
  // draftIssues: IDraftIssues;

  // issueKanBanView: IIssueKanBanViewStore;
  // issueCalendarView: ICalendarStore;
}

export class IssueRootStore implements IIssueRootStore {
  currentUserId: string | undefined = undefined;
  workspaceSlug: string | undefined = undefined;
  projectId: string | undefined = undefined;
  cycleId: string | undefined = undefined;
  moduleId: string | undefined = undefined;
  viewId: string | undefined = undefined;
  globalViewId: string | undefined = undefined;
  userId: string | undefined = undefined;
  // stateMap: Record<string, IState> | undefined = undefined;
  stateDetails: IState[] | undefined = undefined;
  // workspaceStateDetails: IState[] | undefined = undefined;
  // labelMap: Record<string, IIssueLabel> | undefined = undefined;
  // workSpaceMemberRolesMap: Record<string, IWorkspaceMembership> | undefined = undefined;
  // memberMap: Record<string, IUserLite> | undefined = undefined;
  projectMap: Record<string, IProject> | undefined = undefined;
  // moduleMap: Record<string, IModule> | undefined = undefined;
  // cycleMap: Record<string, ICycle> | undefined = undefined;

  rootStore: CoreRootStore;
  issues: IIssueStore;
  // state: IStateStore;

  // issueDetail: IIssueDetail;

  // workspaceIssuesFilter: IWorkspaceIssuesFilter;
  // workspaceIssues: IWorkspaceIssues;

  // workspaceDraftIssuesFilter: IWorkspaceDraftIssuesFilter;
  // workspaceDraftIssues: IWorkspaceDraftIssues;

  // profileIssuesFilter: IProfileIssuesFilter;
  // profileIssues: IProfileIssues;

  projectIssuesFilter: IProjectIssuesFilter;
  projectIssues: IProjectIssues;

  // cycleIssuesFilter: ICycleIssuesFilter;
  // cycleIssues: ICycleIssues;

  // moduleIssuesFilter: IModuleIssuesFilter;
  // moduleIssues: IModuleIssues;

  // projectViewIssuesFilter: IProjectViewIssuesFilter;
  // projectViewIssues: IProjectViewIssues;

  // archivedIssuesFilter: IArchivedIssuesFilter;
  // archivedIssues: IArchivedIssues;

  // draftIssuesFilter: IDraftIssuesFilter;
  // draftIssues: IDraftIssues;

  // issueKanBanView: IIssueKanBanViewStore;
  // issueCalendarView: ICalendarStore;

  constructor(rootStore: CoreRootStore) {
    makeObservable(this, {
      workspaceSlug: observable.ref,
      projectId: observable.ref,
      // cycleId: observable.ref,
      // moduleId: observable.ref,
      // viewId: observable.ref,
      // userId: observable.ref,
      // globalViewId: observable.ref,
      // stateMap: observable,
      stateDetails: observable,
      // workspaceStateDetails: observable,
      // labelMap: observable,
      // memberMap: observable,
      // workSpaceMemberRolesMap: observable,
      projectMap: observable,
      // moduleMap: observable,
      // cycleMap: observable,
    });

    this.rootStore = rootStore;
    autorun(() => {
      if (rootStore?.user?.data?.id) this.currentUserId = rootStore?.user?.data?.id;
      if (rootStore.router.workspaceSlug) this.workspaceSlug = rootStore.router.workspaceSlug;
      if (rootStore.router.projectId) this.projectId = rootStore.router.projectId;
      if (rootStore.router.cycleId) this.cycleId = rootStore.router.cycleId;
      if (rootStore.router.moduleId) this.moduleId = rootStore.router.moduleId;
      if (rootStore.router.viewId) this.viewId = rootStore.router.viewId;
      if (rootStore.router.globalViewId) this.globalViewId = rootStore.router.globalViewId;
      if (rootStore.router.userId) this.userId = rootStore.router.userId;
      // if (!isEmpty(rootStore?.state?.stateMap)) this.stateMap = rootStore?.state?.stateMap;
      // if (!isEmpty(rootStore?.state?.projectStates)) this.stateDetails = rootStore?.state?.projectStates;
      // if (!isEmpty(rootStore?.state?.workspaceStates)) this.workspaceStateDetails = rootStore?.state?.workspaceStates;
      // if (!isEmpty(rootStore?.label?.labelMap)) this.labelMap = rootStore?.label?.labelMap;
      // if (!isEmpty(rootStore?.memberRoot?.workspace?.workspaceMemberMap))
      //   this.workSpaceMemberRolesMap = rootStore?.memberRoot?.workspace?.memberMap || undefined;
      // if (!isEmpty(rootStore?.memberRoot?.memberMap)) this.memberMap = rootStore?.memberRoot?.memberMap || undefined;
      // if (!isEmpty(rootStore?.projectRoot?.project?.projectMap))
      //   this.projectMap = rootStore?.projectRoot?.project?.projectMap;
      // if (!isEmpty(rootStore?.module?.moduleMap)) this.moduleMap = rootStore?.module?.moduleMap;
      // if (!isEmpty(rootStore?.cycle?.cycleMap)) this.cycleMap = rootStore?.cycle?.cycleMap;
    });

    this.issues = new IssueStore();

    this.projectIssuesFilter = new ProjectIssuesFilter(this);
    this.projectIssues = new ProjectIssue(this, this.projectIssuesFilter);
  }
}
