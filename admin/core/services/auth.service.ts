import { API_BASE_URL } from "@/helpers/common.helper";
import { APIService } from "./api.service";

type TCsrfTokenResponse = {
  csrf_token: string;
};

export class AuthService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async requestCSRFToken(): Promise<TCsrfTokenResponse> {
    return this.get<TCsrfTokenResponse>("/auth/get-csrf-token/")
      .then((response) => response.data)
      .catch((error) => {
        throw error;
      });
  }
}
