import { isEmpty } from "lodash";
import { TIssuesResponse } from "@plane/types";
import { API_BASE_URL } from "@/helpers/common.helper";
import { persistence } from "@/local-db/storage.sqlite";
import { APIService } from "../api.service";

export class IssueService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async getIssuesFromServer(
    workspaceSlug: string,
    projectId: string,
    queries?: any,
    config = {}
  ): Promise<TIssuesResponse> {
    const path =
      (queries.expand as string)?.includes("issue_relation") && !queries.group_by
        ? `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues-detail/`
        : `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/`;
    return this.get(
      path,
      {
        params: queries,
      },
      config
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getIssues(workspaceSlug: string, projectId: string, queries?: any, config = {}): Promise<TIssuesResponse> {
    if (!isEmpty(queries.expand as string) && !queries.group_by)
      return await this.getIssuesFromServer(workspaceSlug, projectId, queries, config);

    const response = await persistence.getIssues(workspaceSlug, projectId, queries, config);
    return response as TIssuesResponse;
  }
}
