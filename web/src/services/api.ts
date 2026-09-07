const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5205';

export type CourseSummary = {
  id: number;
  title: string;
  instrument: string;
  description: string;
  accessType: string;
  thumbnailUrl?: string;
};

export type AuthResponse = {
  token: string;
  refreshToken?: string;
  profile: {
    userId: number;
    fullName: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  fullName: string;
};

const storageKey = 'vrhythm_web_auth';

export const authStorage = {
  read(): AuthResponse | null {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  },
  write(value: AuthResponse) {
    localStorage.setItem(storageKey, JSON.stringify(value));
  },
  clear() {
    localStorage.removeItem(storageKey);
  },
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = authStorage.read();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message ?? 'Request failed');
  }

  return (data?.data ?? data) as T;
}

export const api = {
  getCourses() {
    return request<CourseSummary[]>('/api/courses');
  },
  login(payload: LoginPayload) {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  register(payload: RegisterPayload) {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
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
