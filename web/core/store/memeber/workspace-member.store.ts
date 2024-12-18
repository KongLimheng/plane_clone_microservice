import { set, sortBy } from "lodash";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import { IWorkspaceMember, IWorkspaceMemberInvitation } from "@plane/types";
import { EUserPermissions } from "@/plane-web/constants/user-permissions";
import { WorkspaceService } from "@/plane-web/services/workspace.service";
import { CoreRootStore } from "../root.store";
import { IRouterStore } from "../router.store";
import { IUserStore } from "../user";
import { IMemberRootStore } from ".";

export interface IWorkspaceMembership {
  id: string;
  member: string;
  role: EUserPermissions;
}

export interface IWorkspaceMemberStore {
  // observables
  workspaceMemberMap: Record<string, Record<string, IWorkspaceMembership>>;

  // workspaceMemberInvitations: Record<string, IWorkspaceMemberInvitation[]>;
  // computed
  workspaceMemberIds: string[] | null;
  workspaceMemberInvitationIds: string[] | null;
  memberMap: Record<string, IWorkspaceMembership> | null;
  getWorkspaceMemberDetails: (workspaceMemberId: string) => IWorkspaceMember | null;

  // fetch actions
  fetchWorkspaceMembers: (workspaceSlug: string) => Promise<IWorkspaceMember[]>;
}

export class WorkspaceMemberStore implements IWorkspaceMemberStore {
  // observables
  workspaceMemberMap: {
    [workspaceSlug: string]: Record<string, IWorkspaceMembership>;
  } = {}; // { workspaceSlug: { userId: userDetails } }
  workspaceMemberInvitations: Record<string, IWorkspaceMemberInvitation[]> = {}; // { workspaceSlug: [invitations] }
  // stores
  routerStore: IRouterStore;
  userStore: IUserStore;
  memberRoot: IMemberRootStore;

  // services
  workspaceService;

  constructor(_memberRoot: IMemberRootStore, _rootStore: CoreRootStore) {
    makeObservable(this, {
      // observables
      workspaceMemberMap: observable,
      workspaceMemberInvitations: observable,

      // computed
      workspaceMemberIds: computed,
      memberMap: computed,

      // fetch actions
      fetchWorkspaceMembers: action,
    });

    this.routerStore = _rootStore.router;
    this.userStore = _rootStore.user;
    this.memberRoot = _memberRoot;

    // services
    this.workspaceService = new WorkspaceService();
  }

  get workspaceMemberIds() {
    const workspaceSlug = this.routerStore.workspaceSlug;
    if (!workspaceSlug) return null;
    let members = Object.values(this.workspaceMemberMap?.[workspaceSlug] ?? {});
    members = sortBy(members, [
      (m) => m.member !== this.userStore?.data?.id,
      (m) => this.memberRoot?.memberMap?.[m.member]?.display_name?.toLowerCase(),
    ]);
    //filter out bots
    const memberIds = members.filter((m) => !this.memberRoot?.memberMap?.[m.member]?.is_bot).map((m) => m.member);
    return memberIds;
  }

  get workspaceMemberInvitationIds() {
    const workspaceSlug = this.routerStore.workspaceSlug;
    if (!workspaceSlug) return null;
    return this.workspaceMemberInvitations?.[workspaceSlug]?.map((inv) => inv.id);
  }

  get memberMap() {
    const workspaceSlug = this.routerStore.workspaceSlug;
    if (!workspaceSlug) return null;
    return this.workspaceMemberMap?.[workspaceSlug] ?? {};
  }

  fetchWorkspaceMembers = async (workspaceSlug: string) =>
    await this.workspaceService.fetchWorkspaceMembers(workspaceSlug).then((response) => {
      runInAction(() => {
        response.forEach((member) => {
          set(this.memberRoot?.memberMap, member.member.id, { ...member.member, joining_date: member.created_at });
          set(this.workspaceMemberMap, [workspaceSlug, member.member.id], {
            id: member.id,
            member: member.member.id,
            role: member.role,
          });
        });
      });
      return response;
    });

  /**
   * @description get the details of a workspace member
   * @param userId
   */
  getWorkspaceMemberDetails = computedFn((userId: string) => {
    const workspaceSlug = this.routerStore.workspaceSlug;
    if (!workspaceSlug) return null;
    const workspaceMember = this.workspaceMemberMap?.[workspaceSlug]?.[userId];
    if (!workspaceMember) return null;

    const memberDetails: IWorkspaceMember = {
      id: workspaceMember.id,
      role: workspaceMember.role,
      member: this.memberRoot?.memberMap?.[workspaceMember.member],
    };
    return memberDetails;
  });
}
