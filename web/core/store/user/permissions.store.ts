import { set } from "lodash";
import { action, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import { IProjectMember, IUserProjectsRole, IWorkspaceMemberMe } from "@plane/types";
import {
  EUserPermissions,
  EUserPermissionsLevel,
  TUserPermissions,
  TUserPermissionsLevel,
} from "@/plane-web/constants/user-permissions";
import { WorkspaceService } from "@/plane-web/services";
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
  // projectPermissionsByWorkspaceSlugAndProjectId: (
  //   workspaceSlug: string,
  //   projectId: string
  // ) => TUserPermissions | undefined;
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
  // leaveWorkspace: (workspaceSlug: string) => Promise<void>;
  // fetchUserProjectInfo: (workspaceSlug: string, projectId: string) => Promise<IProjectMember | undefined>;
  // fetchUserProjectPermissions: (workspaceSlug: string) => Promise<IUserProjectsRole | undefined>;
  // joinProject: (workspaceSlug: string, projectId: string) => Promise<void | undefined>;
  // leaveProject: (workspaceSlug: string, projectId: string) => Promise<void>;
}

// derived services
const workspaceService = new WorkspaceService();

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
      fetchUserWorkspaceInfo: action,
      // leaveWorkspace: action,
      // fetchUserProjectInfo: action,
      // fetchUserProjectPermissions: action,
      // joinProject: action,
      // leaveProject: action,
    });
  }
  allowPermissions = (
    allowPermissions: TUserPermissions[],
    level: TUserPermissionsLevel,
    workspaceSlug?: string,
    projectId?: string,
    onPermissionAllowed?: () => boolean
  ) => {
    const { workspaceSlug: currentWorkspaceSlug, projectId: currentProjectId } = this.store.router;
    if (!workspaceSlug) workspaceSlug = currentWorkspaceSlug;
    if (!projectId) projectId = currentProjectId;

    let currentUserRole: TUserPermissions | undefined = undefined;
    if (level === EUserPermissionsLevel.WORKSPACE) {
      const workspaceInfoBySlug = workspaceSlug && this.workspaceInfoBySlug(workspaceSlug);
      if (workspaceInfoBySlug) {
        currentUserRole = workspaceInfoBySlug.role;
      }
    }

    if (level === EUserPermissionsLevel.PROJECT) {
      currentUserRole = (workspaceSlug &&
        projectId &&
        this.projectPermissionsByWorkspaceSlugAndProjectId(workspaceSlug, projectId)) as EUserPermissions | undefined;
    }

    if (currentUserRole && allowPermissions.includes(currentUserRole)) {
      if (onPermissionAllowed) return onPermissionAllowed();
      return true;
    }

    return false;
  };

  projectPermissionsByWorkspaceSlugAndProjectId = computedFn(
    (workspaceSlug: string, projectId: string): TUserPermissions | undefined => {
      if (!workspaceSlug || !projectId) return undefined;
      return this.workspaceProjectsPermissions?.[workspaceSlug]?.[projectId] || undefined;
    }
  );

  workspaceInfoBySlug = computedFn((workspaceSlug: string): IWorkspaceMemberMe | undefined => {
    if (!workspaceSlug) return undefined;
    return this.workspaceUserInfo[workspaceSlug] || undefined;
  });

  fetchUserWorkspaceInfo = async (workspaceSlug: string): Promise<IWorkspaceMemberMe | undefined> => {
    try {
      this.loader = true;
      const res = await workspaceService.workspaceMemberMe(workspaceSlug);
      if (res) {
        runInAction(() => {
          set(this.workspaceUserInfo, [workspaceSlug], res);
          this.loader = false;
        });
      }

      return res;
    } catch (error) {
      console.error("Error fetching user workspace information", error);

      this.loader = false;
      throw error;
    }
  };
}
