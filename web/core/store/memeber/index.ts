import { makeObservable, observable } from "mobx";
import { computedFn } from "mobx-utils";
import { IUser, IUserLite } from "@plane/types";
import { CoreRootStore } from "../root.store";
import { IProjectMemberStore, ProjectMemberStore } from "./project-member.store";
import { IWorkspaceMemberStore, WorkspaceMemberStore } from "./workspace-member.store";

export interface IMemberRootStore {
  // observables
  memberMap: Record<string, IUserLite>;
  // computed actions
  getUserDetails: (userId: string) => IUserLite | undefined;
  // sub-stores
  workspace: IWorkspaceMemberStore;
  project: IProjectMemberStore;
}

export class MemberRootStore implements IMemberRootStore {
  // observables
  memberMap: Record<string, IUserLite> = {};

  // sub-stores
  workspace: IWorkspaceMemberStore;
  project: IProjectMemberStore;

  constructor(_rootStore: CoreRootStore) {
    makeObservable(this, {
      // observables
      memberMap: observable,
    });

    this.project = new ProjectMemberStore(this, _rootStore);
    this.workspace = new WorkspaceMemberStore(this, _rootStore);
  }

  getUserDetails = computedFn((userId: string): IUserLite | undefined => this.memberMap?.[userId] ?? undefined);
}
