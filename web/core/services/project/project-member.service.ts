import { IProjectMember, IProjectMembership } from "@plane/types";
import { API_BASE_URL } from "@/helpers/common.helper";
import { APIService } from "../api.service";

export class ProjectMemberService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async fetchProjectMembers(workspaceSlug: string, projectId: string): Promise<IProjectMembership[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/members/`)
      .then((res) => res.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async projectMemberMe(workspaceSlug: string, projectId: string): Promise<IProjectMember> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/project-members/me/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }
}

const projectMemberService = new ProjectMemberService();
export default projectMemberService;
