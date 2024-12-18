import {
  IUserProjectsRole,
  IWorkspace,
  IWorkspaceMember,
  IWorkspaceMemberInvitation,
  IWorkspaceMemberMe,
  IWorkspaceSearchResults,
} from "@plane/types";
import { APIService } from "./api.service";

export class WorkspaceService extends APIService {
  constructor(baseUrl: string) {
    super(baseUrl);
  }

  async userWorkspaces(): Promise<IWorkspace[]> {
    return this.get("/api/users/me/workspaces/")
      .then((res) => res.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getWorkspaceInvitation(workspaceSlug: string, invitationId: string) {
    return this.get(`/api/workspaces/${workspaceSlug}/invitations/${invitationId}/join/`, { headers: {} })
      .then((res) => res.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async userWorkspaceInvitations(): Promise<IWorkspaceMemberInvitation[]> {
    return this.get("/api/users/me/workspaces/invitations/")
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createWorkspace(data: Partial<IWorkspace>): Promise<IWorkspace> {
    return this.post("/api/workspaces/", data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async workspaceSlugCheck(slug: string): Promise<any> {
    return this.get(`/api/workspace-slug-check/?slug=${slug}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async workspaceMemberMe(workspaceSlug: string): Promise<IWorkspaceMemberMe> {
    return this.get(`/api/workspaces/${workspaceSlug}/workspace-members/me/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async searchWorkspace(
    workspaceSlug: string,
    params: {
      project_id?: string;
      search: string;
      workspace_search: boolean;
    }
  ): Promise<IWorkspaceSearchResults> {
    return this.get(`/api/workspaces/${workspaceSlug}/search/`, {
      params,
    })
      .then((res) => res?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getWorkspaceUserProjectsRole(workspaceSlug: string): Promise<IUserProjectsRole> {
    return this.get(`/api/users/me/workspaces/${workspaceSlug}/project-roles/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async fetchWorkspaceMembers(workspaceSlug: string): Promise<IWorkspaceMember[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/members/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateWorkspace(workspaceSlug: string, data: Partial<IWorkspace>): Promise<IWorkspace> {
    return this.patch(`/api/workspaces/${workspaceSlug}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
