import { ApiResponse } from "./api-types";
import { storage } from "./api-storage";

export const BASE_URL = "http://vrythm.quanglikecookie.io.vn";
// export const BASE_URL = "http://localhost:5205"; 


export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const token = storage.getItem("authToken");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const text = await response.text();

    let json: any = {};
    if (text) {
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error("Không thể phân tích phản hồi từ máy chủ.");
      }
    }

    if (!response.ok) {
      const errMsg = json?.message || `Lỗi từ máy chủ: ${response.status}`;
      throw new Error(errMsg);
    }

    return json as ApiResponse<T>;
  } catch (error: any) {
    console.warn(`API Error [${endpoint}]:`, error.message || error);
    throw error;
  }
}
