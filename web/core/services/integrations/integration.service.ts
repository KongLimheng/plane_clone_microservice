import { IExportServiceResponse } from "@plane/types";
import { API_BASE_URL } from "@/helpers/common.helper";
import { APIService } from "../api.service";

export class IntegrationService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async getExportsServicesList(
    workspaceSlug: string,
    cursor: string,
    per_page: number
  ): Promise<IExportServiceResponse> {
    return this.get(`/api/workspaces/${workspaceSlug}/export-issues`, {
      params: {
        per_page,
        cursor,
      },
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
