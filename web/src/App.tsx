import { useEffect, useState } from 'react';
import './instrument-pages.css';
import { BambooFluteArticle } from './components/BambooFluteArticle';
import { InstrumentFeatures } from './components/InstrumentFeatures';
import { ArrowLeft, ArrowRight, ChevronRight, Landmark, Mail, MapPin, Music2, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { InstrumentLearning } from './components/InstrumentLearning';
import { AuthPanel } from './components/AuthPanel';
import { Header } from './components/Header';
import { InstrumentCard } from './components/InstrumentCard';
import { LessonPlayer } from './components/LessonPlayer';
import { InteractiveInstrumentShowcase } from './components/InteractiveInstrumentShowcase';
import { instruments, type Instrument } from './data/mock';
import { api, authStorage, courseErrorMessage, type AuthResponse, type CourseSummary, type LearnerCourseSummary } from './services/api';

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
  return <div className="app-shell"><Header active={view} loggedIn={Boolean(authUser)} onNavigate={value => navigate(value as View)} onSignOut={signOut} />
    {view === 'home' && <Home onNavigate={navigate} onInstrument={setSelectedInstrument} />}
    {isInstrumentRoute && !selectedInstrument && <main className="page"><div className="section-kicker"><Sparkles size={14} /> Trang không tồn tại</div><h1>Không tìm thấy nhạc cụ</h1><a href="/explore">Quay lại Khám phá</a></main>}
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
  return <main className="page home-page">
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow"><Sparkles size={14} /> Âm nhạc Việt trên nền tảng số</span>
        <h1 className="hero-script-title">
          <span className="hero-title-vietnam">Việt Nam</span>
          <span className="hero-title-sub">trong từng thanh âm</span>
        </h1>
        <p>Bắt đầu học nhạc cụ truyền thống cùng VRhythm — chọn nhạc cụ bạn yêu thích, tìm hiểu lộ trình và thực hành từng bước.</p>
        <div className="hero-actions">
          <button className="primary hero-learn-button" onClick={() => onNavigate('learn')}>Bắt đầu học <ArrowRight size={19} /></button>
          <button className="text-button hero-explore-link" onClick={() => onNavigate('explore')}>Tìm hiểu nhạc cụ <ChevronRight size={15} /></button>
        </div>
      </div>
      <div className="hero-brand-art"><img src="/images/generated/vrhythm-logo-full.webp" alt="VRhythm — biểu tượng sáo và dây đàn cách điệu" width="1254" height="1254" fetchPriority="high" /></div>
    </section>
    <InteractiveInstrumentShowcase onSelect={onInstrument} />
    <InstrumentFeatures />
    <section className="manifesto">
      <h2 className="manifesto-script-title">Di sản chỉ sống khi được tiếp tục</h2>
      <div className="manifesto-body">
        <p>Mỗi lần bạn tập một nốt nhạc, giai điệu truyền thống sẽ có thêm một người tiếp nối.</p>
        <p>Chọn nhạc cụ mình yêu thích và bắt đầu từ bài học đầu tiên.</p>
        <p>VRhythm đồng hành cùng bạn trên hành trình này.</p>
      </div>
    </section>
    <section className="home-cta">
      <div>
        <span className="eyebrow"><Sparkles size={14} /> Học theo nhịp của bạn</span>
        <h2 className="cta-script-title">
          <span className="script-title-green">Một nốt nhạc hôm nay</span>
          <span className="script-title-orange">Một giai điệu ngày mai</span>
        </h2>
      </div>
      <button className="primary" onClick={() => onNavigate('learn')}>BẮT ĐẦU HỌC <ArrowRight size={18} /></button>
    </section>
  </main>;
}

function Explore({ onInstrument }: { onInstrument: (instrument: Instrument) => void }) {
  const [family, setFamily] = useState('Tất cả');
  const families = ['Tất cả', ...Array.from(new Set(instruments.map(instrument => instrument.family)))];
  const visibleInstruments = family === 'Tất cả' ? instruments : instruments.filter(instrument => instrument.family === family);

  return <main className="page explore-page">
    <section className="explore-hero">
      <div className="explore-hero-copy">
        <div className="section-kicker"><Sparkles size={14} /> Thư viện di sản âm nhạc Việt Nam</div>
        <h1 className="explore-script-title">
          <span className="script-title-green">Mỗi nhạc cụ</span>
          <span className="script-title-orange">Một câu chuyện văn hóa</span>
        </h1>
        <p className="explore-hero-desc">Khám phá nguồn gốc, cấu tạo, không gian diễn xướng và vai trò của những nhạc cụ đã đồng hành cùng đời sống người Việt qua nhiều thế hệ.</p>
      </div>
    </section>

    <section className="heritage-guide" aria-label="Các lớp thông tin"><div><Landmark /><span><strong>Bối cảnh lịch sử</strong><small>Hành trình của nhạc cụ trong đời sống</small></span></div><div><MapPin /><span><strong>Không gian văn hóa</strong><small>Vùng miền và loại hình diễn xướng</small></span></div><div><Music2 /><span><strong>Âm sắc & cấu tạo</strong><small>Chất liệu làm nên tiếng nói riêng</small></span></div></section>

    <section className="explore-archive">
      <div className="archive-heading">
        <div>
          <div className="section-kicker"><Sparkles size={14} /> Danh mục nhạc cụ</div>
          <h2 className="archive-script-title">Tra cứu theo họ nhạc cụ</h2>
        </div>
        <div className="family-filters" role="group" aria-label="Lọc theo họ nhạc cụ">{families.map(item => <button key={item} className={family === item ? 'active' : ''} onClick={() => setFamily(item)}>{item}</button>)}</div>
      </div>
      <div className="explore-grid">{visibleInstruments.map(instrument => <InstrumentCard key={instrument.id} instrument={instrument} onSelect={onInstrument} />)}</div>
    </section>

  </main>;
}

function Learn({ courses, loading, error, onRefresh }: { user: AuthResponse | null; courses: Array<CourseSummary | LearnerCourseSummary>; loading: boolean; error: string; onAuth: () => void; onOpenLesson: (route?: LessonRoute) => void; onRefresh: () => Promise<void> }) {
  const [family, setFamily] = useState('Tất cả');
  const visible = instruments.filter(instrument => family === 'Tất cả' || instrument.family === family);
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase().trim();
  return <main className="page learn-page">
    <section className="learning-intro">
      <div>
        <span className="section-kicker"><Sparkles size={14} /> Học nhạc cụ Việt Nam</span>
        <h1 className="learn-script-title">
          <span className="script-title-green">Thanh âm bạn yêu</span>
          <span className="script-title-orange">Hành trình bạn chọn</span>
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
      <div className="learning-catalog-heading"><div><span className="section-kicker"><Sparkles size={14} /> Từ yêu thích đến thực hành</span><h2>Bạn muốn học nhạc cụ nào?</h2></div><div className="family-filters" role="group" aria-label="Lọc nhạc cụ học tập">{['Tất cả', 'Họ dây', 'Họ hơi'].map(item => <button key={item} aria-pressed={family === item} className={family === item ? 'active' : ''} onClick={() => setFamily(item)}>{item}</button>)}</div></div>
      {loading && <p className="learning-notice" role="status">Đang cập nhật danh sách khóa học…</p>}
      {error && <div className="learning-notice" role="alert"><span>{error} Bạn vẫn có thể chọn nhạc cụ bên dưới.</span><button className="text-button" onClick={() => void onRefresh()}>Thử lại</button></div>}
      <div className="learning-grid">{visible.map(instrument => {
        const count = courses.filter(course => normalize(course.instrument) === normalize(instrument.name)).length;
        return <article className="learning-card" key={instrument.id}>
          <div className="learning-card-art"><span>{instrument.family}</span><img src={`/images/generated/carousel-${instrument.id}.webp`} alt={`${instrument.name} — minh họa`} loading="lazy" /></div>
          <div className="learning-card-content"><p className="learning-tone">{instrument.tone}</p><h3>{instrument.name}</h3><p>{instrument.description}</p><div className="learning-card-footer">{!loading && !error && <small>{count > 0 ? `${count} khóa học đang mở` : 'Chưa có khóa học đang mở'}</small>}<a href={`/learn/${instrument.id}`} aria-label={`Xem lộ trình học ${instrument.name}`}>Xem lộ trình <ArrowRight size={18} /></a></div></div>
        </article>;
      })}</div>
      <p className="learning-image-note">Ảnh nhạc cụ là minh họa, không dùng làm sơ đồ cấu tạo.</p>
    </section>
  </main>;
}

function Profile({ user, onAuth }: { user: AuthResponse | null; onAuth: () => void }) {
  if (!user) return <main className="page profile-page"><section className="profile-empty"><div className="section-kicker"><Sparkles size={14} /> Hồ sơ người học</div><UserRound size={38} /><h1>Hồ sơ người học</h1><p>Đăng nhập để xem thông tin tài khoản của bạn.</p><button className="primary" onClick={onAuth}>Đăng nhập</button></section></main>;
  const initials = user.fullName.split(' ').filter(Boolean).slice(-2).map(part => part[0]).join('').toLocaleUpperCase('vi');
  return <main className="page profile-page"><section className="profile-hero"><div className="profile-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="Ảnh đại diện" /> : initials}</div><div><div className="section-kicker"><Sparkles size={14} /> Hồ sơ người học</div><h1>{user.fullName}</h1><p>Thông tin tài khoản được đồng bộ trực tiếp từ VRhythm.</p></div></section><section className="profile-details"><div><Mail /><span>Email</span><strong>{user.email}</strong></div><div><ShieldCheck /><span>Vai trò</span><strong>{user.role === 'Learner' ? 'Người học' : user.role}</strong></div><div><UserRound /><span>Mã người dùng</span><strong>#{user.userId}</strong></div></section></main>;
}

function InstrumentPage({ instrument }: { instrument: Instrument }) {
  if (instrument.id === 'sao') return <BambooFluteArticle />;
  return <main className="page instrument-detail"><a href="/explore" className="text-button"><ArrowLeft size={18} /> Khám phá nhạc cụ</a><article className="instrument-page-layout">
    <div className="modal-art" style={{ '--instrument-accent': instrument.accent } as React.CSSProperties}><img className={instrument.transparentImage ? 'transparent-instrument' : ''} src={instrument.transparentImage ?? instrument.image} alt={instrument.name} /><span>{instrument.symbol}</span><div className="modal-image-caption">Hiện vật · {instrument.family}</div></div>
    <div className="modal-content heritage-content">
      <div className="section-kicker"><Sparkles size={14} /> Hồ sơ di sản · {instrument.latinName}</div><h1 id={`instrument-${instrument.id}`}>{instrument.name}</h1><p className="modal-tone">{instrument.tone}</p><p className="modal-lead">{instrument.description}</p>
      <div className="heritage-metadata"><span><small>Họ nhạc cụ</small><strong>{instrument.family}</strong></span><span><small>Không gian văn hóa</small><strong>{instrument.origin}</strong></span><span><small>Chất liệu chính</small><strong>{instrument.materials}</strong></span><span><small>Cách tạo âm</small><strong>{instrument.playingStyle}</strong></span></div>
      <section className="story-section"><div className="story-number">01</div><div><h3>Lịch sử & hành trình</h3><p>{instrument.history}</p></div></section>
      <section className="story-section"><div className="story-number">02</div><div><h3>Trong đời sống văn hóa</h3><p>{instrument.culturalContext}</p></div></section>
      <section className="story-section"><div className="story-number">03</div><div><h3>Dấu hiệu nhận biết</h3><ul>{instrument.facts.map(fact => <li key={fact}>{fact}</li>)}</ul></div></section>
      <div className="modal-cultural-note"><Landmark size={18} /><span><small>Giá trị văn hóa</small><strong>{instrument.culturalValue}</strong></span></div>
    </div>
  </article><section className="home-cta"><div><span className="eyebrow"><Sparkles size={14} /> Tiếp nối câu chuyện bằng tiếng đàn của bạn</span><h2>Học {instrument.name.toLocaleLowerCase('vi')}</h2><p>Xem nội dung khóa học, lộ trình và đăng ký học.</p></div><a className="primary" href={`/learn/${instrument.id}`}>Bắt đầu học <ArrowRight size={17} /></a></section></main>;
}
