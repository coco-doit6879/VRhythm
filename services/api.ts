// Central API Service for VRhythm
// Connected to: http://vrythm.quanglikecookie.io.vn

const BASE_URL = 'http://vrythm.quanglikecookie.io.vn';

// Simple bridge storage for React Native (in-memory) & Web (localStorage)
let memoryStorage: Record<string, string> = {};

const storage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // safe fallback for native environments without localStorage
    }
    return memoryStorage[key] || null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // safe fallback
    }
    memoryStorage[key] = value;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      // safe fallback
    }
    delete memoryStorage[key];
  }
};

// API Types
export interface RegisterRequestDto {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  userId: number;
  fullName: string | null;
  email: string | null;
  role: string | null;
  token: string | null;
  expiresAt: string;
  authProvider: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  error: any | null;
}

export interface CourseSummaryDto {
  id: number;
  title: string;
  instrument: string;
  description: string;
  accessType: string;
  status: string;
  thumbnailUrl: string | null;
}

export interface LessonDto {
  id: number;
  sortOrder: number;
  title: string | null;
  type: string | null; // e.g. "Video", etc.
  content: string | null;
  durationSeconds: number | null;
  isCompleted: boolean;
}

export interface ChapterDto {
  id: number;
  sortOrder: number;
  title: string | null;
  lessons: LessonDto[] | null;
}

export interface QuizOptionDto {
  id: number;
  sortOrder: number;
  text: string | null;
}

export interface QuizQuestionDto {
  id: number;
  sortOrder: number;
  prompt: string | null;
  options: QuizOptionDto[] | null;
}

export interface QuizExamDto {
  id: number;
  title: string | null;
  sortOrder: number;
  passPercentage: number;
  questions: QuizQuestionDto[] | null;
}

export interface PracticalExamDto {
  id: number;
  title: string | null;
  sortOrder: number;
  expectedNotes: string[] | null;
}

export interface CourseDetailDto {
  id: number;
  title: string | null;
  instrument: string | null;
  description: string | null;
  accessType: string | null;
  status: string | null;
  rejectionReason: string | null;
  isEnrolled: boolean;
  isUnlocked: boolean;
  isCompleted: boolean;
  chapters: ChapterDto[] | null;
  quizzes: QuizExamDto[] | null;
  practicalExams: PracticalExamDto[] | null;
}

export interface UserProfileDto {
  userId: number;
  fullName: string | null;
  email: string | null;
  role: string | null;
  avatarUrl: string | null;
}

// Request Helper
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const token = storage.getItem('authToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
        throw new Error('Không thể phân tích phản hồi từ máy chủ.');
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



// API Service exports
export const api = {
  // Storage methods for auth token
  setToken: (token: string) => {
    storage.setItem('authToken', token);
  },
  getToken: () => {
    return storage.getItem('authToken');
  },
  logout: () => {
    storage.removeItem('authToken');
    storage.removeItem('currentCourseId');
  },

  // Storage methods for current selected course
  setCurrentCourseId: (courseId: number) => {
    storage.setItem('currentCourseId', courseId.toString());
  },
  getCurrentCourseId: (): number | null => {
    const val = storage.getItem('currentCourseId');
    return val ? parseInt(val, 10) : null;
  },

  // Auth Endpoints
  login: async (dto: LoginRequestDto): Promise<ApiResponse<AuthResponseDto>> => {
    const response = await request<AuthResponseDto>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    if (response.success && response.data?.token) {
      api.setToken(response.data.token);
    }
    return response;
  },

  register: async (dto: RegisterRequestDto): Promise<ApiResponse<AuthResponseDto>> => {
    const response = await request<AuthResponseDto>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    if (response.success && response.data?.token) {
      api.setToken(response.data.token);
    }
    return response;
  },

  getProfile: async (): Promise<ApiResponse<UserProfileDto>> => {
    return request<UserProfileDto>('/api/user/profile', {
      method: 'GET',
    });
  },

  // Courses/Learning Endpoints
  getCourses: async (): Promise<ApiResponse<CourseSummaryDto[]>> => {
    return request<CourseSummaryDto[]>('/api/courses', {
      method: 'GET',
    });
  },

  getCourseDetail: async (courseId: number): Promise<ApiResponse<CourseDetailDto>> => {
    return request<CourseDetailDto>(`/api/courses/${courseId}`, {
      method: 'GET',
    });
  },

  enrollCourse: async (courseId: number): Promise<ApiResponse<any>> => {
    return request<any>(`/api/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  },

  saveNote: async (courseId: number, lessonId: number | null, content: string): Promise<ApiResponse<any>> => {
    return request<any>(`/api/courses/${courseId}/notes`, {
      method: 'POST',
      body: JSON.stringify({
        lessonId,
        content,
      }),
    });
  },

  updateProgress: async (
    courseId: number,
    lessonId: number,
    watchedSeconds: number,
    totalSeconds: number
  ): Promise<ApiResponse<any>> => {
    return request<any>(`/api/lessons/${lessonId}/progress?courseId=${courseId}`, {
      method: 'POST',
      body: JSON.stringify({
        watchedSeconds,
        totalSeconds,
      }),
    });
  },

  getVideoUrl: async (courseId: number, lessonId: number): Promise<ApiResponse<string>> => {
    return request<string>(`/api/lessons/${lessonId}/video-url?courseId=${courseId}`, {
      method: 'GET',
    });
  }
};
