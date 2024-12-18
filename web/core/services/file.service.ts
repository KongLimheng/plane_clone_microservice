import { TFileEntityInfo, TFileSignedURLResponse } from "@plane/types";
import { API_BASE_URL } from "@/helpers/common.helper";
import { generateFileUploadPayload, getAssetIdFromUrl, getFileMetaDataForUpload } from "@/helpers/file.helper";
import { APIService } from "./api.service";
import { FileUploadService } from "./file-upload.service";

export interface UnSplashImage {
  id: string;
  created_at: Date;
  updated_at: Date;
  promoted_at: Date;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  description: null;
  alt_description: string;
  urls: UnSplashImageUrls;
  [key: string]: any;
}

export interface UnSplashImageUrls {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
  small_s3: string;
}

export enum TFileAssetType {
  COMMENT_DESCRIPTION = "COMMENT_DESCRIPTION",
  ISSUE_ATTACHMENT = "ISSUE_ATTACHMENT",
  ISSUE_DESCRIPTION = "ISSUE_DESCRIPTION",
  PAGE_DESCRIPTION = "PAGE_DESCRIPTION",
  PROJECT_COVER = "PROJECT_COVER",
  USER_AVATAR = "USER_AVATAR",
  USER_COVER = "USER_COVER",
  WORKSPACE_LOGO = "WORKSPACE_LOGO",
}

export class FileService extends APIService {
  private cancelSource: any;
  private fileUploadService: FileUploadService;

  constructor() {
    super(API_BASE_URL);
    this.cancelUpload = this.cancelUpload.bind(this);
    // upload service
    this.fileUploadService = new FileUploadService();
  }

  cancelUpload() {
    this.cancelSource.cancel("Upload canceled");
  }

  async getUnsplashImages(query?: string): Promise<UnSplashImage[]> {
    return this.get(`/api/unsplash/`, {
      params: {
        query,
      },
    })
      .then((res) => res?.data?.results ?? res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async getProjectCoverImages(): Promise<string[]> {
    return this.get(`/api/project-covers/`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  private async updateUserAssetUploadStatus(assetId: string): Promise<void> {
    return this.patch(`/api/assets/v2/user-assets/${assetId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async uploadUserAsset(data: TFileEntityInfo, file: File): Promise<TFileSignedURLResponse> {
    const fileMetaData = getFileMetaDataForUpload(file);

    return this.post(`/api/assets/v2/user-assets/`, {
      ...data,
      ...fileMetaData,
    })
      .then(async (response) => {
        const signedURLResponse: TFileSignedURLResponse = response?.data;
        const fileUploadPayload = generateFileUploadPayload(signedURLResponse, file);
        await this.fileUploadService.uploadFile(signedURLResponse.upload_data.url, fileUploadPayload);
        await this.updateUserAssetUploadStatus(signedURLResponse.asset_id);
        return signedURLResponse;
      })
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  private async updateWorkspaceAssetUploadStatus(workspaceSlug: string, assetId: string): Promise<void> {
    return this.patch(`/api/assets/v2/workspaces/${workspaceSlug}/${assetId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteOldWorkspaceAsset(workspaceId: string, src: string): Promise<any> {
    const assetKey = getAssetIdFromUrl(src);
    return this.delete(`/api/workspaces/file-assets/${workspaceId}/${assetKey}/`)
      .then((response) => response?.status)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async uploadWorkspaceAsset(
    workspaceSlug: string,
    data: TFileEntityInfo,
    file: File
  ): Promise<TFileSignedURLResponse> {
    const fileMetaData = getFileMetaDataForUpload(file);
    return this.post(`/api/assets/v2/workspaces/${workspaceSlug}/`, {
      ...data,
      ...fileMetaData,
    })
      .then(async (response) => {
        const signedURLResponse: TFileSignedURLResponse = response?.data;

        console.log(signedURLResponse);
        const fileUploadPayload = generateFileUploadPayload(signedURLResponse, file);
        await this.fileUploadService.uploadFile(signedURLResponse.upload_data.url, fileUploadPayload);
        await this.updateWorkspaceAssetUploadStatus(workspaceSlug.toString(), signedURLResponse.asset_id);
        return signedURLResponse;
      })
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
