import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, ExternalLink, QrCode, RefreshCw, ShieldCheck, Sparkles, X } from 'lucide-react';
import { api, type AuthResponse, type CheckoutOrder, type LearningPackage } from '../services/api';
import './packages-page.css';

const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`;
const statusLabels: Record<CheckoutOrder['status'], string> = { Creating: 'Đang tạo đơn', Pending: 'Đang chờ thanh toán', Paid: 'Đã thanh toán', DemoSucceeded: 'Lượt thử', Failed: 'Không thành công', Cancelled: 'Đã hủy', Expired: 'Đã hết hạn' };
function checkoutUrl(value?: string) {
  try { const url = new URL(value ?? ''); return url.origin === 'https://pay.payos.vn' && !url.username && !url.password ? url.href : null; } catch { return null; }
}
function storedRequestId(userId: number) {
  const key = `vrhythm_payos_request_${userId}`;
  const existing = sessionStorage.getItem(key);
  if (existing && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(existing)) return existing;
  const id = crypto.randomUUID(); sessionStorage.setItem(key, id); return id;
}

export function PackagesPage({ user, onAuth }: { user: AuthResponse | null; onAuth: () => void }) {
  const [packages, setPackages] = useState<LearningPackage[]>([]);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'warn'; message: string } | null>(null);
  const [retry, setRetry] = useState(0);
  const working = useRef(false);
  const mounted = useRef(true);
  const paidPackage = packages.find(p => p.code === 'flute-plus');

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true); setError(''); setOrder(null);
    void (async () => {
      try {
        const result = await api.getPackages(controller.signal);
        if (!active) return;
        setPackages(result);
        const id = new URLSearchParams(window.location.search).get('order');
        if (id && user) {
          const existing = await api.getPayOSCheckout(id, controller.signal);
          if (active) setOrder(existing);
        }
      } catch (err) { if (active) setError(err instanceof Error ? err.message : 'Không tải được các gói học.'); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; controller.abort(); };
  }, [retry, user?.userId]);

  useEffect(() => {
    if (!order || order.isDemo || !['Pending', 'Creating'].includes(order.status)) return;
    let active = true; let attempts = 0;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try { const updated = await api.getPayOSCheckout(order.id, controller.signal); if (active) setOrder(updated); }
      catch { /* Manual verification remains available after transient polling errors. */ }
      if (active && ++attempts < 24) timer = setTimeout(() => void poll(), 5000);
    };
    timer = setTimeout(() => void poll(), 5000);
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [order?.id, order?.status]);

  const handlePayOSCheckout = async () => {
    if (!user) { sessionStorage.setItem('vrhythm_return_to', '/packages'); onAuth(); return; }
    if (working.current || paidPackage?.checkoutMode !== 'PayOS') return;
    working.current = true; setBusy(true); setError(''); setVerifyError('');
    try {
      const result = await api.createPayOSCheckout(paidPackage.code, storedRequestId(user.userId));
      if (!mounted.current) return;
      setOrder(result);
      window.history.replaceState({}, '', `/packages?order=${encodeURIComponent(result.id)}`);
    } catch (err) { if (mounted.current) setError(err instanceof Error ? err.message : 'Không thể kết nối PayOS.'); }
    finally { working.current = false; if (mounted.current) setBusy(false); }
  };
  const verifyPayment = async () => {
    if (!order || working.current) return;
    working.current = true; setVerifying(true); setVerifyError('');
    try { const result = await api.getPayOSCheckout(order.id); if (mounted.current) setOrder(result); }
    catch (err) { if (mounted.current) setVerifyError(err instanceof Error ? err.message : 'Chưa thể xác nhận thanh toán.'); }
    finally { working.current = false; if (mounted.current) setVerifying(false); }
  };
  const resetOrder = () => {
    if (order && ['Pending', 'Creating'].includes(order.status)) {
      setNotification({ type: 'info', message: 'Đơn chưa thanh toán vẫn được giữ lại khi bạn chọn gói lần nữa.' });
    } else if (user) sessionStorage.removeItem(`vrhythm_payos_request_${user.userId}`);
    setOrder(null); setVerifyError(''); window.history.replaceState({}, '', '/packages');
  };

  return (
    <main className="page packages-page">
      <a className="text-button back-link" href="/learn">← Quay lại danh mục học nhạc cụ</a>

      <header className="packages-intro">
        <span className="section-kicker"><Sparkles size={14} /> Tinh hoa Âm nhạc Dân tộc</span>
        <h1>Chinh phục Nhạc cụ Truyền thống.<br /><em>Cùng tài khoản VRhythm Premium.</em></h1>
        <p>Lộ trình học tập toàn diện từ nền tảng đến điêu luyện cho Sáo trúc, Đàn tranh, Đàn bầu, Đàn nguyệt, Đàn nhị và Tỳ bà kết hợp công nghệ chấm điểm AI Pitch Detector thời gian thực.</p>
        
        <div className="packages-instrument-pills" aria-label="Các nhạc cụ được hỗ trợ">
          <span className="pill">🎋 Sáo trúc</span>
          <span className="pill">🪕 Đàn tranh</span>
          <span className="pill">🎸 Đàn bầu</span>
          <span className="pill">🌕 Đàn nguyệt</span>
          <span className="pill">🎻 Đàn nhị</span>
          <span className="pill">🪕 Tỳ bà</span>
        </div>
      </header>

      {notification && (
        <div className={`packages-notification ${notification.type}`} role="status">
          <p>{notification.message}</p>
          <button className="close-btn" onClick={() => setNotification(null)} aria-label="Đóng thông báo"><X size={16} /></button>
        </div>
      )}

      {loading && <p role="status" className="packages-loading">Đang tải danh sách các gói học…</p>}
      {error && (
        <div className="packages-error" role="alert">
          <p>{error}</p>
          <button className="text-button" disabled={busy} onClick={() => setRetry(v => v + 1)}>Thử lại</button>
        </div>
      )}

      {order && (
        <section className="premium-active-card checkout-summary" aria-label="Trạng thái đơn hàng">
          <div className="premium-card-header">
            <div className="crown-badge">{order.status === 'Paid' ? <CheckCircle2 size={28} /> : <QrCode size={28} />}</div>
            <div>
              <h2>{order.status === 'Paid' ? 'Thanh toán đã được xác nhận' : order.status === 'Pending' || order.status === 'Creating' ? 'Chờ xác nhận thanh toán' : 'Đơn thanh toán đã kết thúc'}</h2>
              <p>{money(order.amountVnd)} · {order.accessDays} ngày · {statusLabels[order.status]}</p>
              <p>{order.status === 'Paid' ? 'Quyền học đã được cập nhật trên tài khoản của bạn.' : 'Quyền học chỉ được mở sau khi máy chủ xác nhận thanh toán.'}</p>
            </div>
          </div>
          <div className="premium-actions">
            {order.status === 'Paid' ? <a className="primary" href="/learn/sao">Tiếp tục học sáo trúc <ArrowRight size={18} /></a> : <>
              {order.status === 'Pending' && checkoutUrl(order.checkoutUrl) && <a className="primary" href={checkoutUrl(order.checkoutUrl)!} target="_blank" rel="noopener noreferrer">Mở trang PayOS <ExternalLink size={18} /></a>}
              {['Pending', 'Creating'].includes(order.status) && <button className="text-button" disabled={verifying} onClick={() => void verifyPayment()}><RefreshCw size={16} />{verifying ? 'Đang kiểm tra…' : 'Kiểm tra thanh toán'}</button>}
            </>}
            <button className="text-button" disabled={busy || verifying} onClick={resetOrder}>Chọn lại gói</button>
          </div>
          {order.status === 'Pending' && <p className="package-note">Mở trang PayOS để quét mã QR chính thức của đơn hàng này.</p>}
          {verifyError && <p role="alert">{verifyError}</p>}
        </section>
      )}

      {/* Packages Grid */}
      {!loading && !packages.length && !error && (
        <p>Các gói học đang được cập nhật. <a href="/learn">Tiếp tục học miễn phí</a></p>
      )}

      {!loading && (
        <div className="packages-grid">
          {/* Free Tier */}
          <section className="package-card free-card" aria-labelledby="package-free">
            <div className="card-top">
              <span className="package-tier-badge">Cơ bản</span>
              <h2 id="package-free">Học Miễn Phí</h2>
              <p className="package-price">0đ<span>/trọn đời</span></p>
              <p className="card-desc">Khám phá các nốt nhạc đầu tiên, cấu tạo nhạc cụ và kiến thức văn hóa di sản âm nhạc truyền thống.</p>
            </div>
            <ul className="package-features">
              <li><Check size={16} /> Khóa học nhập môn nền tảng của các bộ môn nhạc cụ</li>
              <li><Check size={16} /> Luyện phát âm nốt cơ bản, nhận diện cao độ và cảm âm</li>
              <li><Check size={16} /> Tương tác thử nghiệm phím đàn, lỗ bấm mô phỏng trên web</li>
              <li><Check size={16} /> Xem và học theo sheet nhạc ký âm chuẩn Bravura</li>
              <li className="dimmed">✕ Các khóa đào tạo kỹ thuật nâng cao & diễn tấu chuyên sâu</li>
              <li className="dimmed">✕ Nhận diện cao độ qua micro không giới hạn với AI Pitch Detector</li>
              <li className="dimmed">✕ Trợ lý gia sư AI VRhythm giải đáp kỹ thuật 24/7</li>
            </ul>
            <div className="card-action">
              <a className="secondary-action" href="/learn">Khám phá miễn phí <ArrowRight size={16} /></a>
            </div>
          </section>

          {/* Premium Tier */}
          <section className="package-card premium-card" aria-labelledby="package-premium">
            <div className="card-ribbon">
              <Sparkles size={13} /> GÓI HỌC NÂNG CAO
            </div>
            <div className="card-top">
              <span className="package-tier-badge gold">Tài khoản Premium</span>
              <h2 id="package-premium">Gói Chuyên Sâu (Plus)</h2>
              <p className="package-price gold-price">{money(paidPackage?.amountVnd ?? 59000)}<span>/{paidPackage?.accessDays ?? 30} ngày</span></p>
              <p className="card-desc">Truy cập các khóa học trong gói trong 30 ngày, không tự gia hạn.</p>
            </div>
            <ul className="package-features highlight">
              {paidPackage?.courses.map(course => <li key={course.id}><Check size={16} className="gold-check" />{course.title}</li>)}
              <li><Check size={16} className="gold-check" /> Trợ lý AI hỗ trợ học sáo trúc khi Premium còn hạn</li>
              <li><Check size={16} className="gold-check" /> Thanh toán và xác nhận tự động qua PayOS</li>
            </ul>
            <div className="card-action">
              <button className="primary gold-button" disabled={busy || !paidPackage || paidPackage.checkoutMode !== 'PayOS'} onClick={() => void handlePayOSCheckout()}>
                <QrCode size={18} />
                {busy ? 'Đang kết nối PayOS…' : !paidPackage || paidPackage.checkoutMode !== 'PayOS' ? 'Thanh toán chưa mở' : user ? 'Nâng cấp Premium qua PayOS' : 'Đăng nhập để nâng cấp Premium'}
              </button>
              <p className="package-note">
                <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Thanh toán an toàn qua cổng PayOS · Quét mã VietQR bằng mọi app ngân hàng.
              </p>
            </div>
          </section>
        </div>
      )}

    </main>
  );
}
