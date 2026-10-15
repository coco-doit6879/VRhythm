import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';
import { ApiError, type AuthResponse } from '../services/api';
import { analyticsApi, type ActivityRow, type AnalyticsSummary, type PageResult, type SessionActivity } from '../services/analytics';
import './admin-dashboard.css';

const number = (n: number) => n.toLocaleString('vi-VN');
const date = (value: string) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
const time = (value: string) => new Date(value).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const titles: Record<string, string> = { '/': 'Trang chủ', '/explore': 'Khám phá', '/learn': 'Học tập', '/learn/sao': 'Học sáo trúc', '/library': 'Thư viện', '/packages': 'Gói học', '/login': 'Đăng nhập', '/register': 'Đăng ký', '/profile': 'Hồ sơ', '/admin': 'Quản trị' };
const pageName = (path: string) => titles[path] ?? (path.startsWith('/lesson/') ? `Bài học ${path.split('/').at(-1)}` : path);
const actionNames: Record<string, string> = { page_view: 'Xem trang', interaction: 'Tương tác', login_success: 'Đăng nhập thành công', login_failed: 'Đăng nhập thất bại', register_success: 'Tạo tài khoản', navigation: 'Điều hướng', course_open: 'Mở khóa học', enroll: 'Chọn đăng ký học', lesson_complete: 'Chọn hoàn thành bài', practice_start: 'Điều khiển luyện tập', chat_open: 'Mở trợ lý AI', checkout_start: 'Chọn thanh toán' };
const errorMessage = (err: unknown) => err instanceof ApiError && (err.status === 401 || err.status === 403)
  ? 'Phiên đăng nhập hết hạn hoặc tài khoản không có quyền quản trị.'
  : 'Không tải được số liệu. Vui lòng thử lại.';

export default function AdminDashboard({ user, onAuth }: { user: AuthResponse | null; onAuth: () => void }) {
  const [days, setDays] = useState(7);
  const [revision, setRevision] = useState(0);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionPage, setSessionPage] = useState(1);
  const [sessions, setSessions] = useState<PageResult<SessionActivity>>({ items: [], hasMore: false });
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [journeyPage, setJourneyPage] = useState(1);
  const [journey, setJourney] = useState<{ events: ActivityRow[]; hasMore: boolean } | null>(null);
  const [journeyError, setJourneyError] = useState('');
  const allowed = user?.role === 'Admin';

  useEffect(() => {
    if (!allowed) return;
    const controller = new AbortController();
    setLoading(true); setError(''); setSummary(null); setSessionPage(1); setSelected(null); setSessionsLoading(false); setSessionError('');
    void analyticsApi.summary(days, controller.signal).then(data => {
      if (!controller.signal.aborted) { setSummary(data); setSessions(data.recentSessions); }
    }).catch(err => { if (!controller.signal.aborted) setError(errorMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [allowed, days, revision]);

  useEffect(() => {
    if (!allowed || !summary || sessionPage === 1) { if (summary) { setSessions(summary.recentSessions); setSessionsLoading(false); setSessionError(''); } return; }
    const controller = new AbortController(); setSessionsLoading(true); setSessionError(''); setSessions({ items: [], hasMore: false });
    void analyticsApi.sessions(days, sessionPage, controller.signal).then(data => { if (!controller.signal.aborted) setSessions(data); })
      .catch(err => { if (!controller.signal.aborted) setSessionError(errorMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setSessionsLoading(false); });
    return () => controller.abort();
  }, [allowed, summary, days, sessionPage]);

  useEffect(() => {
    if (!selected || !allowed) return;
    const controller = new AbortController(); setJourney(null); setJourneyError('');
    void analyticsApi.journey(selected, days, journeyPage, controller.signal).then(data => { if (!controller.signal.aborted) setJourney(data); })
      .catch(err => { if (!controller.signal.aborted) setJourneyError(errorMessage(err)); });
    return () => controller.abort();
  }, [selected, allowed, days, journeyPage]);

  if (!allowed) return <main className="page admin-page admin-access"><ShieldCheck size={32} /><h1>Khu vực quản trị</h1><p>{user ? 'Tài khoản của bạn không có quyền truy cập dashboard.' : 'Đăng nhập bằng tài khoản Admin để xem số liệu.'}</p>{!user && <button className="primary" onClick={onAuth}>Đăng nhập quản trị</button>}<a href="/">Quay lại trang chủ</a></main>;

  return <main className="page admin-page">
    <header className="admin-heading">
      <div><span className="section-kicker"><ShieldCheck size={14} /> Quản trị VRhythm</span><h1>Nhịp hoạt động.</h1><p>Theo dõi hành trình người học và hoạt động trên website.</p></div>
      <div className="admin-controls"><label>Khoảng thời gian<select value={days} onChange={event => setDays(Number(event.target.value))}><option value={7}>7 ngày qua</option><option value={30}>30 ngày qua</option><option value={90}>90 ngày qua</option></select></label><button className="admin-refresh" disabled={loading} onClick={() => setRevision(value => value + 1)} aria-label="Làm mới số liệu"><RefreshCw size={18} /></button></div>
    </header>
    {loading && <p role="status" className="admin-state">Đang tải số liệu…</p>}
    {error && <div role="alert" className="admin-state"><p>{error}</p><button className="text-button" onClick={() => setRevision(value => value + 1)}>Thử lại</button></div>}
    {summary && !loading && <>
      <section className="admin-stats" aria-label="Tổng quan hoạt động">
        {[['Người dùng hoạt động', summary.activeUsers, `${number(summary.totalUsers)} tài khoản · ${number(summary.newUsers)} mới`], ['Phiên hoạt động', summary.sessions, 'Bao gồm khách chưa đăng nhập'], ['Lượt xem trang', summary.pageViews, `${number(summary.interactions)} tương tác được ghi nhận`], ['Đăng ký khóa học', summary.enrollments, `${number(summary.completedLessons)} bài học hoàn thành`]].map(([label, count, detail]) => <article key={label}><p>{label}</p><strong>{number(Number(count))}</strong><small>{detail}</small></article>)}
      </section>
      {!summary.firstEventAt && <p className="admin-notice">Chưa có dữ liệu truy cập. Sự kiện sẽ xuất hiện khi người dùng sử dụng bản web mới; lịch sử học tập bên dưới được lấy từ database hiện có.</p>}
      <section className="admin-panel" aria-labelledby="visits-title">
        <div className="admin-panel-heading"><div><h2 id="visits-title">Lượt xem theo ngày</h2><p>{date(summary.since)} – {date(summary.until)} · Ngày thống kê theo UTC</p></div><span className="admin-legend"><i /> Lượt xem</span></div>
        <VisitChart rows={summary.daily} />
        <details className="admin-chart-data"><summary>Xem số liệu từng ngày</summary><div className="admin-table-scroll"><table><thead><tr><th>Ngày (UTC)</th><th>Lượt xem</th><th>Phiên có lượt xem</th></tr></thead><tbody>{summary.daily.map(row => <tr key={row.day}><td>{date(row.day)}</td><td>{number(row.pageViews)}</td><td>{number(row.sessions)}</td></tr>)}</tbody></table></div></details>
      </section>
      <div className="admin-columns">
        <section className="admin-panel"><h2>Trang được xem nhiều</h2>{!summary.pages.length ? <p className="admin-empty">Chưa ghi nhận lượt xem trang.</p> : <ol className="admin-page-ranks">{summary.pages.map(row => <li key={row.path}><div><span>{pageName(row.path)}</span><small>{row.path}</small><div className="admin-rank-track"><i style={{ width: `${100 * row.views / Math.max(1, summary.pages[0].views)}%` }} /></div></div><strong>{number(row.views)}</strong></li>)}</ol>}</section>
        <section className="admin-panel"><h2>Người dùng đi đâu tiếp?</h2><p className="admin-subtle">Các lần chuyển trang do trình duyệt ghi nhận.</p>{!summary.transitions.length ? <p className="admin-empty">Chưa có hành trình giữa các trang.</p> : <ul className="admin-transitions">{summary.transitions.map(row => <li key={`${row.from}:${row.to}`}><span>{pageName(row.from)} <ArrowRight size={14} aria-hidden="true" /> {pageName(row.to)}</span><strong>{number(row.count)}</strong></li>)}</ul>}</section>
      </div>
      <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Phiên truy cập gần đây</h2><p>Chọn một phiên để xem hoạt động và tài khoản đã tham gia.</p></div></div>
        {sessionError && <p role="alert">{sessionError}</p>}
        {sessionsLoading ? <p role="status">Đang tải phiên…</p> : sessionError ? null : !sessions.items.length ? <p className="admin-empty">Chưa có phiên hoạt động.</p> : <div className="admin-table-scroll"><table className="admin-sessions-table" aria-label="Phiên truy cập"><thead><tr><th>Phiên</th><th>Người tham gia</th><th>Sự kiện</th><th>Gần nhất</th><th><span className="sr-only">Chi tiết</span></th></tr></thead><tbody>{sessions.items.map(session => <tr key={session.sessionId}><td><code>{session.sessionId.slice(0, 8)}</code><small className="admin-mobile-session">{session.users ? `${session.users} tài khoản` : 'Khách'}<br />{time(session.lastAt)}</small></td><td>{session.users ? `${session.users} tài khoản` : 'Khách'}</td><td>{number(session.events)}</td><td>{time(session.lastAt)}</td><td><button className="text-button" disabled={sessionsLoading} onClick={() => { setSelected(session.sessionId); setJourneyPage(1); }}>Xem đường đi <ArrowRight size={14} /></button></td></tr>)}</tbody></table></div>}
        <Pagination page={sessionPage} hasMore={sessions.hasMore} busy={sessionsLoading} onPage={setSessionPage} />
      </section>
      {selected && <section className="admin-panel admin-journey" aria-labelledby="journey-title"><div className="admin-panel-heading"><div><h2 id="journey-title">Đường đi của phiên {selected.slice(0, 8)}</h2><p>Hoạt động mới nhất trước · Thời gian theo thiết bị của bạn</p></div><button className="text-button" onClick={() => setSelected(null)}>Đóng chi tiết</button></div>
        {journeyError && <p role="alert">{journeyError}</p>}
        {!journey && !journeyError && <p role="status">Đang tải đường đi…</p>}
        {journey && <>{!journey.events.length && <p className="admin-empty">Không có sự kiện trong khoảng thời gian này.</p>}<ol className="admin-timeline">{journey.events.map(event => <li key={event.id}><span className="admin-timeline-dot" /><div><strong>{actionNames[event.action ?? event.kind] ?? 'Hoạt động'} · {pageName(event.path)}</strong><p>{event.userId ? `${event.userName ?? 'Người dùng'} (#${event.userId})` : 'Khách chưa đăng nhập'} · {time(event.occurredAt)}</p>{event.previousPath && event.previousPath !== event.path && <small>Từ {pageName(event.previousPath)} <ArrowDown size={12} aria-hidden="true" /> {event.path}</small>}</div></li>)}</ol><Pagination page={journeyPage} hasMore={journey.hasMore} busy={false} onPage={setJourneyPage} /></>}
      </section>}
      <section className="admin-learning" aria-label="Học tập và thanh toán"><div><span>Lượt làm bài</span><strong>{number(summary.examAttempts)}</strong></div><div><span>Đơn đã thanh toán</span><strong>{number(summary.paidOrders)}</strong></div><div><span>Doanh thu đã xác nhận</span><strong>{number(summary.revenueVnd)}đ</strong></div><div><span>Trợ lý AI</span><strong>{number(summary.chatRequests)} lượt</strong><small>{number(summary.chatTokens)} token</small></div></section>
      <footer className="admin-footnote">Lưu sự kiện trong 90 ngày. Không ghi nội dung nhập, mật khẩu, token, câu hỏi chat hay âm thanh. Thống kê truy cập có thể thiếu nếu trình duyệt chặn theo dõi.{summary.firstEventAt && <> Dữ liệu truy cập còn lưu từ {date(summary.firstEventAt)}.</>}</footer>
    </>}
  </main>;
}

function Pagination({ page, hasMore, busy, onPage }: { page: number; hasMore: boolean; busy: boolean; onPage: (page: number) => void }) {
  if (page === 1 && !hasMore) return null;
  return <div className="admin-pagination"><button className="text-button" disabled={busy || page === 1} onClick={() => onPage(page - 1)}><ArrowLeft size={16} /> Trang trước</button><span>Trang {page}</span><button className="text-button" disabled={busy || !hasMore} onClick={() => onPage(page + 1)}>Trang sau <ArrowRight size={16} /></button></div>;
}

function VisitChart({ rows }: { rows: AnalyticsSummary['daily'] }) {
  const root = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(960);
  useEffect(() => {
    if (!root.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, entry.contentRect.width)));
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  const max = Math.max(2, ...rows.map(row => row.pageViews));
  const x = (i: number) => 40 + i / Math.max(1, rows.length - 1) * (width - 60);
  const points = rows.map((row, i) => `${x(i)},${175 - row.pageViews / max * 145}`);
  return <div className="admin-chart" ref={root}><svg viewBox={`0 0 ${width} 210`} role="img" aria-label={`Biểu đồ lượt xem trong ${rows.length} ngày. Số liệu chi tiết ở bảng bên dưới.`}>{[0, 0.5, 1].map(ratio => <g key={ratio}><line x1="40" x2={width - 20} y1={175 - 145 * ratio} y2={175 - 145 * ratio} /><text x="30" y={179 - 145 * ratio} textAnchor="end">{number(Math.round(max * ratio))}</text></g>)}<polyline points={points.join(' ')} fill="none" className="admin-chart-line" />{rows.length <= 7 && rows.map((row, i) => <circle key={row.day} cx={x(i)} cy={175 - row.pageViews / max * 145} r="4"><title>{date(row.day)}: {row.pageViews} lượt xem</title></circle>)}{rows.length > 0 && <><text x="40" y="205">{date(rows[0].day)}</text><text x={width - 20} y="205" textAnchor="end">{date(rows.at(-1)!.day)}</text></>}</svg></div>;
}
