import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Check, ChevronRight, Flame, Headphones, Lock, Sparkles, Target, Trophy, UserRound } from 'lucide-react';
import { AuthPanel } from './components/AuthPanel';
import { Header } from './components/Header';
import { InstrumentCard } from './components/InstrumentCard';
import { SheetEnginePreview } from './components/SheetEnginePreview';
import { LessonPlayer } from './components/LessonPlayer';
import { FluteInteractive } from './components/FluteInteractive';
import { InteractiveInstrumentShowcase } from './components/InteractiveInstrumentShowcase';
import { instruments, learningPath, mockCourses, type Instrument } from './data/mock';
import { api, authStorage, type AuthResponse, type CourseSummary } from './services/api';

type View = 'home' | 'explore' | 'learn' | 'auth' | 'lesson';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('vrhythm_theme') as 'light' | 'dark' | null) ?? 'light');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [authUser, setAuthUser] = useState<AuthResponse | null>(() => authStorage.read());
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  useEffect(() => { if (view === 'learn') api.getCourses().then(setCourses).catch(() => setCourses([])); }, [view]);
  const openAuth = (mode: 'login' | 'register' = 'login') => { setAuthMode(mode); setView('auth'); };
  const signIn = async (data: { fullName?: string; email: string; password: string }) => { const response = authMode === 'login' ? await api.login(data) : await api.register({ fullName: data.fullName ?? 'Người học VRhythm', email: data.email, password: data.password }); authStorage.write(response); setAuthUser(response); setView('learn'); };
  const signOut = () => { authStorage.clear(); setAuthUser(null); setView('home'); };
  const toggleTheme = () => setTheme(current => { const next = current === 'dark' ? 'light' : 'dark'; localStorage.setItem('vrhythm_theme', next); return next; });
  return <div className={`app-shell theme-${theme}`}><Header active={view} loggedIn={Boolean(authUser)} theme={theme} onToggleTheme={toggleTheme} onNavigate={value => setView(value as View)} onSignOut={signOut} />
    {view === 'home' && <Home onNavigate={setView} onInstrument={setSelectedInstrument} />}
    {view === 'explore' && <Explore onInstrument={setSelectedInstrument} onLearn={() => setView('learn')} />}
    {view === 'learn' && <Learn user={authUser} courses={courses.length ? courses : mockCourses} onAuth={() => openAuth('login')} onOpenLesson={() => setView('lesson')} />}
    {view === 'lesson' && <LessonPlayer onBack={() => setView('learn')} />}
    {view === 'auth' && <main className="page"><AuthPanel mode={authMode} onModeChange={setAuthMode} onSubmit={signIn} /></main>}
    {selectedInstrument && <InstrumentModal instrument={selectedInstrument} onClose={() => setSelectedInstrument(null)} onLearn={() => { setSelectedInstrument(null); setView('learn'); }} />}
  </div>;
}

function Home({ onNavigate, onInstrument }: { onNavigate: (view: View) => void; onInstrument: (instrument: Instrument) => void }) {
  return <main className="page home-page"><section className="hero"><div className="hero-copy"><span className="eyebrow"><Sparkles size={14} /> Âm nhạc Việt trên nền tảng số</span><h1>Chạm vào âm nhạc Việt.<br /><em>Khám phá theo cách của bạn.</em></h1><p>VRhythm đưa những thanh âm truyền thống đến gần hơn với thế hệ hôm nay bằng trải nghiệm nghe, nhìn và học thật tự nhiên.</p><div className="hero-actions"><button className="primary" onClick={() => onNavigate('explore')}>Khám phá nhạc cụ <ArrowRight size={17} /></button><button className="text-button" onClick={() => onNavigate('learn')}>Bắt đầu học <ChevronRight size={17} /></button></div><div className="hero-proof"><span><strong>04</strong> nhạc cụ</span><span><strong>∞</strong> cách lắng nghe</span><span><strong>01</strong> cộng đồng</span></div></div><div className="hero-art hero-logo-art"><div className="logo-sigil">VR<span>hythm</span></div><p>Âm nhạc Việt<br />trên nền tảng số</p><div className="logo-orbit" /></div></section><InteractiveInstrumentShowcase onSelect={onInstrument} /><section className="manifesto"><div className="section-kicker">03 · Vì sao VRhythm?</div><h2>Di sản chỉ sống khi<br /><em>được tiếp tục.</em></h2><p>Chúng tôi tạo ra một nơi để bạn có thể gặp âm nhạc truyền thống Việt Nam bằng sự tò mò, niềm vui và công nghệ vừa đủ.</p></section><section className="home-cta"><div><span className="eyebrow">Học theo nhịp của bạn</span><h2>Một nốt nhạc hôm nay.<br />Một giai điệu ngày mai.</h2></div><button className="primary" onClick={() => onNavigate('learn')}>Đi đến khu vực học <ArrowRight size={17} /></button></section></main>;
}

function Explore({ onInstrument, onLearn }: { onInstrument: (instrument: Instrument) => void; onLearn: () => void }) {
  return <main className="page"><section className="page-intro"><div><div className="section-kicker">Khám phá · Explore</div><h1>Nghe một nhạc cụ.<br /><em>Chạm một câu chuyện.</em></h1></div><p>Từ tre, gỗ và những sợi dây, mỗi nhạc cụ lưu giữ một cách người Việt kể về quê hương.</p></section><section className="explore-grid">{instruments.map(instrument => <InstrumentCard key={instrument.id} instrument={instrument} onSelect={onInstrument} />)}</section><div className="explore-note"><Headphones size={20} /><span>Bấm vào từng nhạc cụ để xem nguồn gốc, cấu tạo, cách chơi và nghe âm thanh mẫu.</span></div><section className="home-cta compact-cta"><div><span className="eyebrow">Bạn muốn tự mình chơi?</span><h2>Hành trình học bắt đầu từ đây.</h2></div><button className="primary" onClick={onLearn}>Bắt đầu học <ArrowRight size={17} /></button></section></main>;
}

function Learn({ user, courses, onAuth, onOpenLesson }: { user: AuthResponse | null; courses: Array<CourseSummary | typeof mockCourses[number]>; onAuth: () => void; onOpenLesson: () => void }) {
  const [instrument, setInstrument] = useState('Sáo trúc');
  const setView = (_view: string) => onOpenLesson();
  return <main className="page learn-page"><section className="dashboard-top"><div><div className="section-kicker">Learning dashboard</div><h1>{user ? `Chào ${user.profile.fullName.split(' ')[0]}.` : 'Bắt đầu hành trình của bạn.'}</h1><p>{user ? 'Bạn đang tiến bộ rất đẹp. Cùng tiếp tục bài học hôm nay nhé.' : 'Đăng nhập để lưu lại tiến độ, XP, streak và thành tích của bạn.'}</p>{!user && <button className="primary" onClick={onAuth}>Đăng nhập để đồng bộ <UserRound size={16} /></button>}</div><div className="streak-card"><Flame size={22} /><strong>12</strong><span>ngày streak</span><small>Giữ nhịp thật đều nhé</small></div></section><section className="stat-row"><div><Trophy /><span>XP hiện tại</span><strong>1,240</strong></div><div><Target /><span>Tiến độ tổng</span><strong>28%</strong></div><div><BookOpen /><span>Bài đã học</span><strong>08 / 24</strong></div></section><section className="learning-layout"><div className="learning-main"><div className="section-heading inline"><div><div className="section-kicker">03 · Chọn nhạc cụ</div><h2>Những khóa học của bạn</h2></div><select value={instrument} onChange={event => setInstrument(event.target.value)}><option>Sáo trúc</option><option>Đàn tranh</option><option>Đàn bầu</option><option>Đàn đáy</option></select></div><div className="course-list">{courses.map(course => <article className="course-card" key={course.id}><div className="course-card-top" style={{ background: 'color' in course ? course.color : '#4f8f83' }}><span>{'level' in course ? course.level : course.accessType}</span><b>{course.instrument}</b></div><div className="course-card-body"><h3>{course.title}</h3><p>{'duration' in course ? `${course.lessons} bài · ${course.duration}` : course.description}</p><div className="progress-label"><span>Tiến độ</span><strong>{'progress' in course ? course.progress : 0}%</strong></div><div className="progress-bar"><i style={{ width: `${'progress' in course ? course.progress : 0}%` }} /></div><button className="text-button" onClick={() => setView('lesson')}>Tiếp tục học <ArrowRight size={15} /></button></div></article>)}</div></div><aside className="path-card"><div className="section-kicker">Learning path</div><h2>Khóa nhập môn<br /><em>sáo trúc</em></h2><div className="path-list">{learningPath.map(item => <div className={`path-item ${item.status}`} key={item.number}><span className="path-number">{item.status === 'done' ? <Check size={14} /> : item.status === 'locked' ? <Lock size={13} /> : item.number}</span><div><strong>{item.title}</strong><small>{item.type}</small></div>{item.status === 'current' && <span className="current-dot" />}</div>)}</div></aside></section><SheetEnginePreview /></main>;
}

function InstrumentModal({ instrument, onClose, onLearn }: { instrument: Instrument; onClose: () => void; onLearn: () => void }) {
  return <div className="modal-backdrop" onClick={onClose}><div className={instrument.id === 'sao' ? 'instrument-modal flute-modal' : 'instrument-modal'} onClick={event => event.stopPropagation()}><button className="modal-close" onClick={onClose}>Đóng</button>{instrument.id === 'sao' ? <div className="flute-modal-body"><div className="modal-content"><div className="section-kicker">Interactive instrument · {instrument.origin}</div><h2>{instrument.name}</h2><p className="modal-tone">{instrument.tone}</p><p>{instrument.description}</p></div><FluteInteractive /><button className="primary flute-learn" onClick={onLearn}>Học sáo trúc <ArrowRight size={16} /></button></div> : <><div className="modal-art" style={{ '--instrument-accent': instrument.accent } as React.CSSProperties}><img className={instrument.transparentImage ? 'transparent-instrument' : ''} src={instrument.transparentImage ?? instrument.image} alt={instrument.name} /><span>{instrument.symbol}</span></div><div className="modal-content"><div className="section-kicker">{instrument.origin}</div><h2>{instrument.name}</h2><p className="modal-tone">{instrument.tone}</p><p>{instrument.description}</p><div className="detail-grid"><span><small>Nguồn gốc</small><strong>{instrument.origin}</strong></span><span><small>Trải nghiệm</small><strong>Nghe · Nhìn · Chơi</strong></span></div><button className="primary" onClick={onLearn}>Học nhạc cụ này <ArrowRight size={16} /></button></div></>}</div></div>;
}
