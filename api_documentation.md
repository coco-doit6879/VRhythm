# API Endpoint Separation by Role

This document categorizes the VRhythm backend API endpoints into three main sections based on their authorization roles: **Admin**, **Lecturer (Instructor)**, **Student (Learner / Authenticated User)**, and **Public (Unauthenticated)**. 

*Note: Most successful responses are wrapped in an `ApiResponse<T>` object. The "Response Data Type" column denotes the data type `T` returned within it.*

---

## 1. Admin API
These endpoints require the `Admin` role (`[Authorize(Roles = "Admin")]`).

| HTTP Method | Endpoint | Request Body / Parameters | Response Data Type | Description |
|---|---|---|---|---|
| `POST` | `/api/courses/{courseId}/approve` | None | `object` | Approves a submitted course |
| `POST` | `/api/courses/{courseId}/reject` | `RejectCourseRequestDto` | `object` | Rejects a submitted course with reasons |
| `PUT` | `/api/practical/{lessonId}/sheet` | `UpdateSheetMusicRequestDto` | `string` | Updates sheet music for a practical lesson *(Also accessible by Instructor)* |

---

## 2. Lecturer (Instructor) API
These endpoints require the `Instructor` role (`[Authorize(Roles = "Instructor")]`). They are primarily used for creating and managing courses and lessons.

### Courses & Chapters
| HTTP Method | Endpoint | Request Body / Parameters | Response Data Type | Description |
|---|---|---|---|---|
| `POST` | `/api/courses` | `CreateCourseRequestDto` | `int` (Course ID) | Creates a new course |
| `POST` | `/api/courses/{courseId}/chapters` | `CreateChapterRequestDto` | `int` (Chapter ID) | Adds a chapter to a course |
| `POST` | `/api/courses/{courseId}/submit` | None | `object` | Submits a draft course for admin review |
| `POST` | `/api/courses/{courseId}/revise` | None | `object` | Moves a rejected course back to draft status |

### Lessons
| HTTP Method | Endpoint | Request Body / Parameters | Response Data Type | Description |
|---|---|---|---|---|
| `POST` | `/api/lessons/theory?chapterId={id}` | `CreateTheoryLessonRequestDto` | `int` (Lesson ID) | Creates a theory lesson |
| `POST` | `/api/lessons/video?chapterId={id}` | `CreateVideoLessonRequestDto` | `int` (Lesson ID) | Creates a video lesson |
| `POST` | `/api/lessons/quiz?chapterId={id}` | `CreateQuizLessonRequestDto` | `int` (Lesson ID) | Creates a quiz lesson |
| `POST` | `/api/lessons/practical?chapterId={id}`| `CreatePracticalLessonRequestDto` | `int` (Lesson ID) | Creates a practical lesson |
| `PUT` | `/api/lessons/{lessonId}/theory` | `UpdateTheoryLessonRequestDto` | `object` | Updates a theory lesson |
| `PUT` | `/api/lessons/{lessonId}/video` | `UpdateVideoLessonRequestDto` | `object` | Updates a video lesson |
| `PUT` | `/api/lessons/{lessonId}/quiz` | `UpdateQuizLessonRequestDto` | `object` | Updates a quiz lesson |
| `PUT` | `/api/lessons/{lessonId}/practical`| `UpdatePracticalLessonRequestDto` | `object` | Updates a practical lesson |
| `DELETE` | `/api/lessons/{lessonId}` | None | `object` | Deletes a lesson |
| `PUT` | `/api/practical/{lessonId}/sheet` | `UpdateSheetMusicRequestDto` | `string` | Updates sheet music *(Also Admin)* |

---

## 3. Student (Learner / Authenticated User) API
These endpoints require a standard authenticated user (`[Authorize]`). Any logged-in user, including students, can access these.

### User Profile
| HTTP Method | Endpoint | Request Body / Parameters | Response Data Type | Description |
|---|---|---|---|---|
| `GET` | `/api/user/profile` | None | `UserProfileDto` | Gets the current user's profile |
| `PUT` | `/api/user/profile/avatar-url/?avatarUrl={url}`| `avatarUrl` (Query) | `UserProfileDto` | Updates the user's avatar URL |

### Course Interaction
| HTTP Method | Endpoint | Request Body / Parameters | Response Data Type | Description |
|---|---|---|---|---|
| `POST` | `/api/courses/{courseId}/enroll` | None | `object` | Enrolls the user in a free course |
| `POST` | `/api/courses/{courseId}/unlock` | None | `object` | Mocks a purchase to unlock a course |
| `POST` | `/api/courses/{courseId}/notes` | `SaveNoteRequestDto` | `object` | Saves a note for a course |
| `POST` | `/api/courses/{courseId}/completion/recalculate`| None | `bool` | Recalculates and returns completion status |

### Lesson & Progress
| HTTP Method | Endpoint | Request Body / Parameters | Response Data Type | Description |
|---|---|---|---|---|
| `GET` | `/api/lessons/chapter/{chapterId}` | None | `IReadOnlyList<LessonSummaryDto>` | Gets all lessons in a chapter |
| `GET` | `/api/lessons/{lessonId}` | None | `LessonDetailDto` | Gets details of a specific lesson |
| `GET` | `/api/lessons/{lessonId}/video-url?courseId={id}`| `courseId` (Query) | `string` (URL) | Gets the presigned URL for a video lesson |
| `POST` | `/api/lessons/{lessonId}/progress` | `UpdateVideoProgressDto` | `object` | Updates video watch progress |

### Learning Activities
| HTTP Method | Endpoint | Request Body / Parameters | Response Data Type | Description |
|---|---|---|---|---|
| `GET` | `/api/theory/{lessonId}` | None | `TheoryDto` | Gets theory lesson content |
| `POST` | `/api/theory/{lessonId}/complete` | None | `object` | Marks a theory lesson as complete |
| `GET` | `/api/quizzes/{lessonId}` | None | `QuizDto` | Gets quiz questions and details |
| `POST` | `/api/quizzes/{lessonId}/submit` | `SubmitQuizRequestDto` | `SubmitQuizResponseDto` | Submits quiz answers |
| `GET` | `/api/practical/{lessonId}` | None | `PracticalDto` | Gets practical lesson content |
| `POST` | `/api/practical/{lessonId}/complete` | `SubmitPracticalRequestDto`| `SubmitPracticalResponseDto`| Submits a practical exercise |

---

## 4. Public (Unauthenticated) API
These endpoints are accessible to anyone (`[AllowAnonymous]` or no `[Authorize]` attribute).

### Authentication
| HTTP Method | Endpoint | Request Body / Parameters | Response Data Type | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | `RegisterRequestDto` | `AuthResponseDto` | Registers a new user |
| `POST` | `/api/auth/login` | `LoginRequestDto` | `AuthResponseDto` | Logs in an existing user |
| `POST` | `/api/auth/google` | `GoogleLoginRequestDto`| `AuthResponseDto` | Logs in using Google Auth |

### Course Browsing
| HTTP Method | Endpoint | Request Body / Parameters | Response Data Type | Description |
|---|---|---|---|---|
| `GET` | `/api/courses` | None | `IReadOnlyList<CourseSummaryDto>`| Gets a list of approved courses |
| `GET` | `/api/courses/{courseId}` | None | `CourseDetailDto` | Gets detailed information for a specific course |

### Object Storage (Media)
| HTTP Method | Endpoint | Request Body / Parameters | Response Data Type | Description |
|---|---|---|---|---|
| `POST` | `/api/object-storage/upload-url/video` | None | `{ ObjectKey, UploadUrl }` | Gets an upload URL for a new video |
| `GET` | `/api/object-storage/upload-url/object-key` | `objectKey` (Query) | `{ ObjectKey, UploadUrl }` | Gets an upload URL by object key |
| `GET` | `/api/object-storage/upload-url` | `objectKey` (Query) | `{ ObjectKey, UploadUrl }` | Gets a presigned download/view URL |
