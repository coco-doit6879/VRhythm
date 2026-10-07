import { useEffect, useState } from 'react';
import './instrument-pages.css';
import { BambooFluteArticle } from './components/BambooFluteArticle';
import { LandingPage } from './components/landing/LandingPage';
import { ArrowLeft, ArrowRight, Landmark, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { InstrumentLearning } from './components/InstrumentLearning';
import { AuthPanel } from './components/AuthPanel';
import { Header } from './components/Header';
import { ExplorePage } from './components/ExplorePage';
import { InstrumentStory } from './components/InstrumentStory';
import { useScrollReveal } from './components/useScrollReveal';
import { LessonPlayer } from './components/LessonPlayer';
import { FluteLabPage } from './components/FluteLabPage';
import { instruments, type Instrument } from './data/mock';
import { api, authStorage, courseErrorMessage, type AuthResponse, type CourseSummary, type LearnerCourseSummary } from './services/api';

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
  const signIn = async (data: { fullName?: string; email: string; password: string }) => { const response = authMode === 'login' ? await api.login(data) : await api.register({ fullName: data.fullName ?? 'Người học VRhythm', email: data.email, password: data.password }); authStorage.write(response); setAuthUser(response); const returnTo = sessionStorage.getItem('vrhythm_return_to'); sessionStorage.removeItem('vrhythm_return_to'); if (returnTo && instruments.some(item => returnTo === `/learn/${item.id}`)) window.location.assign(returnTo); else navigate('learn'); };
  const signOut = () => { authStorage.clear(); setAuthUser(null); navigate('home'); };
  const supportSurface = !['home', 'explore'].includes(view) && !(view === 'learn' && !isInstrumentRoute);
  if (pathname === '/lab/sao') return <FluteLabPage />;
  return <div className={['app-shell', 'landing-shell', supportSurface ? 'support-shell' : ''].join(' ')}><Header active={view} loggedIn={Boolean(authUser)} onNavigate={value => navigate(value as View)} onSignOut={signOut} />
    {view === 'home' && <LandingPage />}
    {isInstrumentRoute && !selectedInstrument && <main className="page"><div className="section-kicker"><Sparkles size={14} /> Trang không tồn tại</div><h1>Không tìm thấy nhạc cụ</h1><a href="/explore">Quay lại Khám phá</a></main>}
    {view === 'explore' && !isInstrumentRoute && <ExplorePage />}
    {view === 'explore' && selectedInstrument && <InstrumentPage instrument={selectedInstrument} />}
    {view === 'learn' && selectedInstrument && <InstrumentLearning instrument={selectedInstrument} user={authUser} onAuth={() => { sessionStorage.setItem('vrhythm_return_to', pathname); openAuth('login'); }} onLesson={openLesson} />}
    {view === 'learn' && !isInstrumentRoute && <Learn user={authUser} courses={courses} loading={coursesLoading} error={coursesError} onAuth={() => openAuth('login')} onOpenLesson={openLesson} onRefresh={loadCourses} />}
    {view === 'profile' && <Profile user={authUser} onAuth={() => openAuth('login')} />}
    {view === 'lesson' && <LessonPlayer route={lessonRoute} onBack={() => navigate('learn')} onOpenLesson={openLesson} />}
    {view === 'auth' && <main className="page"><AuthPanel mode={authMode} onModeChange={mode => navigate('auth', mode)} onSubmit={signIn} /></main>}
  </div>;
}

function parseLessonRoute(path: string): LessonRoute {
  const match = path.match(/^\/lesson\/(\d+)\/chapter\/(\d+)\/lesson\/(\d+)/);
  return match ? { courseId: Number(match[1]), chapterId: Number(match[2]), lessonId: Number(match[3]) } : defaultLessonRoute;
}

function Learn({ courses, loading, error, onRefresh }: { user: AuthResponse | null; courses: Array<CourseSummary | LearnerCourseSummary>; loading: boolean; error: string; onAuth: () => void; onOpenLesson: (route?: LessonRoute) => void; onRefresh: () => Promise<void> }) {
  const root = useScrollReveal('.learning-steps li, .learning-catalog-heading, .learning-card, .learning-closing');
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase().trim();
  return <main className="page learn-page learn-editorial" ref={root}>
    <section className="learning-intro">
      <div>
        <span className="section-kicker"><Sparkles size={14} /> Học nhạc cụ Việt Nam</span>
        <h1 className="learn-editorial-title">
          <span>Thanh âm bạn yêu.</span>
          <em>Hành trình<br />bạn chọn.</em>
        </h1>
        <p>Chọn nhạc cụ, xem lộ trình và tìm khóa học phù hợp. Bắt đầu từ một nốt nhạc, theo nhịp của riêng bạn.</p>
        <a className="primary" href="#chon-nhac-cu">Chọn nhạc cụ để học <ArrowRight size={18} /></a>
      </div>
      <ol className="learning-steps" aria-label="Cách bắt đầu học">
        <li><span>01</span><div><h2>Chọn nhạc cụ</h2><p>Tìm thanh âm khiến bạn muốn thử.</p></div></li>
        <li><span>02</span><div><h2>Xem lộ trình</h2><p>Đọc nội dung từng chương trước khi chọn khóa.</p></div></li>
        <li><span>03</span><div><h2>Bắt đầu học</h2><p>Đăng ký khóa phù hợp và vào bài học đầu tiên.</p></div></li>
      </ol>
    </section>
    <section id="chon-nhac-cu" className="learning-catalog">
      <div className="learning-catalog-heading"><div><span className="section-kicker"><Sparkles size={14} /> Từ yêu thích đến thực hành</span><h2>Bạn muốn học nhạc cụ nào?</h2></div></div>
      {loading && <p className="learning-notice" role="status">Đang cập nhật danh sách khóa học…</p>}
      {error && <div className="learning-notice" role="alert"><span>{error} Bạn vẫn có thể chọn nhạc cụ bên dưới.</span><button className="text-button" onClick={() => void onRefresh()}>Thử lại</button></div>}
      <div className="learning-grid">{instruments.map(instrument => {
        const count = courses.filter(course => normalize(course.instrument) === normalize(instrument.name)).length;
        return <article className="learning-card" key={instrument.id}>
          <div className="learning-card-art"><span>{instrument.family}</span><img src={`/images/generated/carousel-${instrument.id}.webp`} alt={`${instrument.name} — minh họa`} loading="lazy" /></div>
          <div className="learning-card-content"><p className="learning-tone">{instrument.tone}</p><h3>{instrument.name}</h3><p>{instrument.description}</p><div className="learning-card-footer">{!loading && !error && <small>{count > 0 ? `${count} khóa học đang mở` : 'Chưa có khóa học đang mở'}</small>}<a href={`/learn/${instrument.id}`} aria-label={`Xem lộ trình học ${instrument.name}`}>Xem lộ trình <ArrowRight size={18} /></a></div></div>
        </article>;
      })}</div>
      <p className="learning-image-note">Ảnh nhạc cụ là minh họa, không dùng làm sơ đồ cấu tạo.</p>
    </section>
    <section className="learning-closing"><span className="section-kicker">Mỗi ngày, một bước tiến</span><h2>Từ nốt nhạc đầu tiên,<br /><em>đến giai điệu của riêng bạn.</em></h2><p>Chọn một nhạc cụ yêu thích và bắt đầu theo nhịp của bạn.</p><a href="#chon-nhac-cu">Tìm lộ trình của bạn <ArrowRight size={18} /></a></section>
    <footer className="ex-footer"><a href="/">VRhythm</a><span>Di sản · Nhịp điệu · Công nghệ</span><a href="/explore">Khám phá nhạc cụ ↗</a></footer>
  </main>;
}

function Profile({ user, onAuth }: { user: AuthResponse | null; onAuth: () => void }) {
  if (!user) return <main className="page profile-page"><section className="profile-empty"><div className="section-kicker"><Sparkles size={14} /> Hồ sơ người học</div><UserRound size={38} /><h1>Hồ sơ người học</h1><p>Đăng nhập để xem thông tin tài khoản của bạn.</p><button className="primary" onClick={onAuth}>Đăng nhập</button></section></main>;
  const initials = user.fullName.split(' ').filter(Boolean).slice(-2).map(part => part[0]).join('').toLocaleUpperCase('vi');
  return <main className="page profile-page"><section className="profile-hero"><div className="profile-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="Ảnh đại diện" /> : initials}</div><div><div className="section-kicker"><Sparkles size={14} /> Hồ sơ người học</div><h1>{user.fullName}</h1><p>Thông tin tài khoản được đồng bộ trực tiếp từ VRhythm.</p></div></section><section className="profile-details"><div><Mail /><span>Email</span><strong>{user.email}</strong></div><div><ShieldCheck /><span>Vai trò</span><strong>{user.role === 'Learner' ? 'Người học' : user.role}</strong></div><div><UserRound /><span>Mã người dùng</span><strong>#{user.userId}</strong></div></section></main>;
}

function InstrumentPage({ instrument }: { instrument: Instrument }) {
  return instrument.id === 'sao' ? <BambooFluteArticle /> : <InstrumentStory instrument={instrument} />;
}
