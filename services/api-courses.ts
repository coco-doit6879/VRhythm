import { request } from "./api-client";
import { storage } from "./api-storage";
import {
  ApiResponse,
  CourseDetailDto,
  CourseSummaryDto,
} from "./api-types";

export const courseApi = {
  setCurrentCourseId: (courseId: number) => {
    storage.setItem("currentCourseId", courseId.toString());
  },
  getCurrentCourseId: (): number | null => {
    const val = storage.getItem("currentCourseId");
    return val ? parseInt(val, 10) : null;
  },
  getCourses: async (): Promise<ApiResponse<CourseSummaryDto[]>> => {
    return request<CourseSummaryDto[]>("/api/courses", {
      method: "GET",
    });
  },
  getCourseDetail: async (courseId: number): Promise<ApiResponse<CourseDetailDto>> => {
    return request<CourseDetailDto>(`/api/courses/${courseId}`, {
      method: "GET",
    });
  },
  enrollCourse: async (courseId: number): Promise<ApiResponse<any>> => {
    return request<any>(`/api/courses/${courseId}/enroll`, {
      method: "POST",
    });
  },
  saveNote: async (
    courseId: number,
    lessonId: number | null,
    content: string,
  ): Promise<ApiResponse<any>> => {
    return request<any>(`/api/courses/${courseId}/notes`, {
      method: "POST",
      body: JSON.stringify({
        lessonId,
        content,
      }),
    });
  },
};
