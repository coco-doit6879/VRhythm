import { request } from "./api-client";
import {
  ApiResponse,
  LessonDto,
  PracticalDto,
  QuizExamDto,
  QuizSubmitResponseDto,
  TheoryDto,
} from "./api-types";

export const learningApi = {
  getLessonDetail: async (lessonId: number): Promise<ApiResponse<LessonDto>> => {
    return request<LessonDto>(`/api/lessons/${lessonId}`, {
      method: "GET",
    });
  },
  completeTheory: async (lessonId: number): Promise<ApiResponse<any>> => {
    return request<any>(`/api/theory/${lessonId}/complete`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },
  submitPractical: async (
    lessonId: number,
    notes: string[],
  ): Promise<ApiResponse<{
    correctNotes: number;
    totalNotes: number;
    scorePercentage: number;
    passed: boolean;
  }>> => {
    return request(`/pratical/${lessonId}/complete`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
  },
  updateVideoProgress: async (
    courseId: number,
    lessonId: number,
    watchedSeconds: number,
    totalSeconds: number,
  ): Promise<ApiResponse<any>> => {
    return request<any>(`/api/lessons/${lessonId}/progress?courseId=${courseId}`, {
      method: "POST",
      body: JSON.stringify({ watchedSeconds, totalSeconds }),
    });
  },
  getVideoUrl: async (
    courseId: number,
    lessonId: number,
  ): Promise<ApiResponse<string>> => {
    return request<string>(`/api/lessons/${lessonId}/video-url?courseId=${courseId}`, {
      method: "GET",
    });
  },
  getQuiz: async (lessonId: number): Promise<ApiResponse<QuizExamDto>> => {
    return request<QuizExamDto>(`/api/quizzes/${lessonId}`, {
      method: "GET",
    });
  },
  submitQuiz: async (
    lessonId: number,
    answers: { questionId: number; selectedOptionId: number }[],
  ): Promise<ApiResponse<QuizSubmitResponseDto>> => {
    return request<QuizSubmitResponseDto>(`/api/quizzes/${lessonId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },
};
