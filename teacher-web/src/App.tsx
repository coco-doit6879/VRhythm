import React, { useState, useEffect } from 'react';
import {
  Grid,
  Plus,
  ArrowLeft,
  Trash2,
  Edit,
  FolderPlus,
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  LogOut,
  UploadCloud,
  ChevronDown,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { api, getOfflineMode } from './services/api';
import type { UserProfile, CourseSummary, CourseDetail, Chapter, LessonSummary, LessonDetail, QuizQuestion } from './services/api';

type Page = 'login' | 'dashboard' | 'course-detail' | 'course-form' | 'lesson-form';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'error';
}

export default function App() {
  const [activePage, setActivePage] = useState<Page>('login');
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Lists
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [activeCourse, setActiveCourse] = useState<CourseDetail | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  
  // Selection/Editing states
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editingLessonType, setEditingLessonType] = useState<string>('Theory');
  
  // Forms states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Course Form
  const [courseTitle, setCourseTitle] = useState('');
  const [courseInstrument, setCourseInstrument] = useState('Đàn Tranh');
  const [courseAccess, setCourseAccess] = useState('Free');
  const [courseThumbnail, setCourseThumbnail] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  
  // Lesson Form
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSortOrder, setLessonSortOrder] = useState<number>(1);
  const [theoryContent, setTheoryContent] = useState('');
  const [theoryDuration, setTheoryDuration] = useState<number>(300);
  const [videoDuration, setVideoDuration] = useState<number>(300);
  const [videoKey, setVideoKey] = useState('');
  const [videoType, setVideoType] = useState('video/mp4');
  const [quizPass, setQuizPass] = useState<number>(80);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  // Video Upload Sim
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Common UI states
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [filterTab, setFilterTab] = useState<string>('all');
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [chapterModalId, setChapterModalId] = useState<number | null>(null);
  const [chapterModalTitle, setChapterModalTitle] = useState('');
  const [chapterModalSort, setChapterModalSort] = useState<number>(1);
  const [addLessonDropdownVisible, setAddLessonDropdownVisible] = useState(false);

  // Load user from storage on mount
  useEffect(() => {
    const currentUser = api.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setActivePage('dashboard');
      loadCourses();
    }
  }, []);

  // Toast System Helper
  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await api.getCourses();
      setCourses(data);
    } catch (e: any) {
      showToast(e.message || 'Không thể tải danh sách khóa học.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseDetail = async (id: number) => {
    setLoading(true);
    try {
      const detail = await api.getCourseDetail(id);
      setActiveCourse(detail);
      // Select first chapter automatically if exists
      if (detail.chapters && detail.chapters.length > 0) {
        setSelectedChapterId(detail.chapters[0].id);
      } else {
        setSelectedChapterId(null);
      }
      setActivePage('course-detail');
    } catch (e: any) {
      showToast(e.message || 'Không thể tải chi tiết khóa học.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Auth Action
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.login(loginEmail, loginPassword);
      setUser(res.profile);
      showToast(`Đăng nhập thành công! Chào mừng Giáo viên ${res.profile.fullName}.`);
      setActivePage('dashboard');
      loadCourses();
    } catch (e: any) {
      showToast(e.message || 'Đăng nhập không thành công.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setActivePage('login');
    showToast('Đã đăng xuất khỏi tài khoản.');
  };

  // Course Actions
  const handleCreateOrUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseDescription.trim()) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const body = {
        title: courseTitle,
        instrument: courseInstrument,
        description: courseDescription,
        accessType: courseAccess,
        thumbnailUrl: courseThumbnail || undefined
      };

      if (editingCourseId) {
        // Edit course summary (mock update support)
        showToast('Cập nhật khóa học thành công!');
      } else {
        const newId = await api.createCourse(body);
        showToast('Tạo khóa học mới thành công!');
        loadCourseDetail(newId);
        return;
      }
      setActivePage('dashboard');
      loadCourses();
    } catch (e: any) {
      showToast(e.message || 'Lỗi khi lưu khóa học.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishCourse = async (id: number) => {
    setLoading(true);
    try {
      const success = await api.submitCourse(id);
      if (success) {
        showToast('Đã gửi yêu cầu phê duyệt khóa học lên Ban Quản trị.');
        loadCourseDetail(id);
      }
    } catch (e: any) {
      showToast(e.message || 'Lỗi khi gửi duyệt khóa học.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReviseCourse = async (id: number) => {
    setLoading(true);
    try {
      const success = await api.reviseCourse(id);
      if (success) {
        showToast('Khóa học đã được chuyển về trạng thái Bản nháp để sửa đổi.');
        loadCourseDetail(id);
      }
    } catch (e: any) {
      showToast(e.message || 'Lỗi khi thực hiện.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Chapter Actions
  const handleOpenChapterModal = (ch?: Chapter) => {
    if (ch) {
      setChapterModalId(ch.id);
      setChapterModalTitle(ch.title);
      setChapterModalSort(ch.sortOrder);
    } else {
      setChapterModalId(null);
      setChapterModalTitle('');
      setChapterModalSort((activeCourse?.chapters.length || 0) + 1);
    }
    setChapterModalVisible(true);
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse || !chapterModalTitle.trim()) return;

    setLoading(true);
    try {
      if (chapterModalId) {
        // Edit (simulate mock update)
        if (getOfflineMode()) {
          const mock = JSON.parse(localStorage.getItem('vr_mock_courses') || '[]');
          const cIdx = mock.findIndex((c: any) => c.id === activeCourse.id);
          if (cIdx !== -1) {
            const chIdx = mock[cIdx].chapters.findIndex((ch: any) => ch.id === chapterModalId);
            if (chIdx !== -1) {
              mock[cIdx].chapters[chIdx].title = chapterModalTitle;
              mock[cIdx].chapters[chIdx].sortOrder = chapterModalSort;
              mock[cIdx].chapters.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
              localStorage.setItem('vr_mock_courses', JSON.stringify(mock));
            }
          }
        }
        showToast('Cập nhật chương học thành công!');
      } else {
        const newChId = await api.createChapter(activeCourse.id, chapterModalTitle, chapterModalSort);
        showToast('Đã thêm chương học mới thành công!');
        setSelectedChapterId(newChId);
      }
      setChapterModalVisible(false);
      loadCourseDetail(activeCourse.id);
    } catch (e: any) {
      showToast(e.message || 'Lỗi khi lưu chương.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Lesson Actions
  const handleOpenAddLesson = (type: string) => {
    if (!selectedChapterId) return;
    setAddLessonDropdownVisible(false);
    setEditingLessonId(null);
    setEditingLessonType(type);
    
    // Clear forms
    setLessonTitle('');
    setLessonSortOrder(1);
    setTheoryContent('');
    setTheoryDuration(300);
    setVideoDuration(300);
    setVideoKey('');
    setVideoType('video/mp4');
    setQuizPass(80);
    setQuizQuestions([]);
    setUploadProgress(null);

    setActivePage('lesson-form');
  };

  const handleOpenEditLesson = async (l: LessonSummary) => {
    setLoading(true);
    try {
      const detail = await api.getLessonDetail(l.id);
      setEditingLessonId(l.id);
      setEditingLessonType(l.type);
      setLessonTitle(detail.title);
      setLessonSortOrder(detail.sortOrder);
      
      // Load type specific fields
      if (l.type === 'Theory') {
        setTheoryContent(detail.content || '');
        setTheoryDuration(detail.durationSeconds || 300);
      } else if (l.type === 'Video') {
        setTheoryContent(detail.content || '');
        setVideoDuration(detail.durationSeconds || 300);
        setVideoKey(detail.videoObjectKey || '');
        setVideoType(detail.videoContentType || 'video/mp4');
      } else if (l.type === 'Quiz') {
        setQuizPass(detail.passPercentage || 80);
        setQuizQuestions(detail.quizQuestions || []);
      }
      setUploadProgress(null);
      setActivePage('lesson-form');
    } catch (e: any) {
      showToast(e.message || 'Không thể tải thông tin bài học.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!activeCourse) return;
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này không?')) return;

    setLoading(true);
    try {
      const success = await api.deleteLesson(id);
      if (success) {
        showToast('Đã xóa bài học thành công.');
        loadCourseDetail(activeCourse.id);
      }
    } catch (e: any) {
      showToast(e.message || 'Lỗi khi xóa bài học.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Video upload simulation
  const handleSimulateVideoUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) {
          clearInterval(interval);
          return 0;
        }
        if (prev >= 100) {
          clearInterval(interval);
          setVideoKey(`videos/lesson_lecture_${Date.now()}.mp4`);
          showToast('Giả lập tải video lên S3 thành công!', 'success');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Quiz Question actions
  const handleAddQuizQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now(),
      sortOrder: quizQuestions.length + 1,
      prompt: 'Câu hỏi mới của bạn?',
      options: [
        { id: Date.now() + 1, sortOrder: 1, text: 'Lựa chọn A' },
        { id: Date.now() + 2, sortOrder: 2, text: 'Lựa chọn B' },
        { id: Date.now() + 3, sortOrder: 3, text: 'Lựa chọn C' },
        { id: Date.now() + 4, sortOrder: 4, text: 'Lựa chọn D' }
      ],
      correctOptionId: Date.now() + 1
    };
    setQuizQuestions(prev => [...prev, newQuestion]);
  };

  const handleUpdateQuestionPrompt = (qId: number, prompt: string) => {
    setQuizQuestions(prev => prev.map(q => q.id === qId ? { ...q, prompt } : q));
  };

  const handleUpdateOptionText = (qId: number, oId: number, text: string) => {
    setQuizQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: q.options.map(o => o.id === oId ? { ...o, text } : o)
        };
      }
      return q;
    }));
  };

  const handleSetCorrectOption = (qId: number, oId: number) => {
    setQuizQuestions(prev => prev.map(q => q.id === qId ? { ...q, correctOptionId: oId } : q));
  };

  const handleRemoveQuestion = (qId: number) => {
    setQuizQuestions(prev => prev.filter(q => q.id !== qId));
  };

  // Submit Lesson Form
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId || !activeCourse) return;
    if (!lessonTitle.trim()) {
      showToast('Vui lòng điền tiêu đề bài học.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const body: Omit<LessonDetail, 'id'> = {
        sortOrder: Number(lessonSortOrder),
        title: lessonTitle,
        type: editingLessonType,
        content: editingLessonType === 'Theory' ? theoryContent : editingLessonType === 'Video' ? theoryContent : undefined,
        durationSeconds: editingLessonType === 'Theory' ? Number(theoryDuration) : editingLessonType === 'Video' ? Number(videoDuration) : undefined,
        videoObjectKey: editingLessonType === 'Video' ? videoKey : undefined,
        videoContentType: editingLessonType === 'Video' ? videoType : undefined,
        quizQuestions: editingLessonType === 'Quiz' ? quizQuestions : undefined,
        passPercentage: editingLessonType === 'Quiz' ? Number(quizPass) : undefined
      };

      if (editingLessonId) {
        await api.updateLesson(editingLessonId, body);
        showToast('Cập nhật bài học thành công!');
      } else {
        await api.createLesson(selectedChapterId, body);
        showToast('Tạo bài học mới thành công!');
      }
      setActivePage('course-detail');
      loadCourseDetail(activeCourse.id);
    } catch (e: any) {
      showToast(e.message || 'Lỗi khi lưu bài học.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter tab statistics helper
  const countCoursesByStatus = (status: string) => {
    return courses.filter(c => c.status === status).length;
  };

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            </span>
            <span className="toast-message">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Đang xử lý dữ liệu...</p>
        </div>
      )}

      {/* LOGIN SCREEN */}
      {activePage === 'login' && (
        <section className="auth-section">
          <div className="auth-card">
            <div className="auth-brand">
              <div className="logo-icon">🎵</div>
              <h1>VRhythm</h1>
              <p>Teacher Portal</p>
            </div>
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>Email công việc</label>
                <div className="input-icon-wrapper">
                  <input
                    type="email"
                    placeholder="giao-vien@vrhythm.vn"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Mật khẩu</label>
                <div className="input-icon-wrapper">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-block">Đăng nhập</button>
            </form>
            <div className="auth-footer">
              <p className="warning-text">
                <AlertTriangle size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Hệ thống chỉ dành cho Giáo viên. Sinh viên không được phép đăng nhập.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* MAIN PORTAL AREA */}
      {activePage !== 'login' && user && (
        <div className="portal-layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-header">
              <span className="logo-icon">🎵</span>
              <span className="logo-text">VRhythm</span>
            </div>
            <div className="user-profile-badge">
              <div className="user-avatar">👤</div>
              <div className="user-info">
                <h4>{user.fullName}</h4>
                <span>{user.role}</span>
              </div>
            </div>
            <nav className="sidebar-nav">
              <a
                href="#"
                className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage('dashboard');
                  loadCourses();
                }}
              >
                <Grid size={18} /> Bảng điều khiển
              </a>
              <a
                href="#"
                className={`nav-item ${activePage === 'course-form' && !editingCourseId ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setEditingCourseId(null);
                  setCourseTitle('');
                  setCourseThumbnail('');
                  setCourseDescription('');
                  setCourseAccess('Free');
                  setCourseInstrument('Đàn Tranh');
                  setActivePage('course-form');
                }}
              >
                <Plus size={18} /> Tạo khóa học mới
              </a>
            </nav>
            <div className="sidebar-footer">
              <button onClick={handleLogout} className="btn btn-logout btn-block">
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="main-content">

            {/* DASHBOARD PAGE */}
            {activePage === 'dashboard' && (
              <section className="page-section">
                <div className="page-header">
                  <div>
                    <h1>Bảng điều khiển</h1>
                    <p className="subtitle">Quản lý lộ trình đào tạo âm nhạc truyền thống của bạn</p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setEditingCourseId(null);
                      setCourseTitle('');
                      setCourseThumbnail('');
                      setCourseDescription('');
                      setCourseAccess('Free');
                      setCourseInstrument('Đàn Tranh');
                      setActivePage('course-form');
                    }}
                  >
                    <Plus size={18} /> Thêm khóa học
                  </button>
                </div>

                {/* Statistics Grid */}
                <div className="stats-grid">
                  <div className="stat-card card-primary">
                    <div className="stat-icon"><GraduationCap size={20} /></div>
                    <div className="stat-details">
                      <h3>{courses.length}</h3>
                      <p>Tổng khóa học</p>
                    </div>
                  </div>
                  <div className="stat-card card-success">
                    <div className="stat-icon"><CheckCircle size={20} /></div>
                    <div className="stat-details">
                      <h3>{countCoursesByStatus('Approved')}</h3>
                      <p>Đã xuất bản</p>
                    </div>
                  </div>
                  <div className="stat-card card-warning">
                    <div className="stat-icon"><Sparkles size={20} /></div>
                    <div className="stat-details">
                      <h3>{countCoursesByStatus('Submitted')}</h3>
                      <p>Đang chờ duyệt</p>
                    </div>
                  </div>
                  <div className="stat-card card-danger">
                    <div className="stat-icon"><AlertTriangle size={20} /></div>
                    <div className="stat-details">
                      <h3>{countCoursesByStatus('Rejected')}</h3>
                      <p>Cần chỉnh sửa</p>
                    </div>
                  </div>
                </div>

                {/* Course List Card */}
                <div className="content-card">
                  <div className="card-header">
                    <h2>Danh sách khóa học</h2>
                    <div className="filter-tabs">
                      {['all', 'Draft', 'Submitted', 'Approved', 'Rejected'].map(status => (
                        <button
                          key={status}
                          className={`tab-btn ${filterTab === status ? 'active' : ''}`}
                          onClick={() => setFilterTab(status)}
                        >
                          {status === 'all' ? 'Tất cả' : status === 'Draft' ? 'Bản nháp' : status === 'Submitted' ? 'Chờ duyệt' : status === 'Approved' ? 'Đã duyệt' : 'Bị từ chối'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="table-container">
                    <table className="course-table">
                      <thead>
                        <tr>
                          <th>Ảnh bìa</th>
                          <th>Tên khóa học</th>
                          <th>Nhạc cụ</th>
                          <th>Quyền truy cập</th>
                          <th>Trạng thái</th>
                          <th style={{ textAlign: 'right' }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses
                          .filter(c => filterTab === 'all' || c.status === filterTab)
                          .map(course => (
                            <tr key={course.id}>
                              <td className="thumbnail-cell">
                                {course.thumbnailUrl ? (
                                  <img src={course.thumbnailUrl} alt={course.title} />
                                ) : (
                                  <div className="thumbnail-placeholder">🎵</div>
                                )}
                              </td>
                              <td style={{ fontWeight: '600' }}>{course.title}</td>
                              <td><span className="badge badge-instrument">{course.instrument}</span></td>
                              <td><span className="badge badge-access">{course.accessType}</span></td>
                              <td>
                                <span className={`badge badge-${course.status.toLowerCase()}`}>
                                  {course.status === 'Draft' ? 'Bản nháp' : course.status === 'Submitted' ? 'Chờ duyệt' : course.status === 'Approved' ? 'Đã duyệt' : 'Từ chối'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => loadCourseDetail(course.id)}
                                >
                                  Quản lý nội dung
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {courses.filter(c => filterTab === 'all' || c.status === filterTab).length === 0 && (
                    <div className="empty-state">
                      <GraduationCap size={40} />
                      <p>Không tìm thấy khóa học nào phù hợp.</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* COURSE DETAIL PAGE */}
            {activePage === 'course-detail' && activeCourse && (
              <section className="page-section">
                <div className="back-nav">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActivePage('dashboard');
                    }}
                  >
                    <ArrowLeft size={16} /> Quay lại Bảng điều khiển
                  </a>
                </div>

                <div className="course-detail-header">
                  <div className="course-meta-top">
                    <span className="badge badge-instrument">{activeCourse.instrument}</span>
                    <span className="badge badge-access">{activeCourse.accessType}</span>
                    <span className={`badge badge-${activeCourse.status.toLowerCase()}`}>
                      {activeCourse.status === 'Draft' ? 'Bản nháp' : activeCourse.status === 'Submitted' ? 'Chờ duyệt' : activeCourse.status === 'Approved' ? 'Đã duyệt' : 'Bị từ chối'}
                    </span>
                  </div>
                  <div className="course-title-row">
                    <h1>{activeCourse.title}</h1>
                    <div className="course-action-buttons">
                      {activeCourse.status === 'Draft' && (
                        <button
                          className="btn btn-primary"
                          onClick={() => handlePublishCourse(activeCourse.id)}
                        >
                          Gửi duyệt khóa học
                        </button>
                      )}
                      {activeCourse.status === 'Rejected' && (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleReviseCourse(activeCourse.id)}
                        >
                          Sửa đổi khóa học
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="course-description-text">{activeCourse.description}</p>

                  {activeCourse.status === 'Rejected' && activeCourse.rejectionReason && (
                    <div className="rejection-box">
                      <h4><AlertTriangle size={16} /> Lý do bị từ chối từ Ban quản trị:</h4>
                      <p>{activeCourse.rejectionReason}</p>
                    </div>
                  )}
                </div>

                <div className="course-structure-grid">
                  {/* Chapters Column */}
                  <div className="content-card">
                    <div className="card-header">
                      <h2>Chương học</h2>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenChapterModal()}
                      >
                        <FolderPlus size={16} /> Thêm chương
                      </button>
                    </div>

                    <div className="chapters-list">
                      {activeCourse.chapters.map(ch => (
                        <div
                          key={ch.id}
                          className={`chapter-item ${selectedChapterId === ch.id ? 'active' : ''}`}
                          onClick={() => setSelectedChapterId(ch.id)}
                        >
                          <div className="chapter-title-box">
                            <span className="chapter-sort-num">{ch.sortOrder}</span>
                            <span className="chapter-title-text">{ch.title}</span>
                          </div>
                          <div className="chapter-actions">
                            <button
                              className="action-icon-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenChapterModal(ch);
                              }}
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {activeCourse.chapters.length === 0 && (
                        <div className="empty-state">
                          <FolderPlus size={40} />
                          <p>Chưa có chương học nào được tạo.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lessons Column */}
                  <div className="content-card">
                    <div className="card-header">
                      <div>
                        <h2>Danh sách bài học</h2>
                        <p className="subtitle">
                          {selectedChapterId
                            ? `Các bài học trong chương ${activeCourse.chapters.find(c => c.id === selectedChapterId)?.title || ''}`
                            : 'Vui lòng chọn hoặc thêm một chương học.'}
                        </p>
                      </div>

                      {selectedChapterId && (
                        <div style={{ position: 'relative' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setAddLessonDropdownVisible(!addLessonDropdownVisible)}
                          >
                            Thêm bài học <ChevronDown size={14} />
                          </button>
                          {addLessonDropdownVisible && (
                            <div className="dropdown-menu">
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleOpenAddLesson('Theory');
                                }}
                              >
                                <FileText size={14} /> Bài Lý thuyết
                              </a>
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleOpenAddLesson('Video');
                                }}
                              >
                                <PlayCircle size={14} /> Video bài giảng
                              </a>
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleOpenAddLesson('Quiz');
                                }}
                              >
                                <HelpCircle size={14} /> Bài Trắc nghiệm
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="lessons-list">
                      {selectedChapterId &&
                        activeCourse.chapters
                          .find(c => c.id === selectedChapterId)
                          ?.lessons.map(l => (
                            <div key={l.id} className="lesson-item">
                              <div className="lesson-left">
                                <div className="lesson-type-icon">
                                  {l.type === 'Theory' ? <FileText size={16} /> : l.type === 'Video' ? <PlayCircle size={16} /> : <HelpCircle size={16} />}
                                </div>
                                <div className="lesson-title-info">
                                  <h4>{l.title}</h4>
                                  <p>Thứ tự: {l.sortOrder} • Loai: {l.type === 'Theory' ? 'Lý thuyết' : l.type === 'Video' ? 'Video' : 'Trắc nghiệm'}</p>
                                </div>
                              </div>
                              <div className="lesson-right">
                                <button className="action-icon-btn" onClick={() => handleOpenEditLesson(l)}>
                                  <Edit size={14} />
                                </button>
                                <button className="action-icon-btn delete-btn" onClick={() => handleDeleteLesson(l.id)}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}

                      {selectedChapterId &&
                        (activeCourse.chapters.find(c => c.id === selectedChapterId)?.lessons.length || 0) === 0 && (
                          <div className="empty-state">
                            <HelpCircle size={40} />
                            <p>Chương học này chưa có bài giảng nào.</p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* COURSE FORM PAGE */}
            {activePage === 'course-form' && (
              <section className="page-section">
                <div className="back-nav">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActivePage(editingCourseId ? 'course-detail' : 'dashboard');
                    }}
                  >
                    <ArrowLeft size={16} /> Quay lại
                  </a>
                </div>

                <div className="content-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
                  <div className="card-header">
                    <h2>Tạo khóa học mới</h2>
                  </div>
                  <form onSubmit={handleCreateOrUpdateCourse} className="portal-form">
                    <div className="form-group">
                      <label>Tên khóa học *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Khóa học Đàn Tranh căn bản"
                        value={courseTitle}
                        onChange={e => setCourseTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Nhạc cụ tuyển chọn *</label>
                        <select value={courseInstrument} onChange={e => setCourseInstrument(e.target.value)} required>
                          <option value="Đàn Tranh">Đàn Tranh</option>
                          <option value="Sáo Trúc">Sáo Trúc</option>
                          <option value="Đàn Bầu">Đàn Bầu</option>
                          <option value="Đàn Tỳ Bà">Đàn Tỳ Bà</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Chế độ truy cập *</label>
                        <select value={courseAccess} onChange={e => setCourseAccess(e.target.value)} required>
                          <option value="Free">Miễn phí (Free)</option>
                          <option value="Premium">Trả phí (Premium)</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>URL Ảnh đại diện khóa học</label>
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={courseThumbnail}
                        onChange={e => setCourseThumbnail(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Mô tả khóa học *</label>
                      <textarea
                        rows={5}
                        placeholder="Giới thiệu nội dung khóa học, kiến thức sinh viên sẽ đạt được..."
                        value={courseDescription}
                        onChange={e => setCourseDescription(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setActivePage(editingCourseId ? 'course-detail' : 'dashboard')}
                      >
                        Hủy bỏ
                      </button>
                      <button type="submit" className="btn btn-primary">Lưu khóa học</button>
                    </div>
                  </form>
                </div>
              </section>
            )}

            {/* LESSON EDITOR FORM PAGE */}
            {activePage === 'lesson-form' && (
              <section className="page-section">
                <div className="back-nav">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (activeCourse) setActivePage('course-detail');
                    }}
                  >
                    <ArrowLeft size={16} /> Quay lại chi tiết khóa học
                  </a>
                </div>

                <div className="content-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <div className="card-header">
                    <div>
                      <h2>{editingLessonId ? 'Cập nhật bài học' : 'Thêm bài học mới'}</h2>
                      <p className="subtitle">Kiểu bài học: {editingLessonType === 'Theory' ? 'Lý thuyết' : editingLessonType === 'Video' ? 'Video' : 'Trắc nghiệm'}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveLesson} className="portal-form">
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Tiêu đề bài học *</label>
                        <input
                          type="text"
                          placeholder="Nhập tiêu đề bài học"
                          value={lessonTitle}
                          onChange={e => setLessonTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Thứ tự hiển thị *</label>
                        <input
                          type="number"
                          value={lessonSortOrder}
                          onChange={e => setLessonSortOrder(Number(e.target.value))}
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    {/* THEORY FIELDS */}
                    {editingLessonType === 'Theory' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="form-group">
                          <label>Thời gian đọc dự kiến (Giây)</label>
                          <input
                            type="number"
                            value={theoryDuration}
                            onChange={e => setTheoryDuration(Number(e.target.value))}
                            min="0"
                          />
                        </div>
                        <div className="form-group">
                          <label>Nội dung bài lý thuyết *</label>
                          <textarea
                            rows={10}
                            placeholder="Soạn thảo kiến thức nhạc lý tại đây..."
                            value={theoryContent}
                            onChange={e => setTheoryContent(e.target.value)}
                            required
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {/* VIDEO FIELDS */}
                    {editingLessonType === 'Video' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="form-group">
                          <label>Thời lượng video (Giây) *</label>
                          <input
                            type="number"
                            value={videoDuration}
                            onChange={e => setVideoDuration(Number(e.target.value))}
                            min="0"
                            required
                          />
                        </div>
                        <div className="form-grid-2">
                          <div className="form-group">
                            <label>S3 Object Key *</label>
                            <input
                              type="text"
                              value={videoKey}
                              onChange={e => setVideoKey(e.target.value)}
                              placeholder="videos/lesson-video.mp4"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Định dạng Video *</label>
                            <input
                              type="text"
                              value={videoType}
                              onChange={e => setVideoType(e.target.value)}
                              placeholder="video/mp4"
                              required
                            />
                          </div>
                        </div>

                        <div className="video-upload-box">
                          <UploadCloud size={32} className="upload-icon" />
                          <h4>Giả lập Tải video lên Amazon S3 Storage</h4>
                          <p>Hệ thống tự động liên kết S3 Upload URL sau khi upload hoàn thành</p>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={handleSimulateVideoUpload}
                          >
                            Bắt đầu upload video thử nghiệm
                          </button>
                          {uploadProgress !== null && (
                            <div className="upload-progress-wrapper" style={{ display: 'block' }}>
                              <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                              </div>
                              <span id="upload-status-text">Đang tải video: {uploadProgress}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* QUIZ FIELDS */}
                    {editingLessonType === 'Quiz' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="form-group">
                          <label>Tỉ lệ câu đúng tối thiểu để đỗ (%) *</label>
                          <input
                            type="number"
                            value={quizPass}
                            onChange={e => setQuizPass(Number(e.target.value))}
                            min="0"
                            max="100"
                            required
                          />
                        </div>

                        <div className="quiz-questions-section">
                          <div className="section-header-row">
                            <h3>Câu hỏi trắc nghiệm</h3>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={handleAddQuizQuestion}
                            >
                              Thêm câu hỏi
                            </button>
                          </div>

                          <div className="questions-list">
                            {quizQuestions.map((q, qIdx) => (
                              <div key={q.id} className="question-card">
                                <div className="question-header">
                                  <h4>Câu hỏi #{qIdx + 1}</h4>
                                  <button
                                    type="button"
                                    className="action-icon-btn delete-btn"
                                    onClick={() => handleRemoveQuestion(q.id)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <div className="form-group" style={{ marginBottom: '14px' }}>
                                  <input
                                    type="text"
                                    value={q.prompt}
                                    onChange={e => handleUpdateQuestionPrompt(q.id, e.target.value)}
                                    placeholder="Nội dung câu hỏi?"
                                    required
                                  />
                                </div>
                                <div className="options-grid">
                                  {q.options.map(opt => (
                                    <div
                                      key={opt.id}
                                      className={`option-input-wrapper ${q.correctOptionId === opt.id ? 'correct-answer' : ''}`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={q.correctOptionId === opt.id}
                                        onChange={() => handleSetCorrectOption(q.id, opt.id)}
                                      />
                                      <input
                                        type="text"
                                        value={opt.text}
                                        onChange={e => handleUpdateOptionText(q.id, opt.id, e.target.value)}
                                        placeholder="Đáp án..."
                                        required
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}

                            {quizQuestions.length === 0 && (
                              <div className="empty-state">
                                <HelpCircle size={30} />
                                <p>Chưa có câu hỏi trắc nghiệm nào. Hãy nhấn nút "Thêm câu hỏi".</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                          if (activeCourse) setActivePage('course-detail');
                        }}
                      >
                        Hủy bỏ
                      </button>
                      <button type="submit" className="btn btn-primary">Lưu bài học</button>
                    </div>
                  </form>
                </div>
              </section>
            )}

          </main>
        </div>
      )}

      {/* CHAPTER MODAL */}
      {chapterModalVisible && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{chapterModalId ? 'Cập nhật chương học' : 'Thêm chương học mới'}</h3>
              <button className="modal-close" onClick={() => setChapterModalVisible(false)}><ArrowLeft size={16} /></button>
            </div>
            <form onSubmit={handleSaveChapter}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Tên chương học *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chương I: Lý thuyết cơ bản"
                  value={chapterModalTitle}
                  onChange={e => setChapterModalTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Thứ tự hiển thị chương *</label>
                <input
                  type="number"
                  value={chapterModalSort}
                  onChange={e => setChapterModalSort(Number(e.target.value))}
                  min="1"
                  required
                />
              </div>
              <div className="form-actions" style={{ border: 'none', paddingTop: 0 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setChapterModalVisible(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">Lưu chương</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
