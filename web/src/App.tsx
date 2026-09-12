import { useEffect, useState } from 'react';
import './instrument-pages.css';
import { ArrowRight, ChevronRight, Landmark, Mail, MapPin, Music2, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { InstrumentLearning } from './components/InstrumentLearning';
import { AuthPanel } from './components/AuthPanel';
import { Header } from './components/Header';
import { InstrumentCard } from './components/InstrumentCard';
import { LessonPlayer } from './components/LessonPlayer';
import { InteractiveInstrumentShowcase } from './components/InteractiveInstrumentShowcase';
import { instruments, type Instrument } from './data/mock';
import { api, authStorage, type AuthResponse, type CourseSummary, type LearnerCourseSummary } from './services/api';

type View = 'home' | 'explore' | 'learn' | 'profile' | 'auth' | 'lesson';
type LessonRoute = { courseId: number; chapterId: number; lessonId: number };
const defaultLessonRoute: LessonRoute = { courseId: 1, chapterId: 1, lessonId: 104 };

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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('vrhythm_theme') as 'light' | 'dark' | null) ?? 'light');
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialRoute.authMode);
  const [pathname, setPathname] = useState(window.location.pathname);
  const selectedInstrument = instruments.find(item => item.id === pathname.split('/')[2]);
  const isInstrumentRoute = /^\/(explore|learn)\//.test(pathname);
  const setSelectedInstrument = (instrument: Instrument) => { window.location.assign(`/explore/${instrument.id}`); };
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
      setCoursesError(error instanceof Error ? error.message : 'Không thể tải khóa học.');
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
  const toggleTheme = () => setTheme(current => { const next = current === 'dark' ? 'light' : 'dark'; localStorage.setItem('vrhythm_theme', next); return next; });
  return <div className={`app-shell theme-${theme}`}><Header active={view} loggedIn={Boolean(authUser)} theme={theme} onToggleTheme={toggleTheme} onNavigate={value => navigate(value as View)} onSignOut={signOut} />
    {view === 'home' && <Home onNavigate={navigate} onInstrument={setSelectedInstrument} />}
    {isInstrumentRoute && !selectedInstrument && <main className="page"><h1>Không tìm thấy nhạc cụ</h1><a href="/explore">Quay lại Khám phá</a></main>}
    {view === 'explore' && !isInstrumentRoute && <Explore onInstrument={setSelectedInstrument} />}
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

function Home({ onNavigate, onInstrument }: { onNavigate: (view: View) => void; onInstrument: (instrument: Instrument) => void }) {
  return <main className="page home-page"><section className="hero"><div className="hero-copy"><span className="eyebrow"><Sparkles size={14} /> Âm nhạc Việt trên nền tảng số</span><h1>Việt Nam trong từng thanh âm.<br /><em>Khám phá theo cách của bạn.</em></h1><p>VRhythm đưa những thanh âm truyền thống đến gần hơn với thế hệ hôm nay bằng trải nghiệm nghe, nhìn và học thật tự nhiên.</p><div className="hero-actions"><button className="primary" onClick={() => onNavigate('explore')}>Khám phá nhạc cụ <ArrowRight size={17} /></button><button className="text-button" onClick={() => onNavigate('learn')}>Bắt đầu học <ChevronRight size={17} /></button></div><div className="hero-proof"><span><strong>{instruments.length.toString().padStart(2, '0')}</strong> Nhạc cụ</span><span><strong>∞</strong> Cách lắng nghe</span><span><strong>01</strong> Cộng đồng</span></div></div><div className="hero-art hero-logo-art"><div className="logo-sigil">VR<span>hythm</span></div><p>Âm nhạc Việt<br />trên nền tảng số</p><div className="logo-orbit" /></div></section><InteractiveInstrumentShowcase onSelect={onInstrument} /><section className="manifesto"><h2>Di sản chỉ sống khi<br /><em>được tiếp tục.</em></h2><p>VRhythm mang âm nhạc truyền thống đến gần bạn hơn — bắt đầu từ sự tò mò, niềm vui và chút nhấn nhá từ công nghệ.</p></section><section className="home-cta"><div><span className="eyebrow">Học theo nhịp của bạn</span><h2>Một nốt nhạc hôm nay.<br />Một giai điệu ngày mai.</h2></div><button className="primary cta-btn-bright" onClick={() => onNavigate('learn')}>BẮT ĐẦU HỌC <ArrowRight size={17} /></button></section></main>;
}

function Explore({ onInstrument }: { onInstrument: (instrument: Instrument) => void }) {
  const [family, setFamily] = useState('Tất cả');
  const families = ['Tất cả', ...Array.from(new Set(instruments.map(instrument => instrument.family)))];
  const visibleInstruments = family === 'Tất cả' ? instruments : instruments.filter(instrument => instrument.family === family);

  return <main className="page explore-page">
    <section className="explore-hero">
      <div className="explore-hero-copy">
        <div className="section-kicker">Thư viện di sản âm nhạc Việt Nam</div>
        <h1>Mỗi nhạc cụ là một<br /><em>mảnh ký ức văn hóa.</em></h1>
        <p>Khám phá nguồn gốc, cấu tạo, không gian diễn xướng và vai trò của những nhạc cụ đã đồng hành cùng đời sống người Việt qua nhiều thế hệ.</p>
      </div>
      <div className="explore-hero-card">
        <div className="explore-stat-row">
          <strong>{instruments.length.toString().padStart(2, '0')}</strong>
          <span>Hồ sơ nhạc cụ</span>
        </div>
        <div className="explore-stat-row">
          <strong>{families.filter(f => f !== 'Tất cả').length}</strong>
          <span>Họ nhạc cụ</span>
        </div>
        <p className="explore-card-note">Nội dung dành cho tìm hiểu văn hóa — không yêu cầu đăng nhập hay theo lộ trình bài học.</p>
      </div>
    </section>

    <section className="heritage-guide" aria-label="Các lớp thông tin"><div><Landmark /><span><strong>Bối cảnh lịch sử</strong><small>Hành trình của nhạc cụ trong đời sống</small></span></div><div><MapPin /><span><strong>Không gian văn hóa</strong><small>Vùng miền và loại hình diễn xướng</small></span></div><div><Music2 /><span><strong>Âm sắc & cấu tạo</strong><small>Chất liệu làm nên tiếng nói riêng</small></span></div></section>

    <section className="explore-archive">
      <div className="archive-heading"><div><div className="section-kicker">Danh mục nhạc cụ</div><h2>Tra cứu theo họ nhạc cụ</h2></div><div className="family-filters" role="group" aria-label="Lọc theo họ nhạc cụ">{families.map(item => <button key={item} className={family === item ? 'active' : ''} onClick={() => setFamily(item)}>{item}</button>)}</div></div>
      <div className="explore-grid">{visibleInstruments.map(instrument => <InstrumentCard key={instrument.id} instrument={instrument} onSelect={onInstrument} />)}</div>
    </section>

  </main>;
}

function getCourseThumbnail(course: CourseSummary | LearnerCourseSummary) {
  if (course.thumbnailUrl && !course.thumbnailUrl.includes('600') && !course.thumbnailUrl.includes('placeholder')) {
    return course.thumbnailUrl;
  }
  const inst = (course.instrument || '').toLocaleLowerCase();
  if (inst.includes('sáo') || inst.includes('sao')) return '/images/Sao_Truc.jpg';
  if (inst.includes('tranh')) return '/images/Dan_Tranh.jpg';
  if (inst.includes('bầu') || inst.includes('bau')) return '/images/Dan_Bau.jpg';
  if (inst.includes('đáy') || inst.includes('day')) return '/images/Dan_Day.jpg';
  if (inst.includes('tỳ') || inst.includes('ty')) return '/images/Dan_Ty_Ba_Transparent.png';
  if (inst.includes('nguyệt') || inst.includes('nguyet')) return '/images/Dan_Nguyet_Transparent.png';
  if (inst.includes('nhị') || inst.includes('nhi')) return '/images/Dan_Nhi_Transparent.png';
  return '/images/Sao_Truc.jpg';
}

function Learn({ courses, loading, error, onRefresh }: { user: AuthResponse | null; courses: Array<CourseSummary | LearnerCourseSummary>; loading: boolean; error: string; onAuth: () => void; onOpenLesson: (route?: LessonRoute) => void; onRefresh: () => Promise<void> }) {
  return <main className="page learn-page"><div className="section-kicker">Học nhạc cụ Việt Nam</div><h1>Chọn một nhạc cụ để bắt đầu.</h1><p>Xem nội dung, lộ trình và các khóa học dành cho từng nhạc cụ.</p>{loading && <p role="status">Đang tải khóa học…</p>}{error && <div role="alert">{error} <button className="text-button" onClick={() => void onRefresh()}>Thử lại</button></div>}<div className="course-list">{instruments.map(instrument => <article className="course-card" key={instrument.id}><div className="course-card-top" style={{ backgroundImage: `linear-gradient(transparent,rgba(0,0,0,.4)),url(${getCourseThumbnail({ id: 0, title: '', description: '', accessType: '', instrument: instrument.name })})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: 200 }} /><div className="course-card-body"><h2>{instrument.name}</h2><p>{instrument.description}</p>{!loading && !error && <small>{courses.filter(course => course.instrument.toLocaleLowerCase() === instrument.name.toLocaleLowerCase()).length} khóa học đang mở</small>}<p><a className="text-button" href={`/learn/${instrument.id}`}>Xem lộ trình & đăng ký học →</a></p></div></article>)}</div></main>;
}

function Profile({ user, onAuth }: { user: AuthResponse | null; onAuth: () => void }) {
  if (!user) return <main className="page profile-page"><section className="profile-empty"><UserRound size={38} /><h1>Hồ sơ người học</h1><p>Đăng nhập để xem thông tin tài khoản của bạn.</p><button className="primary" onClick={onAuth}>Đăng nhập</button></section></main>;
  const initials = user.fullName.split(' ').filter(Boolean).slice(-2).map(part => part[0]).join('').toLocaleUpperCase('vi');
  return <main className="page profile-page"><section className="profile-hero"><div className="profile-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="Ảnh đại diện" /> : initials}</div><div><div className="section-kicker">Hồ sơ người học</div><h1>{user.fullName}</h1><p>Thông tin tài khoản được đồng bộ trực tiếp từ VRhythm.</p></div></section><section className="profile-details"><div><Mail /><span>Email</span><strong>{user.email}</strong></div><div><ShieldCheck /><span>Vai trò</span><strong>{user.role === 'Learner' ? 'Người học' : user.role}</strong></div><div><UserRound /><span>Mã người dùng</span><strong>#{user.userId}</strong></div></section></main>;
}

function InstrumentPage({ instrument }: { instrument: Instrument }) {
  return <main className="page instrument-detail"><a href="/explore" className="text-button">← Khám phá nhạc cụ</a><article className="instrument-page-layout">
    <div className="modal-art" style={{ '--instrument-accent': instrument.accent } as React.CSSProperties}><img className={instrument.transparentImage ? 'transparent-instrument' : ''} src={instrument.transparentImage ?? instrument.image} alt={instrument.name} /><span>{instrument.symbol}</span><div className="modal-image-caption">Hiện vật · {instrument.family}</div></div>
    <div className="modal-content heritage-content">
      <div className="section-kicker">Hồ sơ di sản · {instrument.latinName}</div><h1 id={`instrument-${instrument.id}`}>{instrument.name}</h1><p className="modal-tone">{instrument.tone}</p><p className="modal-lead">{instrument.description}</p>
      <div className="heritage-metadata"><span><small>Họ nhạc cụ</small><strong>{instrument.family}</strong></span><span><small>Không gian văn hóa</small><strong>{instrument.origin}</strong></span><span><small>Chất liệu chính</small><strong>{instrument.materials}</strong></span><span><small>Cách tạo âm</small><strong>{instrument.playingStyle}</strong></span></div>
      <section className="story-section"><div className="story-number">01</div><div><h3>Lịch sử & hành trình</h3><p>{instrument.history}</p></div></section>
      <section className="story-section"><div className="story-number">02</div><div><h3>Trong đời sống văn hóa</h3><p>{instrument.culturalContext}</p></div></section>
      <section className="story-section"><div className="story-number">03</div><div><h3>Dấu hiệu nhận biết</h3><ul>{instrument.facts.map(fact => <li key={fact}>{fact}</li>)}</ul></div></section>
      <div className="modal-cultural-note"><Landmark size={18} /><span><small>Giá trị văn hóa</small><strong>{instrument.culturalValue}</strong></span></div>
    </div>
  </article><section className="home-cta"><div><span className="eyebrow">Tiếp nối câu chuyện bằng tiếng đàn của bạn</span><h2>Học {instrument.name.toLocaleLowerCase('vi')}</h2><p>Xem nội dung khóa học, lộ trình và đăng ký học.</p></div><a className="primary" href={`/learn/${instrument.id}`}>Bắt đầu học <ArrowRight size={17} /></a></section></main>;
}
