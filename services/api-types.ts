export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  error: any | null;
}

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

export interface CourseSummaryDto {
  id: number;
  title: string;
  instrument: string;
  description: string;
  accessType: string;
  status: string;
  thumbnailUrl: string | null;
}

export interface TheoryDto {
  lessonId: number;
  title: string;
  content: string;
  isCompleted: boolean;
}

export interface PracticalNoteDto {
  sortOrder: number;
  note: string;
}

export interface PracticalDto {
  lessonId: number;
  title: string;
  instruction: string;
  notes: PracticalNoteDto[];
  isCompleted: boolean;
  sheetMusicJson?: string | null;
}

export interface LessonDto {
  id: number;
  sortOrder: number;
  title: string | null;
  type: string | null;
  content: string | null;
  durationSeconds: number | null;
  isCompleted: boolean;
  theory?: TheoryDto | null;
  quiz?: QuizExamDto | null;
  practical?: PracticalDto | null;
  video?: {
    videoUrl: string;
    durationSeconds: number;
    progressPercent: number;
  } | null;
}

export interface ChapterDto {
  id: number;
  sortOrder: number;
  title: string | null;
  lessons: LessonDto[] | null;
}

export interface QuizOptionDto {
  id: number;
  isCorrect: boolean;
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

export interface QuizSubmitResponseDto {
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  passed: boolean;
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
