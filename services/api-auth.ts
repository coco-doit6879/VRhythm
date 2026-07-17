import { request } from "./api-client";
import { storage } from "./api-storage";
import {
  ApiResponse,
  AuthResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
  UserProfileDto,
} from "./api-types";

export const authApi = {
  setToken: (token: string) => {
    storage.setItem("authToken", token);
  },
  getToken: () => {
    return storage.getItem("authToken");
  },
  logout: () => {
    storage.removeItem("authToken");
    storage.removeItem("currentCourseId");
  },
  login: async (dto: LoginRequestDto): Promise<ApiResponse<AuthResponseDto>> => {
    const response = await request<AuthResponseDto>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    if (response.success && response.data?.token) {
      authApi.setToken(response.data.token);
    }
    return response;
  },
  register: async (
    dto: RegisterRequestDto,
  ): Promise<ApiResponse<AuthResponseDto>> => {
    const response = await request<AuthResponseDto>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    if (response.success && response.data?.token) {
      authApi.setToken(response.data.token);
    }
    return response;
  },
  getProfile: async (): Promise<ApiResponse<UserProfileDto>> => {
    return request<UserProfileDto>("/api/user/profile", {
      method: "GET",
    });
  },
};
