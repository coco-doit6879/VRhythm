export const BASE_URL = "http://vrythm.quanglikecookie.io.vn";

export interface UserProfile {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface CourseSummary {
  id: number;
  title: string;
  instrument: string;
  description: string;
  accessType: string;
  status: string; // Draft, Submitted, Approved, Rejected
  thumbnailUrl?: string;
}

export interface LessonSummary {
  id: number;
  sortOrder: number;
  title: string;
  type: string; // Theory, Video, Quiz
}

export interface QuizOption {
  id: number;
  sortOrder: number;
  text: string;
}

export interface QuizQuestion {
  id: number;
  sortOrder: number;
  prompt: string;
  options: QuizOption[];
  correctOptionId?: number; // Internal support for editing
}

export interface LessonDetail {
  id: number;
  sortOrder: number;
  title: string;
  type: string; // Theory, Video, Quiz
  content?: string;
  durationSeconds?: number;
  videoObjectKey?: string;
  videoContentType?: string;
  quizQuestions?: QuizQuestion[];
  passPercentage?: number;
}

export interface Chapter {
  id: number;
  sortOrder: number;
  title: string;
  lessons: LessonSummary[];
}

export interface CourseDetail {
  id: number;
  title: string;
  instrument: string;
  description: string;
  accessType: string;
  status: string;
  rejectionReason?: string;
  thumbnailUrl?: string;
  chapters: Chapter[];
}

// Check if we are running in Offline/Mock fallback mode
let isOfflineMode = false;

export const setOfflineMode = (offline: boolean) => {
  isOfflineMode = offline;
  localStorage.setItem("vr_teacher_offline", offline ? "true" : "false");
};

export const getOfflineMode = (): boolean => {
  return localStorage.getItem("vr_teacher_offline") === "true";
};

// Initial Mock Data setup stored in LocalStorage
const INITIAL_MOCK_COURSES: CourseDetail[] = [
  {
    id: 101,
    title: "Đàn Tranh Nhập Môn Căn Bản",
    instrument: "Đàn Tranh",
    description: "Khóa học dành cho người mới bắt đầu tiếp cận Đàn Tranh truyền thống Việt Nam. Học viên sẽ được tìm hiểu về cấu tạo nhạc cụ, tư thế ngồi chuẩn chỉnh và kỹ thuật gảy ngón cơ bản.",
    accessType: "Free",
    status: "Approved",
    thumbnailUrl: "https://images.unsplash.com/photo-1615966650071-855b15f29ad1?w=400",
    chapters: [
      {
        id: 201,
        sortOrder: 1,
        title: "Chương I: Nhập môn và Cấu tạo Đàn Tranh",
        lessons: [
          { id: 301, sortOrder: 1, title: "Giới thiệu lịch sử Đàn Tranh Việt Nam", type: "Theory" },
          { id: 302, sortOrder: 2, title: "Hướng dẫn căng dây và lên âm sắc chuẩn", type: "Video" }
        ]
      },
      {
        id: 202,
        sortOrder: 2,
        title: "Chương II: Các kỹ thuật ngón cơ bản",
        lessons: [
          { id: 303, sortOrder: 1, title: "Kỹ thuật gảy ngón Á và ngón Song", type: "Video" },
          { id: 304, sortOrder: 2, title: "Trắc nghiệm lý thuyết nhạc lý Đàn Tranh", type: "Quiz" }
        ]
      }
    ]
  },
  {
    id: 102,
    title: "Tuyển tập các điệu hò Sáo Trúc Nam Bộ",
    instrument: "Sáo Trúc",
    description: "Nâng cao kỹ năng thổi sáo trúc với các làn điệu dân ca quê hương ngọt ngào. Khóa học tập trung sâu vào kỹ thuật rung hơi, vuốt nốt và lấy hơi bụng tự nhiên.",
    accessType: "Premium",
    status: "Draft",
    thumbnailUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400",
    chapters: []
  },
  {
    id: 103,
    title: "Đàn Bầu - Tiếng tơ lòng quê hương",
    instrument: "Đàn Bầu",
    description: "Khóa học tìm hiểu về chiếc đàn một dây độc đáo của Việt Nam. Tìm hiểu cách gảy âm bồi và kỹ thuật dùng cần rung tạo ra các cung bậc cảm xúc réo rắt.",
    accessType: "Free",
    status: "Rejected",
    rejectionReason: "Bài giảng video số 2 bị mờ và âm thanh thu âm bị rè. Yêu cầu giáo viên ghi hình lại đoạn này.",
    chapters: [
      {
        id: 203,
        sortOrder: 1,
        title: "Chương I: Cách lấy âm bồi chuẩn xác",
        lessons: [
          { id: 305, sortOrder: 1, title: "Lý thuyết cơ bản về âm học Đàn Bầu", type: "Theory" }
        ]
      }
    ]
  }
];

const INITIAL_MOCK_LESSONS: Record<number, LessonDetail> = {
  301: {
    id: 301,
    sortOrder: 1,
    title: "Giới thiệu lịch sử Đàn Tranh Việt Nam",
    type: "Theory",
    durationSeconds: 300,
    content: "Đàn Tranh (hay còn gọi là Đàn thập lục) là nhạc cụ truyền thống thuộc họ chiết có nguồn gốc lâu đời của Việt Nam. Trải qua lịch sử phát triển, đàn tranh đã trở thành một biểu tượng âm nhạc quan trọng, xuất hiện từ âm nhạc cung đình Huế trang nghiêm cho đến các buổi biểu diễn âm nhạc dân gian mộc mạc."
  },
  302: {
    id: 302,
    sortOrder: 2,
    title: "Hướng dẫn căng dây và lên âm sắc chuẩn",
    type: "Video",
    durationSeconds: 620,
    videoObjectKey: "videos/dan-tranh-tuning.mp4",
    videoContentType: "video/mp4",
    content: "Xem video hướng dẫn chi tiết cách so dây, sử dụng nhạn đàn (con nhạn) để căn chỉnh đúng cao độ các nốt C, D, F, G, A tương ứng."
  },
  303: {
    id: 303,
    sortOrder: 1,
    title: "Kỹ thuật gảy ngón Á và ngón Song",
    type: "Video",
    durationSeconds: 480,
    videoObjectKey: "videos/ky-thuat-ngon-dan-tranh.mp4",
    videoContentType: "video/mp4",
    content: "Hướng dẫn các động tác đặt móng gảy (ở ngón cái, trỏ, giữa) song song với dây và gảy đúng hướng phát âm vang sáng."
  },
  304: {
    id: 304,
    sortOrder: 2,
    title: "Trắc nghiệm lý thuyết nhạc lý Đàn Tranh",
    type: "Quiz",
    passPercentage: 80,
    quizQuestions: [
      {
        id: 1,
        sortOrder: 1,
        prompt: "Đàn Tranh truyền thống Việt Nam có tên gọi dân gian khác là gì?",
        options: [
          { id: 11, sortOrder: 1, text: "Đàn Thập Lục (16 dây)" },
          { id: 12, sortOrder: 2, text: "Đàn Tỳ Bà" },
          { id: 13, sortOrder: 3, text: "Đàn Tam Thập Lục" },
          { id: 14, sortOrder: 4, text: "Đàn Nguyệt" }
        ],
        correctOptionId: 11
      },
      {
        id: 2,
        sortOrder: 2,
        prompt: "Nhạn đàn đàn tranh dùng để làm gì?",
        options: [
          { id: 21, sortOrder: 1, text: "Trang trí đàn cho đẹp mắt" },
          { id: 22, sortOrder: 2, text: "Đỡ dây đàn và thay đổi cao độ khi dịch chuyển" },
          { id: 23, sortOrder: 3, text: "Cố định móng gảy" }
        ],
        correctOptionId: 22
      }
    ]
  },
  305: {
    id: 305,
    sortOrder: 1,
    title: "Lý thuyết cơ bản về âm học Đàn Bầu",
    type: "Theory",
    durationSeconds: 240,
    content: "Đàn Bầu sử dụng nguyên lý tạo âm độc đáo bằng cách kết hợp gảy âm bồi tại các điểm nút harmonics trên dây thép, đồng thời dùng cần đàn bằng tre/sừng để căng trùng dây phát ra âm sắc luyến láy quyến rũ."
  }
};

// Local storage helper
const getMockCourses = (): CourseDetail[] => {
  const data = localStorage.getItem("vr_mock_courses");
  if (!data) {
    localStorage.setItem("vr_mock_courses", JSON.stringify(INITIAL_MOCK_COURSES));
    return INITIAL_MOCK_COURSES;
  }
  return JSON.parse(data);
};

const saveMockCourses = (courses: CourseDetail[]) => {
  localStorage.setItem("vr_mock_courses", JSON.stringify(courses));
};

const getMockLessons = (): Record<number, LessonDetail> => {
  const data = localStorage.getItem("vr_mock_lessons");
  if (!data) {
    localStorage.setItem("vr_mock_lessons", JSON.stringify(INITIAL_MOCK_LESSONS));
    return INITIAL_MOCK_LESSONS;
  }
  return JSON.parse(data);
};

const saveMockLessons = (lessons: Record<number, LessonDetail>) => {
  localStorage.setItem("vr_mock_lessons", JSON.stringify(lessons));
};

// Check role function helper
const checkInstructorRole = (profile: UserProfile): boolean => {
  const role = profile.role?.toLowerCase();
  if (role === "instructor" || role === "admin") {
    return true;
  }
  return false;
};

// API Functions
export const api = {
  // 1. LOGIN
  login: async (email: string, password: string): Promise<{ token: string; profile: UserProfile }> => {
    if (getOfflineMode() || isOfflineMode) {
      // Simulate login offline
      if (email.includes("student") || email.includes("hocsinh")) {
        throw new Error("Tài khoản của bạn là Sinh viên. Chỉ Giáo viên mới được quyền truy cập hệ thống quản trị này.");
      }
      const mockProfile: UserProfile = {
        userId: 99,
        fullName: email.split("@")[0].toUpperCase().replace(".", " "),
        email: email,
        role: "Instructor",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
      };
      localStorage.setItem("vr_token", "mock_token_instructor_123");
      localStorage.setItem("vr_user", JSON.stringify(mockProfile));
      return { token: "mock_token_instructor_123", profile: mockProfile };
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData?.message || "Đăng nhập thất bại.");
      }

      const authData = resData.data || resData;
      // Strict role verification to block Students
      const mockProfile: UserProfile = {
        userId: authData.userId,
        fullName: authData.fullName,
        email: authData.email,
        role: authData.role,
        avatarUrl: authData.avatarUrl
      };

      if (!checkInstructorRole(mockProfile)) {
        throw new Error("Từ chối truy cập! Tài khoản của bạn không có vai trò Giáo viên (Instructor) trên hệ thống.");
      }

      localStorage.setItem("vr_token", authData.token);
      localStorage.setItem("vr_user", JSON.stringify(mockProfile));
      return { token: authData.token, profile: mockProfile };
    } catch (err: any) {
      if (err.message?.includes("Từ chối truy cập") || err.message?.includes("không có vai trò Giáo viên")) {
        throw err;
      }
      console.warn("API Server offline, switching automatically to offline demo mode");
      setOfflineMode(true);
      return api.login(email, password); // Retry in offline mode
    }
  },

  logout: () => {
    localStorage.removeItem("vr_token");
    localStorage.removeItem("vr_user");
  },

  getCurrentUser: (): UserProfile | null => {
    const data = localStorage.getItem("vr_user");
    return data ? JSON.parse(data) : null;
  },

  getToken: (): string | null => {
    return localStorage.getItem("vr_token");
  },

  getHeaders: () => {
    const token = localStorage.getItem("vr_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  },

  // 2. GET ALL COURSES (Lecturer specific)
  getCourses: async (): Promise<CourseSummary[]> => {
    if (getOfflineMode()) {
      const mock = getMockCourses();
      return mock.map(c => ({
        id: c.id,
        title: c.title,
        instrument: c.instrument,
        description: c.description,
        accessType: c.accessType,
        status: c.status,
        thumbnailUrl: c.thumbnailUrl
      }));
    }

    try {
      const response = await fetch(`${BASE_URL}/api/courses`, {
        headers: api.getHeaders()
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message);
      // Backend returns all approved courses to public, but for simplicity we show all fetched courses
      return res.data || res;
    } catch (err) {
      console.warn("Using offline courses list");
      setOfflineMode(true);
      return api.getCourses();
    }
  },

  // 3. GET COURSE DETAILS
  getCourseDetail: async (courseId: number): Promise<CourseDetail> => {
    if (getOfflineMode()) {
      const mock = getMockCourses();
      const found = mock.find(c => c.id === courseId);
      if (!found) throw new Error("Không tìm thấy khóa học.");
      return found;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/courses/${courseId}`, {
        headers: api.getHeaders()
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message);
      return res.data || res;
    } catch (err) {
      console.warn("Using offline course detail");
      setOfflineMode(true);
      return api.getCourseDetail(courseId);
    }
  },

  // 4. CREATE COURSE
  createCourse: async (data: { title: string; instrument: string; description: string; accessType: string; thumbnailUrl?: string }): Promise<number> => {
    if (getOfflineMode()) {
      const mock = getMockCourses();
      const newId = Date.now();
      const newCourse: CourseDetail = {
        id: newId,
        title: data.title,
        instrument: data.instrument,
        description: data.description,
        accessType: data.accessType,
        status: "Draft",
        thumbnailUrl: data.thumbnailUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
        chapters: []
      };
      mock.push(newCourse);
      saveMockCourses(mock);
      return newId;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/courses`, {
        method: "POST",
        headers: api.getHeaders(),
        body: JSON.stringify(data)
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message);
      return res.data || res; // CourseId
    } catch (err) {
      setOfflineMode(true);
      return api.createCourse(data);
    }
  },

  // 5. SUBMIT COURSE FOR REVIEW
  submitCourse: async (courseId: number): Promise<boolean> => {
    if (getOfflineMode()) {
      const mock = getMockCourses();
      const idx = mock.findIndex(c => c.id === courseId);
      if (idx !== -1) {
        mock[idx].status = "Submitted";
        saveMockCourses(mock);
        return true;
      }
      return false;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/courses/${courseId}/submit`, {
        method: "POST",
        headers: api.getHeaders()
      });
      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.message);
      }
      return true;
    } catch (err) {
      setOfflineMode(true);
      return api.submitCourse(courseId);
    }
  },

  // 6. REVISE REJECTED COURSE
  reviseCourse: async (courseId: number): Promise<boolean> => {
    if (getOfflineMode()) {
      const mock = getMockCourses();
      const idx = mock.findIndex(c => c.id === courseId);
      if (idx !== -1) {
        mock[idx].status = "Draft";
        mock[idx].rejectionReason = undefined;
        saveMockCourses(mock);
        return true;
      }
      return false;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/courses/${courseId}/revise`, {
        method: "POST",
        headers: api.getHeaders()
      });
      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.message);
      }
      return true;
    } catch (err) {
      setOfflineMode(true);
      return api.reviseCourse(courseId);
    }
  },

  // 7. CREATE CHAPTER
  createChapter: async (courseId: number, title: string, sortOrder: number): Promise<number> => {
    if (getOfflineMode()) {
      const mock = getMockCourses();
      const idx = mock.findIndex(c => c.id === courseId);
      if (idx === -1) throw new Error("Không tìm thấy khóa học.");
      const newId = Date.now();
      const newChapter: Chapter = {
        id: newId,
        sortOrder,
        title,
        lessons: []
      };
      mock[idx].chapters.push(newChapter);
      // Sort chapters
      mock[idx].chapters.sort((a, b) => a.sortOrder - b.sortOrder);
      saveMockCourses(mock);
      return newId;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/courses/${courseId}/chapters`, {
        method: "POST",
        headers: api.getHeaders(),
        body: JSON.stringify({ title, sortOrder })
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message);
      return res.data || res;
    } catch (err) {
      setOfflineMode(true);
      return api.createChapter(courseId, title, sortOrder);
    }
  },

  // 8. GET LESSON DETAILS
  getLessonDetail: async (lessonId: number): Promise<LessonDetail> => {
    if (getOfflineMode()) {
      const lessons = getMockLessons();
      const found = lessons[lessonId];
      if (!found) throw new Error("Không tìm thấy bài học.");
      return found;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/lessons/${lessonId}`, {
        headers: api.getHeaders()
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message);
      
      const data = res.data || res;
      // Convert backend structure to editor structure
      const questions = data.quiz?.questions?.map((q: any) => ({
        id: q.id,
        sortOrder: q.sortOrder,
        prompt: q.prompt,
        options: q.options || []
      })) || [];

      return {
        id: data.id,
        sortOrder: data.sortOrder,
        title: data.title,
        type: data.type,
        content: data.theory?.content || data.video?.content || "",
        durationSeconds: data.theory?.durationSeconds || data.video?.durationSeconds || 0,
        videoObjectKey: data.video?.videoObjectKey || "",
        videoContentType: data.video?.videoContentType || "",
        quizQuestions: questions,
        passPercentage: data.quiz?.passPercentage || 80
      };
    } catch (err) {
      setOfflineMode(true);
      return api.getLessonDetail(lessonId);
    }
  },

  // 9. CREATE LESSON
  createLesson: async (chapterId: number, lesson: Omit<LessonDetail, "id">): Promise<number> => {
    if (getOfflineMode()) {
      const courses = getMockCourses();
      let foundCourseIdx = -1;
      let foundChapterIdx = -1;

      courses.forEach((c, cIdx) => {
        const chIdx = c.chapters.findIndex(ch => ch.id === chapterId);
        if (chIdx !== -1) {
          foundCourseIdx = cIdx;
          foundChapterIdx = chIdx;
        }
      });

      if (foundChapterIdx === -1) throw new Error("Không tìm thấy chương học.");

      const newLessonId = Date.now();
      const newSummary: LessonSummary = {
        id: newLessonId,
        sortOrder: lesson.sortOrder,
        title: lesson.title,
        type: lesson.type
      };

      courses[foundCourseIdx].chapters[foundChapterIdx].lessons.push(newSummary);
      courses[foundCourseIdx].chapters[foundChapterIdx].lessons.sort((a, b) => a.sortOrder - b.sortOrder);
      saveMockCourses(courses);

      // Save full detail
      const lessonsDetail = getMockLessons();
      lessonsDetail[newLessonId] = {
        id: newLessonId,
        ...lesson
      };
      saveMockLessons(lessonsDetail);

      return newLessonId;
    }

    try {
      const typePath = lesson.type.toLowerCase(); // theory, video, quiz
      const body: Record<string, any> = {
        sortOrder: lesson.sortOrder,
        title: lesson.title
      };

      if (typePath === "theory") {
        body.content = lesson.content || "";
        body.durationSeconds = lesson.durationSeconds || 0;
      } else if (typePath === "video") {
        body.content = lesson.content || "";
        body.durationSeconds = lesson.durationSeconds || 0;
        body.videoObjectKey = lesson.videoObjectKey || "";
        body.videoContentType = lesson.videoContentType || "video/mp4";
      } else if (typePath === "quiz") {
        body.quiz = {
          title: lesson.title,
          passPercentage: lesson.passPercentage || 80,
          questions: lesson.quizQuestions?.map(q => ({
            sortOrder: q.sortOrder,
            prompt: q.prompt,
            options: q.options.map(o => ({ sortOrder: o.sortOrder, text: o.text })),
            correctOptionSortOrder: q.options.find(o => o.id === q.correctOptionId)?.sortOrder || 1
          })) || []
        };
      }

      const response = await fetch(`${BASE_URL}/api/lessons/${typePath}?chapterId=${chapterId}`, {
        method: "POST",
        headers: api.getHeaders(),
        body: JSON.stringify(body)
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message);
      return res.data || res;
    } catch (err) {
      setOfflineMode(true);
      return api.createLesson(chapterId, lesson);
    }
  },

  // 10. UPDATE LESSON
  updateLesson: async (lessonId: number, lesson: Omit<LessonDetail, "id">): Promise<boolean> => {
    if (getOfflineMode()) {
      const courses = getMockCourses();
      
      // Update summary
      courses.forEach((c) => {
        c.chapters.forEach((ch) => {
          const lIdx = ch.lessons.findIndex(l => l.id === lessonId);
          if (lIdx !== -1) {
            ch.lessons[lIdx].title = lesson.title;
            ch.lessons[lIdx].sortOrder = lesson.sortOrder;
            ch.lessons[lIdx].type = lesson.type;
            ch.lessons.sort((a, b) => a.sortOrder - b.sortOrder);
          }
        });
      });
      saveMockCourses(courses);

      // Update detail
      const lessonsDetail = getMockLessons();
      lessonsDetail[lessonId] = {
        id: lessonId,
        ...lesson
      };
      saveMockLessons(lessonsDetail);
      return true;
    }

    try {
      const typePath = lesson.type.toLowerCase();
      const body: Record<string, any> = {
        sortOrder: lesson.sortOrder,
        title: lesson.title
      };

      if (typePath === "theory") {
        body.content = lesson.content || "";
        body.durationSeconds = lesson.durationSeconds || 0;
      } else if (typePath === "video") {
        body.content = lesson.content || "";
        body.durationSeconds = lesson.durationSeconds || 0;
        body.videoObjectKey = lesson.videoObjectKey || "";
        body.videoContentType = lesson.videoContentType || "video/mp4";
      } else if (typePath === "quiz") {
        body.quiz = {
          title: lesson.title,
          passPercentage: lesson.passPercentage || 80,
          questions: lesson.quizQuestions?.map(q => ({
            sortOrder: q.sortOrder,
            prompt: q.prompt,
            options: q.options.map(o => ({ sortOrder: o.sortOrder, text: o.text })),
            correctOptionSortOrder: q.options.find(o => o.id === q.correctOptionId)?.sortOrder || 1
          })) || []
        };
      }

      const response = await fetch(`${BASE_URL}/api/lessons/${lessonId}/${typePath}`, {
        method: "PUT",
        headers: api.getHeaders(),
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.message);
      }
      return true;
    } catch (err) {
      setOfflineMode(true);
      return api.updateLesson(lessonId, lesson);
    }
  },

  // 11. DELETE LESSON
  deleteLesson: async (lessonId: number): Promise<boolean> => {
    if (getOfflineMode()) {
      const courses = getMockCourses();
      courses.forEach((c) => {
        c.chapters.forEach((ch) => {
          ch.lessons = ch.lessons.filter(l => l.id !== lessonId);
        });
      });
      saveMockCourses(courses);

      const lessons = getMockLessons();
      delete lessons[lessonId];
      saveMockLessons(lessons);
      return true;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/lessons/${lessonId}`, {
        method: "DELETE",
        headers: api.getHeaders()
      });
      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.message);
      }
      return true;
    } catch (err) {
      setOfflineMode(true);
      return api.deleteLesson(lessonId);
    }
  },

  // 12. GET S3 PRESIGNED UPLOAD URL
  getVideoUploadUrl: async (): Promise<{ objectKey: string; uploadUrl: string }> => {
    if (getOfflineMode()) {
      const objectKey = `videos/mock_video_${Date.now()}.mp4`;
      return {
        objectKey,
        uploadUrl: `https://mock-s3-upload-url.com/${objectKey}`
      };
    }

    try {
      const response = await fetch(`${BASE_URL}/api/object-storage/upload-url/video`, {
        method: "POST",
        headers: api.getHeaders()
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message);
      return res.data || res; // { objectKey, uploadUrl }
    } catch (err) {
      setOfflineMode(true);
      return api.getVideoUploadUrl();
    }
  }
};
