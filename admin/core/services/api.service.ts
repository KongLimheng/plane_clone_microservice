import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export abstract class APIService {
  protected baseURL: string;
  private axiosInstance: AxiosInstance;
  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true,
    });

    // this.setupInterceptors();
  }

  get<ResponseType>(url: string, params = {}): Promise<AxiosResponse<ResponseType>> {
    return this.axiosInstance.get(url, { params });
  }

  post<RequestType, ResponseType>(url: string, data: RequestType, config = {}): Promise<AxiosResponse<ResponseType>> {
    return this.axiosInstance.post(url, data, config);
  }

  put<RequestType, ResponseType>(url: string, data: RequestType, config = {}): Promise<AxiosResponse<ResponseType>> {
    return this.axiosInstance.put(url, data, config);
  }

  patch<RequestType, ResponseType>(url: string, data: RequestType, config = {}): Promise<AxiosResponse<ResponseType>> {
    return this.axiosInstance.patch(url, data, config);
  }

  delete<RequestType>(url: string, data?: RequestType, config = {}) {
    return this.axiosInstance.delete(url, { data, ...config });
  }

  request<T>(config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.axiosInstance(config);
  }
}
