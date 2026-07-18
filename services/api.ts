// Central API Service for VRhythm
// Split into focused modules for auth, courses, and learning.

import { authApi } from "./api-auth";
import { courseApi } from "./api-courses";
import { learningApi } from "./api-learning";

export * from "./api-types";
export { authApi, courseApi, learningApi };

export const api = {
  ...authApi,
  ...courseApi,
  ...learningApi,
};

