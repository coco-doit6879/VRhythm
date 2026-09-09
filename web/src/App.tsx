import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, ChevronRight, Landmark, Mail, MapPin, Music2, ShieldCheck, Sparkles, Target, UserRound, X } from 'lucide-react';
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
  if (path === '/explore') return { view: 'explore', authMode: 'login' };
  if (path === '/learn') return { view: 'learn', authMode: 'login' };
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
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [authUser, setAuthUser] = useState<AuthResponse | null>(() => authStorage.read());
  const [courses, setCourses] = useState<Array<CourseSummary | LearnerCourseSummary>>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState('');
  const [lessonRoute, setLessonRoute] = useState<LessonRoute>(() => parseLessonRoute(window.location.pathname));
  const navigate = (nextView: View, nextAuthMode = authMode) => {
    const nextPath = routeForView(nextView, nextAuthMode);
    if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath);
    setView(nextView);
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
    const handlePopState = () => { const next = viewFromPath(window.location.pathname); setView(next.view); setAuthMode(next.authMode); setLessonRoute(parseLessonRoute(window.location.pathname)); };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const openAuth = (mode: 'login' | 'register' = 'login') => navigate('auth', mode);
  const signIn = async (data: { fullName?: string; email: string; password: string }) => { const response = authMode === 'login' ? await api.login(data) : await api.register({ fullName: data.fullName ?? 'Người học VRhythm', email: data.email, password: data.password }); authStorage.write(response); setAuthUser(response); navigate('learn'); };
  const signOut = () => { authStorage.clear(); setAuthUser(null); navigate('home'); };
  const toggleTheme = () => setTheme(current => { const next = current === 'dark' ? 'light' : 'dark'; localStorage.setItem('vrhythm_theme', next); return next; });
  return <div className={`app-shell theme-${theme}`}><Header active={view} loggedIn={Boolean(authUser)} theme={theme} onToggleTheme={toggleTheme} onNavigate={value => navigate(value as View)} onSignOut={signOut} />
    {view === 'home' && <Home onNavigate={navigate} onInstrument={setSelectedInstrument} />}
    {view === 'explore' && <Explore onInstrument={setSelectedInstrument} />}
    {view === 'learn' && <Learn user={authUser} courses={courses} loading={coursesLoading} error={coursesError} onAuth={() => openAuth('login')} onOpenLesson={openLesson} onRefresh={loadCourses} />}
    {view === 'profile' && <Profile user={authUser} onAuth={() => openAuth('login')} />}
    {view === 'lesson' && <LessonPlayer route={lessonRoute} onBack={() => navigate('learn')} onOpenLesson={openLesson} />}
    {view === 'auth' && <main className="page"><AuthPanel mode={authMode} onModeChange={mode => navigate('auth', mode)} onSubmit={signIn} /></main>}
    {selectedInstrument && <InstrumentModal instrument={selectedInstrument} onClose={() => setSelectedInstrument(null)} />}
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

function Learn({ user, courses, loading, error, onAuth, onOpenLesson, onRefresh }: { user: AuthResponse | null; courses: Array<CourseSummary | LearnerCourseSummary>; loading: boolean; error: string; onAuth: () => void; onOpenLesson: (route?: LessonRoute) => void; onRefresh: () => Promise<void> }) {
  const [instrument, setInstrument] = useState('Tất cả nhạc cụ');
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const displayCourses = courses.length > 0 ? courses : [
    { id: 1, title: 'Sáo trúc: Những nốt đầu tiên', instrument: 'Sáo trúc', description: 'Học cách cầm sáo, thế môi và những nốt Đô Rê Mi cơ bản trên cây sáo trúc Việt Nam.', accessType: 'Free' },
    { id: 2, title: 'Đàn tranh nhập môn', instrument: 'Đàn tranh', description: 'Làm quen cấu tạo, tư thế và những kỹ thuật gảy cơ bản của đàn tranh Việt Nam.', accessType: 'Free' },
    { id: 3, title: 'Đàn bầu: Một dây, ngàn sắc thái', instrument: 'Đàn bầu', description: 'Khám phá cách tạo âm, rung cần và luyến tiếng trên nhạc cụ một dây độc đáo của Việt Nam.', accessType: 'Free' },
    { id: 4, title: 'Đàn đáy và âm sắc ca trù', instrument: 'Đàn đáy', description: 'Tìm hiểu lịch sử, cấu tạo và vai trò của đàn đáy trong không gian nghệ thuật ca trù.', accessType: 'Free' },
  ];
  const learnerCourses = displayCourses.filter((course): course is LearnerCourseSummary => 'progressPercent' in course);
  const enrolledCourses = learnerCourses.filter(course => course.isEnrolled);
  const sortedCourses = [...displayCourses].sort((a, b) => {
    const aProgress = 'progressPercent' in a ? a.progressPercent : 0;
    const bProgress = 'progressPercent' in b ? b.progressPercent : 0;
    const aCompleted = 'isCompleted' in a && a.isCompleted;
    const bCompleted = 'isCompleted' in b && b.isCompleted;
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
    return bProgress - aProgress || a.title.localeCompare(b.title, 'vi');
  });
  const visibleCourses = (instrument === 'Tất cả nhạc cụ' ? sortedCourses : sortedCourses.filter(course => course.instrument.toLocaleLowerCase() === instrument.toLocaleLowerCase()));
  const instrumentOptions = ['Tất cả nhạc cụ', ...Array.from(new Set(displayCourses.map(course => course.instrument)))];
  const completedLessons = enrolledCourses.reduce((sum, course) => sum + course.completedLessons, 0);
  const totalLessons = enrolledCourses.reduce((sum, course) => sum + course.totalLessons, 0);
  const overallProgress = totalLessons ? Math.round(completedLessons * 100 / totalLessons) : 0;
  const activeCourse = sortedCourses.find((course): course is LearnerCourseSummary => 'progressPercent' in course && course.isEnrolled && !course.isCompleted);
  const handleCourse = async (course: CourseSummary | LearnerCourseSummary) => {
    if (!user) { onAuth(); return; }
    if ('progressPercent' in course && course.isEnrolled && course.nextChapterId && course.nextLessonId) {
      onOpenLesson({ courseId: course.id, chapterId: course.nextChapterId, lessonId: course.nextLessonId });
      return;
    }
    setEnrollingId(course.id);
    try {
      await api.enroll(course.id, course.accessType);
      await onRefresh();
    } catch {
      onOpenLesson({ courseId: course.id, chapterId: 1, lessonId: 104 });
    } finally {
      setEnrollingId(null);
    }
  };
  return <main className="page learn-page"><section className="dashboard-top"><div><div className="section-kicker">{user ? 'Bảng điều khiển học tập' : 'Khóa học đang mở'}</div><h1>{user ? `Chào ${user.fullName.split(' ').at(-1)}.` : 'Bắt đầu hành trình của bạn.'}</h1><p>{user ? 'Các khóa gần hoàn thành nhất được đưa lên trước để bạn giữ nhịp học.' : 'Danh sách dưới đây được tải trực tiếp từ những khóa học đã được duyệt và đang phát hành.'}</p>{!user && <button className="primary" onClick={onAuth}>Đăng nhập để bắt đầu <UserRound size={16} /></button>}</div>{user && activeCourse && <div className="focus-card"><Target size={22} /><small>Nên học tiếp</small><strong>{activeCourse.title}</strong><span>{activeCourse.progressPercent}% hoàn thành</span></div>}</section>{user && <section className="stat-row"><div><BookOpen /><span>Tổng số bài</span><strong>{totalLessons}</strong></div><div><Target /><span>Tiến độ tổng</span><strong>{overallProgress}%</strong></div><div><CheckCircle2 /><span>Bài đã hoàn thành</span><strong>{completedLessons} / {totalLessons}</strong></div></section>}<section className="learning-main"><div className="section-heading inline"><div><div className="section-kicker">Chọn nhạc cụ</div><h2>{user ? 'Khóa học dành cho bạn' : 'Khóa học có thể học'}</h2></div>{instrumentOptions.length > 1 && <select value={instrument} onChange={event => setInstrument(event.target.value)}>{instrumentOptions.map(option => <option key={option}>{option}</option>)}</select>}</div>{loading && <div className="course-state">Đang tải khóa học…</div>}{error && <div className="course-state error">{error}<button className="text-button" onClick={() => void onRefresh()}>Thử lại</button></div>}{!loading && <div className="course-list">{visibleCourses.map(course => { const learnerCourse = 'progressPercent' in course ? course : null; const completed = learnerCourse?.isCompleted ?? false; const thumb = getCourseThumbnail(course); return <article className={`course-card ${completed ? 'completed' : ''}`} key={course.id}><div className="course-card-top" style={{ backgroundImage: `linear-gradient(rgba(19,34,24,.45),rgba(19,34,24,.75)),url(${thumb})`, backgroundSize: 'cover', backgroundPosition: 'center' }}><span>{course.accessType === 'Free' ? 'Miễn phí' : 'Mở khóa'}</span><b>{course.instrument}</b></div><div className="course-card-body"><h3>{course.title}</h3><p>{course.description}</p>{learnerCourse && <><div className="progress-label"><span>{completed ? 'Đã hoàn thành' : `${learnerCourse.completedLessons} / ${learnerCourse.totalLessons} bài`}</span><strong>{learnerCourse.progressPercent}%</strong></div><div className="progress-bar"><i style={{ width: `${learnerCourse.progressPercent}%` }} /></div></>}<button className="text-button" disabled={completed || enrollingId === course.id} onClick={() => void handleCourse(course)}>{completed ? 'Đã hoàn thành' : enrollingId === course.id ? 'Đang mở...' : !user ? 'Đăng nhập để học' : learnerCourse?.isEnrolled ? 'Tiếp tục học' : 'Bắt đầu học'} {!completed && <ArrowRight size={15} />}</button></div></article>; })}</div>}{!loading && visibleCourses.length === 0 && <div className="course-state">Hiện chưa có khóa học phù hợp.</div>}</section></main>;
}

function Profile({ user, onAuth }: { user: AuthResponse | null; onAuth: () => void }) {
  if (!user) return <main className="page profile-page"><section className="profile-empty"><UserRound size={38} /><h1>Hồ sơ người học</h1><p>Đăng nhập để xem thông tin tài khoản của bạn.</p><button className="primary" onClick={onAuth}>Đăng nhập</button></section></main>;
  const initials = user.fullName.split(' ').filter(Boolean).slice(-2).map(part => part[0]).join('').toLocaleUpperCase('vi');
  return <main className="page profile-page"><section className="profile-hero"><div className="profile-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="Ảnh đại diện" /> : initials}</div><div><div className="section-kicker">Hồ sơ người học</div><h1>{user.fullName}</h1><p>Thông tin tài khoản được đồng bộ trực tiếp từ VRhythm.</p></div></section><section className="profile-details"><div><Mail /><span>Email</span><strong>{user.email}</strong></div><div><ShieldCheck /><span>Vai trò</span><strong>{user.role === 'Learner' ? 'Người học' : user.role}</strong></div><div><UserRound /><span>Mã người dùng</span><strong>#{user.userId}</strong></div></section></main>;
}

function InstrumentModal({ instrument, onClose }: { instrument: Instrument; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return <div className="modal-backdrop" onClick={onClose} role="presentation"><article className="instrument-modal heritage-modal" onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby={`instrument-${instrument.id}`}>
    <button className="modal-close" onClick={onClose} aria-label="Đóng hồ sơ"><X size={16} /> Đóng</button>
    <div className="modal-art" style={{ '--instrument-accent': instrument.accent } as React.CSSProperties}><img className={instrument.transparentImage ? 'transparent-instrument' : ''} src={instrument.transparentImage ?? instrument.image} alt={instrument.name} /><span>{instrument.symbol}</span><div className="modal-image-caption">Hiện vật · {instrument.family}</div></div>
    <div className="modal-content heritage-content">
      <div className="section-kicker">Hồ sơ di sản · {instrument.latinName}</div><h2 id={`instrument-${instrument.id}`}>{instrument.name}</h2><p className="modal-tone">{instrument.tone}</p><p className="modal-lead">{instrument.description}</p>
      <div className="heritage-metadata"><span><small>Họ nhạc cụ</small><strong>{instrument.family}</strong></span><span><small>Không gian văn hóa</small><strong>{instrument.origin}</strong></span><span><small>Chất liệu chính</small><strong>{instrument.materials}</strong></span><span><small>Cách tạo âm</small><strong>{instrument.playingStyle}</strong></span></div>
      <section className="story-section"><div className="story-number">01</div><div><h3>Lịch sử & hành trình</h3><p>{instrument.history}</p></div></section>
      <section className="story-section"><div className="story-number">02</div><div><h3>Trong đời sống văn hóa</h3><p>{instrument.culturalContext}</p></div></section>
      <section className="story-section"><div className="story-number">03</div><div><h3>Dấu hiệu nhận biết</h3><ul>{instrument.facts.map(fact => <li key={fact}>{fact}</li>)}</ul></div></section>
      <div className="modal-cultural-note"><Landmark size={18} /><span><small>Giá trị văn hóa</small><strong>{instrument.culturalValue}</strong></span></div>
    </div>
  </article></div>;
}
