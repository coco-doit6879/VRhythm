import { ApiResponse } from './api-types';
import { storage } from './api-storage';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? '' : 'http://vrythm.quanglikecookie.io.vn');
export const REQUEST_TIMEOUT_MS = 15000;

export class ApiRequestError extends Error {
  constructor(message: string, public status?: number) { super(message); this.name = 'ApiRequestError'; }
}

function statusMessage(status: number): string {
  switch (status) {
    case 400: case 422: return 'Thông tin gửi lên chưa hợp lệ. Kiểm tra lại thông tin rồi thử lại.';
    case 401: return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.';
    case 403: return 'Bạn chưa có quyền truy cập nội dung này. Kiểm tra tài khoản hoặc đăng ký khóa học.';
    case 404: return 'Không tìm thấy nội dung. Hãy quay lại danh sách để chọn lại.';
    case 409: return 'Dữ liệu đã thay đổi hoặc thông tin đã được sử dụng. Hãy kiểm tra và thử lại.';
    case 429: return 'Bạn thao tác quá nhanh. Vui lòng chờ một lát rồi thử lại.';
    default: return 'Máy chủ chưa xử lý được yêu cầu. Vui lòng thử lại sau.';
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  if (!BASE_URL) throw new ApiRequestError('Chưa cấu hình máy chủ API. Hãy chạy npm run start:local hoặc đặt EXPO_PUBLIC_API_URL.');
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, REQUEST_TIMEOUT_MS);
  const cancel = () => controller.abort();
  options.signal?.addEventListener('abort', cancel);
  if (options.signal?.aborted) cancel();
  try {
    let token: string | null;
    try { token = storage.getItem('authToken'); }
    catch { throw new ApiRequestError('Chưa đọc được phiên đăng nhập trên thiết bị. Hãy mở khóa thiết bị và thử lại.'); }
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers, signal: controller.signal });
    if (!response.ok) throw new ApiRequestError(statusMessage(response.status), response.status);
    let body: unknown;
    try { body = JSON.parse(await response.text()); }
    catch { if (controller.signal.aborted) throw new Error('aborted'); throw new ApiRequestError('Phản hồi từ máy chủ không hợp lệ. Vui lòng thử lại.'); }
    if (!body || typeof body !== 'object' || typeof (body as ApiResponse<T>).success !== 'boolean') {
      throw new ApiRequestError('Phản hồi từ máy chủ không hợp lệ. Vui lòng thử lại.');
    }
    const result = body as ApiResponse<T>;
    if (!result.success) throw new ApiRequestError('Yêu cầu chưa được xác nhận. Kiểm tra thông tin và thử lại.');
    return result;
  } catch (error) {
    if (timedOut) throw new ApiRequestError('Máy chủ phản hồi quá lâu. Kiểm tra kết nối rồi thử lại.');
    if (options.signal?.aborted) throw new ApiRequestError('Yêu cầu đã được hủy.');
    if (error instanceof ApiRequestError) throw error;
    throw new ApiRequestError('Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.');
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', cancel);
  }
}
