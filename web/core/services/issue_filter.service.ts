import { IIssueFiltersResponse } from "@plane/types";
import { API_BASE_URL } from "@/helpers/common.helper";
import { APIService } from "./api.service";

export class IssueFiltersService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  // project issue filters
  async fetchProjectIssueFilters(workspaceSlug: string, projectId: string): Promise<IIssueFiltersResponse> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/user-properties/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
