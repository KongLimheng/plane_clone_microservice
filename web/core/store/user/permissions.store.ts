import { action, makeObservable, observable } from "mobx";
import { computedFn } from "mobx-utils";
import { IProjectMember, IUserProjectsRole, IWorkspaceMemberMe } from "@plane/types";
import { TUserPermissions, TUserPermissionsLevel } from "@/plane-web/constants/user-permissions";
import { CoreRootStore } from "../root.store";

export interface IUserPermissionStore {
  loader: boolean;
  // observables
  workspaceUserInfo: Record<string, IWorkspaceMemberMe>; // workspaceSlug -> IWorkspaceMemberMe
  projectUserInfo: Record<string, Record<string, IProjectMember>>; // workspaceSlug -> projectId -> IProjectMember
  workspaceProjectsPermissions: Record<string, IUserProjectsRole>; // workspaceSlug -> IUserProjectsRole
  // computed
  // computed helpers
  workspaceInfoBySlug: (workspaceSlug: string) => IWorkspaceMemberMe | undefined;
  projectPermissionsByWorkspaceSlugAndProjectId: (
    workspaceSlug: string,
    projectId: string
  ) => TUserPermissions | undefined;
  allowPermissions: (
    allowPermissions: TUserPermissions[],
    level: TUserPermissionsLevel,
    workspaceSlug?: string,
    projectId?: string,
    onPermissionAllowed?: () => boolean
  ) => boolean;
  // action helpers
  // actions
  fetchUserWorkspaceInfo: (workspaceSlug: string) => Promise<IWorkspaceMemberMe | undefined>;
  leaveWorkspace: (workspaceSlug: string) => Promise<void>;
  fetchUserProjectInfo: (workspaceSlug: string, projectId: string) => Promise<IProjectMember | undefined>;
  fetchUserProjectPermissions: (workspaceSlug: string) => Promise<IUserProjectsRole | undefined>;
  joinProject: (workspaceSlug: string, projectId: string) => Promise<void | undefined>;
  leaveProject: (workspaceSlug: string, projectId: string) => Promise<void>;
}

export class UserPermissionStore implements IUserPermissionStore {
  loader: boolean = false;
  // constants
  workspaceUserInfo: Record<string, IWorkspaceMemberMe> = {};
  projectUserInfo: Record<string, Record<string, IProjectMember>> = {};
  workspaceProjectsPermissions: Record<string, IUserProjectsRole> = {};
  // observables

  constructor(private store: CoreRootStore) {
    makeObservable(this, {
      // observables
      loader: observable.ref,
      workspaceUserInfo: observable,
      projectUserInfo: observable,
      workspaceProjectsPermissions: observable,
      // computed
      // actions
      // fetchUserWorkspaceInfo: action,
      // leaveWorkspace: action,
      // fetchUserProjectInfo: action,
      // fetchUserProjectPermissions: action,
      // joinProject: action,
      // leaveProject: action,
    });
  }

  workspaceInfoBySlug = computedFn((workspaceSlug: string): IWorkspaceMemberMe | undefined => {
    if (!workspaceSlug) return undefined;
    return this.workspaceUserInfo[workspaceSlug] || undefined;
  });

  // fetchUserWorkspaceInfo = (workspaceSlug: string) => {
  //   try {
  //     this.loader = true;
  //   } catch (error) {}
  // };
}
