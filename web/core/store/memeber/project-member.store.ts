import { set, sortBy } from "lodash";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import { IProjectBulkAddFormData, IProjectMember, IProjectMembership, IUserLite } from "@plane/types";
import { EUserPermissions } from "@/plane-web/constants/user-permissions";
import { ProjectMemberService } from "@/services/project";
import { IProjectStore } from "../project/project.store";
import { CoreRootStore } from "../root.store";
import { IRouterStore } from "../router.store";
import { IUserStore } from "../user";
import { IMemberRootStore } from ".";

export interface IProjectMemberDetails {
  id: string;
  member: IUserLite;
  role: EUserPermissions;
}
export interface IProjectMemberStore {
  // observables
  projectMemberMap: {
    [projectId: string]: Record<string, IProjectMembership>;
  };
  // computed
  projectMemberIds: string[] | null;
  // computed actions
  // getProjectMemberDetails: (userId: string) => IProjectMemberDetails | null;
  getProjectMemberIds: (projectId: string) => string[] | null;
  // fetch actions
  fetchProjectMembers: (workspaceSlug: string, projectId: string) => Promise<IProjectMembership[]>;
  // // bulk operation actions
  // bulkAddMembersToProject: (
  //   workspaceSlug: string,
  //   projectId: string,
  //   data: IProjectBulkAddFormData
  // ) => Promise<IProjectMembership[]>;
  // // crud actions
  // updateMember: (
  //   workspaceSlug: string,
  //   projectId: string,
  //   userId: string,
  //   data: { role: EUserPermissions }
  // ) => Promise<IProjectMember>;
  // removeMemberFromProject: (workspaceSlug: string, projectId: string, userId: string) => Promise<void>;
}

export class ProjectMemberStore implements IProjectMemberStore {
  // observables
  projectMemberMap: {
    [projectId: string]: Record<string, IProjectMembership>;
  } = {};

  // stores
  routerStore: IRouterStore;
  userStore: IUserStore;
  memberRoot: IMemberRootStore;
  // projectRoot: IProjectStore;

  // services
  projectMemberService;

  constructor(_memberRoot: IMemberRootStore, _rootStore: CoreRootStore) {
    makeObservable(this, {
      // observables
      projectMemberMap: observable,
      // computed
      projectMemberIds: computed,
      // actions
      fetchProjectMembers: action,
      // bulkAddMembersToProject: action,
      // updateMember: action,
      // removeMemberFromProject: action,
    });

    // root store
    this.routerStore = _rootStore.router;
    this.userStore = _rootStore.user;
    this.memberRoot = _memberRoot;
    // this.projectRoot = _rootStore.projectRoot.project;
    // services
    this.projectMemberService = new ProjectMemberService();
  }

  getProjectMemberIds = computedFn((projectId: string): string[] | null => {
    if (!this.projectMemberMap?.[projectId]) return null;
    let members = Object.values(this.projectMemberMap?.[projectId]);

    members = sortBy(members, [
      (m) => m.member !== this.userStore.data?.id,
      (m) => this.memberRoot?.memberMap?.[m.member]?.display_name?.toLowerCase(),
    ]);

    const memberIds = members.map((m) => m.member);
    return memberIds;
  });

  get projectMemberIds() {
    const projectId = this.routerStore.projectId;
    if (!projectId) return null;
    let members = Object.values(this.projectMemberMap?.[projectId] ?? {});
    members = sortBy(members, [
      (m) => m.member !== this.userStore.data?.id,
      (m) => this.memberRoot.memberMap?.[m.member]?.display_name.toLowerCase(),
    ]);
    const memberIds = members.map((m) => m.member);
    return memberIds;
  }

  fetchProjectMembers = async (workspaceSlug: string, projectId: string) =>
    await this.projectMemberService.fetchProjectMembers(workspaceSlug, projectId).then((res) => {
      runInAction(() => {
        res.forEach((member) => {
          set(this.projectMemberMap, [projectId, member.member], member);
        });
      });

      return res;
    });
}
