import { useEffect, useState } from 'react';
import './instrument-pages.css';
import { BambooFluteArticle } from './components/BambooFluteArticle';
import { LandingPage } from './components/landing/LandingPage';
import { AlertCircle, ArrowLeft, ArrowRight, Award, BookOpen, CheckCircle2, Compass, Landmark, LogOut, Mail, Music2, Play, RefreshCw, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { InstrumentLearning } from './components/InstrumentLearning';
import { AuthPanel } from './components/AuthPanel';
import { Header } from './components/Header';
import { ExplorePage } from './components/ExplorePage';
import { InstrumentStory } from './components/InstrumentStory';
import { useScrollReveal } from './components/useScrollReveal';
import { LessonPlayer } from './components/LessonPlayer';
import { instruments, type Instrument } from './data/mock';
import { api, authStorage, courseErrorMessage, ApiError, type AuthResponse, type CourseSummary, type LearnerCourseSummary } from './services/api';

type View = 'home' | 'explore' | 'learn' | 'profile' | 'auth' | 'lesson';
type LessonRoute = { courseId: number; chapterId: number; lessonId: number };
const defaultLessonRoute: LessonRoute = { courseId: 1, chapterId: 1, lessonId: 1 };

const routeForView = (view: View, authMode: 'login' | 'register' = 'login') => {
  if (view === 'auth') return authMode === 'register' ? '/register' : '/login';
  return view === 'home' ? '/' : `/${view}`;
};

const viewFromPath = (path: string): { view: View; authMode: 'login' | 'register' } => {
  if (path === '/explore' || path.startsWith('/explore/')) return { view: 'explore', authMode: 'login' };
  if (path === '/learn' || path.startsWith('/learn/')) return { view: 'learn', authMode: 'login' };
  if (path === '/profile') return { view: 'profile', authMode: 'login' };
  if (path === '/lesson' || path.startsWith('/lesson/')) return { view: 'lesson', authMode: 'login' };
  if (path === '/register') return { view: 'auth', authMode: 'register' };
  if (path === '/login') return { view: 'auth', authMode: 'login' };
  return { view: 'home', authMode: 'login' };
};

export default function App() {
  const initialRoute = viewFromPath(window.location.pathname);
  const [view, setView] = useState<View>(initialRoute.view);
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialRoute.authMode);
  const [pathname, setPathname] = useState(window.location.pathname);
  const selectedInstrument = instruments.find(item => item.id === pathname.split('/')[2]);
  const isInstrumentRoute = /^\/(explore|learn)\//.test(pathname);
  const [authUser, setAuthUser] = useState<AuthResponse | null>(() => authStorage.read());
  const [courses, setCourses] = useState<Array<CourseSummary | LearnerCourseSummary>>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState('');
  const [lessonRoute, setLessonRoute] = useState<LessonRoute>(() => parseLessonRoute(window.location.pathname));
  const navigate = (nextView: View, nextAuthMode = authMode) => {
    const nextPath = routeForView(nextView, nextAuthMode);
    if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath);
    setView(nextView);
    setPathname(nextPath);
    window.scrollTo(0, 0);
    setAuthMode(nextAuthMode);
  };
  const openLesson = (nextLessonRoute: LessonRoute = defaultLessonRoute) => {
    const nextPath = `/lesson/${nextLessonRoute.courseId}/chapter/${nextLessonRoute.chapterId}/lesson/${nextLessonRoute.lessonId}`;
    if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath);
    setLessonRoute(nextLessonRoute);
    setView('lesson');
  };
  const loadCourses = async () => {
    setCoursesLoading(true);
    setCoursesError('');
    try {
      setCourses(authUser ? await api.getLearnerCourses() : await api.getCourses());
    } catch (error) {
      setCourses([]);
      setCoursesError(courseErrorMessage(error));
    } finally {
      setCoursesLoading(false);
    }
  };
  useEffect(() => { if (view === 'learn') void loadCourses(); }, [view, authUser?.token]);
  useEffect(() => {
    const handlePopState = () => { setPathname(window.location.pathname); const next = viewFromPath(window.location.pathname); setView(next.view); setAuthMode(next.authMode); setLessonRoute(parseLessonRoute(window.location.pathname)); };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const openAuth = (mode: 'login' | 'register' = 'login') => navigate('auth', mode);
  const signIn = async (data: { fullName?: string; email: string; password: string; confirmPassword?: string }) => { const response = authMode === 'login' ? await api.login(data) : await api.register({ fullName: data.fullName ?? 'Người học VRhythm', email: data.email, password: data.password, confirmPassword: data.confirmPassword ?? '' }); authStorage.write(response); setAuthUser(response); const returnTo = sessionStorage.getItem('vrhythm_return_to'); sessionStorage.removeItem('vrhythm_return_to'); if (returnTo && instruments.some(item => returnTo === `/learn/${item.id}`)) window.location.assign(returnTo); else navigate('learn'); };
  const signOut = () => { authStorage.clear(); setAuthUser(null); navigate('home'); };
  const supportSurface = !['home', 'explore'].includes(view) && !(view === 'learn' && !isInstrumentRoute);
  return <div className={['app-shell', 'landing-shell', supportSurface ? 'support-shell' : ''].join(' ')}><Header active={view} loggedIn={Boolean(authUser)} onNavigate={value => navigate(value as View)} onSignOut={signOut} />
    {view === 'home' && <LandingPage />}
    {isInstrumentRoute && !selectedInstrument && <main className="page"><div className="section-kicker"><Sparkles size={14} /> Trang không tồn tại</div><h1>Không tìm thấy nhạc cụ</h1><a href="/explore">Quay lại Khám phá</a></main>}
    {view === 'explore' && !isInstrumentRoute && <ExplorePage />}
    {view === 'explore' && selectedInstrument && <InstrumentPage instrument={selectedInstrument} />}
    {view === 'learn' && selectedInstrument && <InstrumentLearning instrument={selectedInstrument} user={authUser} onAuth={() => { sessionStorage.setItem('vrhythm_return_to', pathname); openAuth('login'); }} onLesson={openLesson} />}
    {view === 'learn' && !isInstrumentRoute && <Learn user={authUser} courses={courses} loading={coursesLoading} error={coursesError} onAuth={() => openAuth('login')} onOpenLesson={openLesson} onRefresh={loadCourses} />}
    {view === 'profile' && <Profile user={authUser} onAuth={() => openAuth('login')} onSignOut={signOut} onNavigate={navigate} onOpenLesson={openLesson} />}
    {view === 'lesson' && <LessonPlayer route={lessonRoute} onBack={() => navigate('learn')} onOpenLesson={openLesson} />}
    {view === 'auth' && <main className="page"><AuthPanel mode={authMode} onModeChange={mode => navigate('auth', mode)} onSubmit={signIn} /></main>}
  </div>;
}

function parseLessonRoute(path: string): LessonRoute {
  const match = path.match(/^\/lesson\/(\d+)\/chapter\/(\d+)\/lesson\/(\d+)/);
  return match ? { courseId: Number(match[1]), chapterId: Number(match[2]), lessonId: Number(match[3]) } : defaultLessonRoute;
}

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase().trim();

function Learn({ user, courses, loading, error, onOpenLesson, onRefresh }: { user: AuthResponse | null; courses: Array<CourseSummary | LearnerCourseSummary>; loading: boolean; error: string; onAuth: () => void; onOpenLesson: (route?: LessonRoute) => void; onRefresh: () => Promise<void> }) {
  const root = useScrollReveal('.learning-steps li, .learning-catalog-heading, .learning-card, .learning-closing');
  const enrolledCourses = courses.filter((c): c is LearnerCourseSummary => 'isEnrolled' in c && Boolean(c.isEnrolled));
  return <main className="page learn-page learn-editorial" ref={root}>
    <section className="learning-intro">
      <div>

        <h1 className="learn-editorial-title">
          <span>Thanh âm bạn yêu</span>
          <em>Hành trình<br />bạn chọn</em>
        </h1>
        <p>Chọn nhạc cụ, tìm khóa học phù hợp và bắt đầu theo nhịp của riêng bạn</p>
        <a className="primary" href="#chon-nhac-cu">Chọn nhạc cụ để học <ArrowRight size={18} /></a>
      </div>

    </section>
    {user && enrolledCourses.length > 0 && (
      <section className="learning-enrolled-section" aria-label="Khóa học của bạn">
        <div className="learning-enrolled-header">
          <div>
            <span className="section-kicker"><Sparkles size={14} /> Tiếp tục học tập</span>
            <h2>Khóa học của bạn</h2>
            <p>Nhanh chóng quay lại lộ trình học nhạc cụ bạn đã đăng ký</p>
          </div>
        </div>
        <div className="profile-courses-grid">
          {enrolledCourses.map(course => {
            const instId = instruments.find(item => normalize(item.name) === normalize(course.instrument))?.id;
            return (
              <article className="profile-course-card" key={course.id}>
                <div className="profile-course-card-top">
                  <span className="profile-course-inst-tag"><Music2 size={13} /> {course.instrument}</span>
                  <span className={`profile-course-status-badge ${course.isCompleted ? 'completed' : 'in-progress'}`}>
                    {course.isCompleted ? <CheckCircle2 size={12} /> : <Sparkles size={12} />}
                    {course.isCompleted ? 'Đã hoàn thành' : 'Đang học'}
                  </span>
                </div>
                <div className="profile-course-card-body">
                  <h3>{course.title}</h3>
                  <p>{course.description || `Lộ trình luyện tập nhạc cụ ${course.instrument} cùng VRhythm.`}</p>
                  <div className="profile-course-progress-wrap">
                    <div className="profile-course-progress-label">
                      <span>Tiến độ hoàn thành</span>
                      <strong>{course.progressPercent}%</strong>
                    </div>
                    <div className="profile-course-progress-bar" role="progressbar" aria-valuenow={course.progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ khóa học ${course.title}`}>
                      <div className="profile-course-progress-fill" style={{ width: `${Math.min(100, Math.max(0, course.progressPercent))}%` }} />
                    </div>
                    <div className="profile-course-lessons-count">
                      <span>Đã hoàn thành</span>
                      <span><strong>{course.completedLessons}</strong> / {course.totalLessons} bài học</span>
                    </div>
                  </div>
                  <div className="profile-course-card-action">
                    <button
                      type="button"
                      className={course.isCompleted ? 'secondary' : 'primary'}
                      onClick={() => {
                        if (course.nextChapterId && course.nextLessonId) {
                          onOpenLesson({ courseId: course.id, chapterId: course.nextChapterId, lessonId: course.nextLessonId });
                        } else if (instId) {
                          window.location.assign(`/learn/${instId}`);
                        }
                      }}
                    >
                      {course.isCompleted ? (
                        <>Xem lại bài học <ArrowRight size={15} /></>
                      ) : (
                        <><Play size={15} fill="currentColor" /> Tiếp tục học</>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    )}
    <section id="chon-nhac-cu" className="learning-catalog">
      <div className="learning-catalog-heading"><div><h2>Bạn muốn học nhạc cụ nào?</h2></div></div>
      {loading && <p className="learning-notice" role="status">Đang cập nhật danh sách khóa học…</p>}
      {error && <div className="learning-notice" role="alert"><span>{error} Bạn vẫn có thể chọn nhạc cụ bên dưới</span><button className="text-button" onClick={() => void onRefresh()}>Thử lại</button></div>}
      <div className="learning-grid">{instruments.map(instrument => {
        const count = courses.filter(course => normalize(course.instrument) === normalize(instrument.name)).length;
        return <article className="learning-card" key={instrument.id}>
          <div className="learning-card-art"><img src={`/images/generated/carousel-${instrument.id}.webp`} alt={`${instrument.name} — minh họa`} loading="lazy" /></div>
          <div className="learning-card-content"><h3>{instrument.name}</h3><p>{instrument.description.replace(/\.$/, '')}</p><div className="learning-card-footer">{!loading && !error && <small>{count > 0 ? `${count} khóa học đang mở` : 'Chưa có khóa học đang mở'}</small>}<a href={`/learn/${instrument.id}`} aria-label={`Xem lộ trình học ${instrument.name}`}>Xem lộ trình <ArrowRight size={18} /></a></div></div>
        </article>;
      })}</div>
      <p className="learning-image-note">Ảnh nhạc cụ là minh họa, không dùng làm sơ đồ cấu tạo</p>
    </section>
    <footer className="ex-footer"><a href="/">VRhythm</a><span>Di sản · Nhịp điệu · Công nghệ</span><a href="/explore">Khám phá nhạc cụ ↗</a></footer>
  </main>;
}

function Profile({
  user: cachedUser,
  onAuth,
  onSignOut,
  onNavigate,
  onOpenLesson,
}: {
  user: AuthResponse | null;
  onAuth: () => void;
  onSignOut: () => void;
  onNavigate: (view: View) => void;
  onOpenLesson: (route?: LessonRoute) => void;
}) {
  const [profile, setProfile] = useState(cachedUser);
  const [profileError, setProfileError] = useState('');
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [retry, setRetry] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [learnerCourses, setLearnerCourses] = useState<LearnerCourseSummary[]>([]);

  useEffect(() => {
    let active = true;
    setProfile(cachedUser);
    setProfileError('');
    setIsSessionExpired(false);

    if (cachedUser) {
      setRefreshing(true);
      const profilePromise = api.getProfile().then(value => {
        if (active) {
          setProfile({ ...cachedUser, ...value });
          setProfileError('');
        }
      }).catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          setIsSessionExpired(true);
          setProfileError('Phiên đăng nhập đã hết hạn. Đang hiển thị thông tin lưu trên thiết bị, vui lòng đăng nhập lại để cập nhật.');
        } else {
          setIsSessionExpired(false);
          setProfileError('Chưa thể đồng bộ hồ sơ mới nhất từ máy chủ. Đang hiển thị thông tin lưu trên thiết bị.');
        }
      });

      const coursesPromise = api.getLearnerCourses().then(list => {
        if (active && Array.isArray(list)) setLearnerCourses(list);
      }).catch(() => {});

      Promise.allSettled([profilePromise, coursesPromise]).finally(() => {
        if (active) setRefreshing(false);
      });
    }

    return () => { active = false; };
  }, [cachedUser, retry]);
  const user = profile;
  if (!user) return <main className="page profile-page"><section className="profile-empty"><div className="section-kicker"><Sparkles size={14} /> Hồ sơ người học</div><UserRound size={38} /><h1>Hồ sơ người học</h1><p>Đăng nhập để xem thông tin tài khoản của bạn.</p><button className="primary" onClick={onAuth}>Đăng nhập</button></section></main>;
  const initials = user.fullName.split(' ').filter(Boolean).slice(-2).map(part => part[0]).join('').toLocaleUpperCase('vi');
  const enrolledCourses = learnerCourses.filter(c => c.isEnrolled);
  const completedLessons = enrolledCourses.reduce((sum, c) => sum + (c.completedLessons || 0), 0);
  const avgProgress = enrolledCourses.length
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + (c.progressPercent || 0), 0) / enrolledCourses.length)
    : 0;

  const handleResumeCourse = (course: LearnerCourseSummary) => {
    if (course.nextChapterId && course.nextLessonId) {
      onOpenLesson({ courseId: course.id, chapterId: course.nextChapterId, lessonId: course.nextLessonId });
      return;
    }
    const instId = instruments.find(item => normalize(item.name) === normalize(course.instrument))?.id;
    if (instId) {
      window.location.assign(`/learn/${instId}`);
      return;
    }
    onNavigate('learn');
  };

  return (
    <main className="page profile-page">
      <section className="profile-hero">
        <div className="profile-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="Ảnh đại diện" /> : initials}</div>
        <div className="profile-hero-info">
          <div className="profile-kicker-row">
            <span className="section-kicker"><Sparkles size={14} /> Hồ sơ người học</span>
            <span className="profile-role-badge">{user.role === 'Learner' ? 'Học viên VRhythm' : user.role}</span>
          </div>
          <h1>{user.fullName}</h1>
          <p>Thông tin tài khoản VRhythm · Cùng giữ gìn giai điệu dân tộc.</p>
        </div>
        <div className="profile-hero-actions">
          <button className="primary profile-hero-btn" onClick={() => onNavigate('learn')}>
            Tiếp tục học <ArrowRight size={16} />
          </button>
          <button className="profile-secondary-btn" onClick={onSignOut}>
            <LogOut size={15} /> Đăng xuất
          </button>
        </div>
      </section>

      {profileError && (
        <div className="profile-alert" role="alert">
          <div className="profile-alert-content">
            <AlertCircle size={20} className="profile-alert-icon" />
            <div className="profile-alert-text">
              <strong>{isSessionExpired ? 'Phiên đăng nhập đã hết hạn' : 'Đồng bộ hồ sơ'}</strong>
              <p>{profileError}</p>
            </div>
          </div>
          <button
            type="button"
            className="profile-alert-btn"
            onClick={() => (isSessionExpired ? onAuth() : setRetry(n => n + 1))}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-icon' : ''} />
            {isSessionExpired ? 'Đăng nhập lại' : (refreshing ? 'Đang thử lại...' : 'Thử lại')}
          </button>
        </div>
      )}

      <section className="profile-stats-grid" aria-label="Thống kê học tập">
        <div className="profile-stat-card">
          <div className="profile-stat-icon"><BookOpen size={20} /></div>
          <div>
            <div className="profile-stat-val">{enrolledCourses.length}</div>
            <div className="profile-stat-lbl">Khóa học đăng ký</div>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-icon"><CheckCircle2 size={20} /></div>
          <div>
            <div className="profile-stat-val">{completedLessons}</div>
            <div className="profile-stat-lbl">Bài học hoàn thành</div>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-icon"><Award size={20} /></div>
          <div>
            <div className="profile-stat-val">{avgProgress}%</div>
            <div className="profile-stat-lbl">Tiến độ tổng thể</div>
          </div>
        </div>
      </section>

      <section className="profile-courses" aria-label="Khóa học của tôi">
        <div className="profile-courses-header">
          <div>
            <span className="section-kicker"><BookOpen size={14} /> Khóa học của tôi</span>
            <h2>Tiến độ học tập</h2>
            <p>Theo dõi các khóa học bạn đã đăng ký và tiếp tục bài học dang dở.</p>
          </div>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="profile-courses-grid">
            {enrolledCourses.map(course => (
              <article className="profile-course-card" key={course.id}>
                <div className="profile-course-card-top">
                  <span className="profile-course-inst-tag"><Music2 size={13} /> {course.instrument}</span>
                  <span className={`profile-course-status-badge ${course.isCompleted ? 'completed' : 'in-progress'}`}>
                    {course.isCompleted ? <CheckCircle2 size={12} /> : <Sparkles size={12} />}
                    {course.isCompleted ? 'Đã hoàn thành' : 'Đang học'}
                  </span>
                </div>
                <div className="profile-course-card-body">
                  <h3>{course.title}</h3>
                  <p>{course.description || `Lộ trình luyện tập nhạc cụ ${course.instrument} cùng VRhythm.`}</p>
                  <div className="profile-course-progress-wrap">
                    <div className="profile-course-progress-label">
                      <span>Tiến độ hoàn thành</span>
                      <strong>{course.progressPercent}%</strong>
                    </div>
                    <div className="profile-course-progress-bar" role="progressbar" aria-valuenow={course.progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ khóa học ${course.title}`}>
                      <div className="profile-course-progress-fill" style={{ width: `${Math.min(100, Math.max(0, course.progressPercent))}%` }} />
                    </div>
                    <div className="profile-course-lessons-count">
                      <span>Đã hoàn thành</span>
                      <span><strong>{course.completedLessons}</strong> / {course.totalLessons} bài học</span>
                    </div>
                  </div>
                  <div className="profile-course-card-action">
                    <button
                      type="button"
                      className={course.isCompleted ? 'secondary' : 'primary'}
                      onClick={() => handleResumeCourse(course)}
                    >
                      {course.isCompleted ? (
                        <>Xem lại bài học <ArrowRight size={15} /></>
                      ) : (
                        <><Play size={15} fill="currentColor" /> Tiếp tục học</>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="profile-courses-empty">
            <div className="profile-empty-icon"><BookOpen size={24} /></div>
            <h3>Bạn chưa đăng ký khóa học nào</h3>
            <p>Hãy khám phá các nhạc cụ dân tộc và tham gia khóa học đầu tiên để bắt đầu hành trình âm nhạc của bạn cùng VRhythm.</p>
            <button type="button" className="primary" onClick={() => onNavigate('learn')}>
              Khám phá khóa học ngay <ArrowRight size={15} />
            </button>
          </div>
        )}
      </section>

      <section className="profile-details" aria-label="Chi tiết tài khoản">
        <div><Mail /><span>Email tài khoản</span><strong>{user.email}</strong></div>
        <div><ShieldCheck /><span>Vai trò hệ thống</span><strong>{user.role === 'Learner' ? 'Người học' : user.role}</strong></div>
        <div><UserRound /><span>Mã người dùng</span><strong>#{user.userId}</strong></div>
      </section>

      <section className="profile-journey">
        <div className="profile-journey-text">
          <span className="section-kicker"><Compass size={14} /> Khám phá nhạc cụ dân tộc</span>
          <h2>Tìm hiểu 6 nhạc cụ truyền thống</h2>
          <p>Khám phá âm sắc, câu chuyện lịch sử và cấu tạo của Sáo trúc, Đàn bầu, Đàn tranh, Đàn nguyệt, Đàn tỳ bà và Đàn nhị.</p>
        </div>
        <button className="primary" onClick={() => onNavigate('explore')}>
          Khám phá ngay <ArrowRight size={16} />
        </button>
      </section>
    </main>
  );
}

function InstrumentPage({ instrument }: { instrument: Instrument }) {
  return instrument.id === 'sao' ? <BambooFluteArticle /> : <InstrumentStory instrument={instrument} />;
}
