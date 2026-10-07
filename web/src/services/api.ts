const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://vrhythm-api-latest.onrender.com').replace(/\/+$/, '');

export type CourseSummary = {
  id: number;
  title: string;
  instrument: string;
  description: string;
  accessType: string;
  thumbnailUrl?: string;
};

export type LearnerCourseSummary = CourseSummary & {
  status: string;
  isEnrolled: boolean;
  isUnlocked: boolean;
  isCompleted: boolean;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  nextChapterId?: number;
  nextLessonId?: number;
};

export type CourseDetail = CourseSummary & {
  isEnrolled: boolean;
  isUnlocked: boolean;
  isCompleted: boolean;
  chapters: Array<{ id: number; title: string; sortOrder: number; lessons: Array<{ id: number; title: string; type: string; sortOrder: number; durationSeconds?: number; isCompleted: boolean }> }>;
};

export type AuthResponse = {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  token: string;
  expiresAt?: string;
  authProvider?: string;
  avatarUrl?: string;
};

export type UserProfile = Pick<AuthResponse, 'userId' | 'fullName' | 'email' | 'role' | 'avatarUrl'>;

export type LessonDetail = { id: number; title: string; type: string; content?: string; durationSeconds?: number; theory?: { content?: string }; video?: { content?: string; durationSeconds?: number } };
export type QuizDetail = { title: string; passPercentage: number; questions: Array<{ id: number; prompt: string; options: Array<{ id: number; text: string }> }> };
export type PracticalDetail = { title: string; sheetMusicJson?: string; expectedNotes: Array<{ sortOrder: number; note: string }> };

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  confirmPassword: string;
  fullName: string;
};

const storageKey = 'vrhythm_web_auth';

function normalizeAuth(value: AuthResponse | (Partial<AuthResponse> & { profile?: UserProfile })): AuthResponse | null {
  if (!value || typeof value !== 'object') return null;
  const profile = 'profile' in value ? value.profile : undefined;
  const token = value.token;
  const userId = value.userId ?? profile?.userId;
  const fullName = value.fullName ?? profile?.fullName;
  const email = value.email ?? profile?.email;
  const role = value.role ?? profile?.role;
  if (!token || userId == null || !fullName || !email || !role) return null;
  return { ...value, userId, fullName, email, role, avatarUrl: value.avatarUrl ?? profile?.avatarUrl } as AuthResponse;
}

export const authStorage = {
  read(): AuthResponse | null {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    try {
      return normalizeAuth(JSON.parse(raw));
    } catch {
      localStorage.removeItem(storageKey);
      return null;
    }
  },
  write(value: AuthResponse) {
    const normalized = normalizeAuth(value);
    if (normalized) localStorage.setItem(storageKey, JSON.stringify(normalized));
  },
  clear() {
    localStorage.removeItem(storageKey);
  },
};

class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function courseErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Vui lòng đăng nhập lại để tiếp tục.';
    if (error.status === 403) return 'Bạn chưa có quyền truy cập nội dung này.';
    if (error.status === 404) return 'Khóa học không còn khả dụng. Vui lòng chọn khóa học khác.';
    if (error.status === 429) return 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi một lát rồi thử lại.';
    if (error.status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
    return 'Yêu cầu chưa thực hiện được. Vui lòng kiểm tra và thử lại.';
  }
  if (error instanceof Error && error.name === 'TimeoutError') return 'Tải khóa học quá lâu. Vui lòng kiểm tra kết nối và thử lại.';
  return 'Không thể kết nối để tải khóa học. Vui lòng kiểm tra mạng và thử lại.';
}

function responseMessage(data: any): string {
  if (data?.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors).flat().filter((item): item is string => typeof item === 'string');
    if (messages.length) return messages.join(' ');
  }
  return typeof data?.message === 'string' && data.message ? data.message : 'Yêu cầu chưa thực hiện được. Vui lòng kiểm tra thông tin và thử lại.';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = path.startsWith('/api/auth/') ? null : authStorage.read();
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  init?.signal?.addEventListener('abort', cancel, { once: true });
  if (init?.signal?.aborted) cancel();
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 20000);
  try {
    const res = await fetch(BASE_URL + path, {
      ...init, signal: controller.signal,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(auth?.token ? { Authorization: 'Bearer ' + auth.token } : {}),
        ...(init?.headers ?? {}),
      },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.success === false) throw new ApiError(res.status, responseMessage(data));
    if (res.status === 204) return undefined as T;
    if (data === null) throw new Error('Phản hồi máy chủ không hợp lệ. Vui lòng thử lại.');
    return (typeof data === 'object' && 'data' in data ? data.data : data) as T;
  } catch (error) {
    if (timedOut) throw new Error('Máy chủ phản hồi quá lâu. Vui lòng thử lại sau.');
    if (error instanceof TypeError) throw new Error('Không kết nối được máy chủ. Vui lòng kiểm tra mạng và địa chỉ API.');
    throw error;
  } finally {
    clearTimeout(timeout);
    init?.signal?.removeEventListener('abort', cancel);
  }
}

async function authenticate(path: string, payload: LoginPayload | RegisterPayload): Promise<AuthResponse> {
  const response = await request<AuthResponse>(path, { method: 'POST', body: JSON.stringify(payload) });
  const auth = normalizeAuth(response);
  if (!auth) throw new Error('Máy chủ chưa cấp phiên đăng nhập hợp lệ. Vui lòng thử đăng nhập lại.');
  return auth;
}

// Course reads are safe to cancel; never automatically retry enrollment writes.
async function readCourse<T>(path: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 20000);
  try { return await request<T>(path, { signal: controller.signal }); }
  catch (error) {
    if (timedOut) throw new DOMException('Course request timed out', 'TimeoutError');
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}

export const api = {
  async getLesson(id: number, signal?: AbortSignal) {
    const data = await readCourse<LessonDetail>(`/api/lessons/${id}`, signal);
    return { ...data, theory: data.theory ?? (data.type === 'Theory' ? { content: data.content } : undefined), video: data.video ?? (data.type === 'Video' ? { content: data.content, durationSeconds: data.durationSeconds } : undefined) };
  },
  getQuiz(id: number, signal?: AbortSignal) { return readCourse<QuizDetail>(`/api/quizzes/${id}`, signal); },
  async getPractical(id: number, signal?: AbortSignal) { const data = await readCourse<PracticalDetail & { notes?: PracticalDetail["expectedNotes"] }>(`/api/practical/${id}`, signal); return { ...data, expectedNotes: data.expectedNotes ?? data.notes ?? [] }; },
  getVideoUrl(courseId: number, lessonId: number, signal?: AbortSignal) { return readCourse<string>(`/api/lessons/${lessonId}/video-url?courseId=${courseId}`, signal); },
  getCourse(id: number, signal?: AbortSignal) {
    return readCourse<CourseDetail>(`/api/courses/${id}`, signal);
  },
  getCourses(signal?: AbortSignal) {
    return readCourse<CourseSummary[]>('/api/courses', signal);
  },
  getLearnerCourses() {
    return readCourse<LearnerCourseSummary[]>('/api/courses/learning');
  },
  getProfile() {
    return request<UserProfile>('/api/user/profile');
  },
  enroll(courseId: number, accessType: string) {
    const action = accessType.toLocaleLowerCase() === 'free' ? 'enroll' : 'unlock';
    return request<object>(`/api/courses/${courseId}/${action}`, { method: 'POST' });
  },
  login(payload: LoginPayload) {
    return authenticate('/api/auth/login', { email: payload.email.trim(), password: payload.password });
  },
  register(payload: RegisterPayload) {
    return authenticate('/api/auth/register', { ...payload, fullName: payload.fullName.trim(), email: payload.email.trim() });
  },
  completeTheory(lessonId: number) {
    return request<object>(`/api/theory/${lessonId}/complete`, { method: 'POST' });
  },
  updateLessonProgress(courseId: number, lessonId: number, watchedSeconds: number, totalSeconds: number) {
    return request<object>(`/api/lessons/${lessonId}/progress?courseId=${courseId}`, {
      method: 'POST',
      body: JSON.stringify({ watchedSeconds, totalSeconds }),
    });
  },
  completeExternalVideo(courseId: number, lessonId: number) {
    return request<object>(`/api/lessons/${lessonId}/external-video/complete?courseId=${courseId}`, { method: 'POST' });
  },
  submitQuiz(lessonId: number, answers: Array<{ questionId: number; selectedOptionId: number }>) {
    return request<{ passed: boolean; scorePercentage: number }>(`/api/quizzes/${lessonId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
  submitPractical(lessonId: number, notes: string[]) {
    return request<{ passed: boolean; scorePercentage: number }>(`/api/practical/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },
  recalculateCourseCompletion(courseId: number) {
    return request<boolean>(`/api/courses/${courseId}/completion/recalculate`, { method: 'POST' });
  },
};
