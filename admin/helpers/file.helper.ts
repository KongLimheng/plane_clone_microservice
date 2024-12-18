// helpers
import { TFileMetaDataLite } from "@plane/types";
import { API_BASE_URL } from "@/helpers/common.helper";

/**
 * @description combine the file path with the base URL
 * @param {string} path
 * @returns {string} final URL with the base URL
 */
export const getFileURL = (path: string): string | undefined => {
  if (!path) return undefined;
  const isValidURL = path.startsWith("http");
  if (isValidURL) return path;
  return `${API_BASE_URL}${path}`;
};

/**
 * @description returns the necessary file meta data to upload a file
 * @param {File} file
 * @returns {TFileMetaDataLite} payload with file info
 */
export const getFileMetaDataForUpload = (file: File): TFileMetaDataLite => ({
  name: file.name,
  size: file.size,
  type: file.type,
});
