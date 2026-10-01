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
  logout: async () => {
    await storage.removeItem("authToken");
    await storage.removeItem("currentCourseId");
    await storage.removeItem("hasCompletedOnboarding");
    await storage.removeItem("onboardingInstrument");
    await storage.removeItem("onboardingTime");
  },
  login: async (dto: LoginRequestDto): Promise<ApiResponse<AuthResponseDto>> => {
    const response = await request<AuthResponseDto>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    if (!response.success || typeof response.data?.token !== 'string' || !response.data.token.trim()) {
      throw new Error('Máy chủ chưa cấp phiên đăng nhập. Vui lòng thử lại.');
    }
    try { authApi.setToken(response.data.token); }
    catch { throw new Error('Không lưu được phiên đăng nhập trên thiết bị. Hãy mở khóa thiết bị rồi thử lại.'); }
    return response;
  },
  register: async (
    dto: RegisterRequestDto,
  ): Promise<ApiResponse<AuthResponseDto>> => {
    const response = await request<AuthResponseDto>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    if (!response.success || typeof response.data?.token !== 'string' || !response.data.token.trim()) {
      throw new Error('Máy chủ chưa cấp phiên đăng nhập. Vui lòng thử lại.');
    }
    try { authApi.setToken(response.data.token); }
    catch { throw new Error('Không lưu được phiên đăng nhập trên thiết bị. Hãy mở khóa thiết bị rồi thử lại.'); }
    return response;
  },
  getProfile: async (): Promise<ApiResponse<UserProfileDto>> => {
    return request<UserProfileDto>("/api/user/profile", {
      method: "GET",
    });
  },
};
