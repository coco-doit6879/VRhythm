import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Crown,
  ExternalLink,
  QrCode,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { api, type AuthResponse, type CheckoutOrder, type LearningPackage } from '../services/api';
import { refreshMembership, type Membership } from '../services/useMembership';
import { useScrollReveal } from './useScrollReveal';
import './packages-page.css';

const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`;
const statusLabels: Record<CheckoutOrder['status'], string> = {
  Creating: 'Đang tạo đơn',
  Pending: 'Đang chờ thanh toán',
  Paid: 'Đã thanh toán',
  DemoSucceeded: 'Lượt thử',
  Failed: 'Không thành công',
  Cancelled: 'Đã hủy',
  Expired: 'Đã hết hạn',
};

function checkoutUrl(value?: string) {
  try {
    const url = new URL(value ?? '');
    return url.origin === 'https://pay.payos.vn' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

function storedRequestId(userId: number) {
  const key = `vrhythm_payos_request_${userId}`;
  const existing = sessionStorage.getItem(key);
  if (existing && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(existing)) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(key, id);
  return id;
}

export function PackagesPage({ user, onAuth, membership }: { membership: Membership; user: AuthResponse | null; onAuth: () => void }) {
  const [packages, setPackages] = useState<LearningPackage[]>([]);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'warn'; message: string } | null>(null);
  const [retry, setRetry] = useState(0);

  const root = useScrollReveal('.package-card');
  const working = useRef(false);
  const mounted = useRef(true);
  const paidPackage = packages.find(p => p.code === 'flute-plus');
  useEffect(() => { if (order?.status === 'Paid') refreshMembership(); }, [order?.status]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setOrder(null);
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
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Không tải được các gói học.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [retry, user?.userId]);

  useEffect(() => {
    if (!order || order.isDemo || !['Pending', 'Creating'].includes(order.status)) return;
    let active = true;
    let attempts = 0;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const updated = await api.getPayOSCheckout(order.id, controller.signal);
        if (active) setOrder(updated);
      } catch {
        /* Manual verification remains available after transient polling errors. */
      }
      if (active && ++attempts < 24) timer = setTimeout(() => void poll(), 5000);
    };
    timer = setTimeout(() => void poll(), 5000);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [order?.id, order?.status]);

  const handlePayOSCheckout = async () => {
    if (!user) {
      sessionStorage.setItem('vrhythm_return_to', '/packages');
      onAuth();
      return;
    }
    if (membership.loading || membership.error || membership.hasPremium) return;
    if (working.current || (paidPackage && paidPackage.checkoutMode !== 'PayOS')) return;
    working.current = true;
    setBusy(true);
    setError('');
    setVerifyError('');
    // Reserve the tab during the click, before the API await loses user activation.
    const paymentTab = window.open('', '_blank');
    if (paymentTab) {
      paymentTab.opener = null;
      paymentTab.document.title = 'Thanh toán VRhythm';
      paymentTab.document.body.textContent = 'Đang mở cổng thanh toán PayOS…';
    }
    try {
      const packageCode = paidPackage?.code ?? 'flute-plus';
      const result = await api.createPayOSCheckout(packageCode, storedRequestId(user.userId));
      if (!mounted.current) { paymentTab?.close(); return; }
      setOrder(result);
      window.history.replaceState({}, '', `/packages?order=${encodeURIComponent(result.id)}`);
      const url = checkoutUrl(result.checkoutUrl);
      if (url && result.status === 'Pending') {
        if (paymentTab && !paymentTab.closed) paymentTab.location.replace(url);
        else setNotification({ type: 'info', message: 'Nhấn “Mở trang PayOS” trong đơn hàng để thanh toán ở tab mới.' });
      } else {
        paymentTab?.close();
      }
    } catch (err) {
      paymentTab?.close();
      if (mounted.current) setError(err instanceof Error ? err.message : 'Không thể kết nối PayOS.');
    } finally {
      working.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  const verifyPayment = async () => {
    if (!order || working.current) return;
    working.current = true;
    setVerifying(true);
    setVerifyError('');
    try {
      const result = await api.getPayOSCheckout(order.id);
      if (mounted.current) setOrder(result);
    } catch (err) {
      if (mounted.current) setVerifyError(err instanceof Error ? err.message : 'Chưa thể xác nhận thanh toán.');
    } finally {
      working.current = false;
      if (mounted.current) setVerifying(false);
    }
  };

  const resetOrder = () => {
    if (order && ['Pending', 'Creating'].includes(order.status)) {
      setNotification({ type: 'info', message: 'Đơn chưa thanh toán vẫn được giữ lại khi bạn chọn gói lần nữa.' });
    } else if (user) {
      sessionStorage.removeItem(`vrhythm_payos_request_${user.userId}`);
    }
    setOrder(null);
    setVerifyError('');
    window.history.replaceState({}, '', '/packages');
  };

  return (
    <main className="packages-page" ref={root}>
      {/* Editorial Intro Hero Section */}
      <section className="packages-intro" aria-labelledby="packages-title">
        <a className="packages-back-link" href="/learn">
          ← Quay lại danh mục học nhạc cụ
        </a>

        <div className="packages-intro-grid">
          <div className="packages-intro-main">
            <p className="packages-label">
              Tinh hoa Âm nhạc Dân tộc
            </p>
            <h1 id="packages-title">
              Chinh phục nhạc cụ,<br />
              <em>cùng VRhythm Premium</em>
            </h1>
          </div>

          <div className="packages-intro-aside">
            <p>
              Lộ trình học tập toàn diện từ nền tảng đến điêu luyện cho 6 bộ môn nhạc cụ dân tộc Việt Nam, kết hợp công nghệ chấm điểm AI Pitch Detector thời gian thực và kho ký âm Bravura độc quyền.
            </p>
            <a href="#cac-goi-hoc">
              Xem chi tiết các gói học <ArrowDown size={17} />
            </a>
          </div>
        </div>
      </section>

      {/* Guide Strip / Heritage Value Props */}
      <div className="packages-guide" aria-label="Ưu thế độc quyền">
        <div>
          <span>01</span>
          <div>
            <strong>Lộ trình chuẩn hóa 6 nhạc cụ</strong>
            <small>Từ bài tập vỡ lòng, tư thế cầm đàn đến kỹ thuật rung hơi, nhấn nhá điêu luyện</small>
          </div>
        </div>
        <div>
          <span>02</span>
          <div>
            <strong>Công nghệ AI Pitch Detector</strong>
            <small>Chấm điểm cao độ và trường độ thực tế qua micro theo thời gian thực</small>
          </div>
        </div>
        <div>
          <span>03</span>
          <div>
            <strong>Ký âm Bravura & Gia sư 24/7</strong>
            <small>Kho sheet nhạc tương tác độc quyền cùng trợ lý AI giải đáp kỹ thuật mọi lúc</small>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`packages-notification ${notification.type}`} role="status">
          <p>{notification.message}</p>
          <button className="close-btn" onClick={() => setNotification(null)} aria-label="Đóng thông báo">
            <X size={16} />
          </button>
        </div>
      )}

      {loading && <p role="status" className="packages-loading">Đang tải danh sách các gói học…</p>}
      {error && (
        <div className="packages-error" role="alert">
          <p>{error}</p>
          <button className="text-button" disabled={busy} onClick={() => setRetry(v => v + 1)}>
            Thử lại
          </button>
        </div>
      )}

      {order && (
        <section className="premium-active-card checkout-summary" aria-label="Trạng thái đơn hàng">
          <div className="premium-card-header">
            <div className="crown-badge">
              {order.status === 'Paid' ? <CheckCircle2 size={28} /> : <QrCode size={28} />}
            </div>
            <div>
              <h2>
                {order.status === 'Paid'
                  ? 'Thanh toán đã được xác nhận'
                  : order.status === 'Pending' || order.status === 'Creating'
                    ? 'Chờ xác nhận thanh toán'
                    : 'Đơn thanh toán đã kết thúc'}
              </h2>
              <p>
                {money(order.amountVnd)} · {order.accessDays} ngày · {statusLabels[order.status]}
              </p>
              <p>
                {order.status === 'Paid'
                  ? 'Quyền học đã được cập nhật trên tài khoản của bạn.'
                  : 'Quyền học chỉ được mở sau khi máy chủ xác nhận thanh toán.'}
              </p>
            </div>
          </div>
          <div className="premium-actions">
            {order.status === 'Paid' ? (
              <a className="primary" href="/learn">
                Khám phá các khóa học ngay <ArrowRight size={18} />
              </a>
            ) : (
              <>
                {order.status === 'Pending' && checkoutUrl(order.checkoutUrl) && (
                  <a className="primary" href={checkoutUrl(order.checkoutUrl)!} target="_blank" rel="noopener noreferrer">
                    Mở trang PayOS <ExternalLink size={18} />
                  </a>
                )}
                {['Pending', 'Creating'].includes(order.status) && (
                  <button className="text-button" disabled={verifying} onClick={() => void verifyPayment()}>
                    <RefreshCw size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    {verifying ? 'Đang kiểm tra…' : 'Kiểm tra thanh toán'}
                  </button>
                )}
              </>
            )}
            <button className="text-button" disabled={busy || verifying} onClick={resetOrder}>
              Chọn lại gói
            </button>
          </div>
          {order.status === 'Pending' && (
            <p className="package-note">
              <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              Mở trang PayOS để quét mã QR chính thức của đơn hàng này.
            </p>
          )}
          {verifyError && <p role="alert" className="error-text">{verifyError}</p>}
        </section>
      )}

      {user && <section className="package-note" aria-label="Trạng thái gói">
        {membership.loading ? <p role="status">Đang kiểm tra gói tài khoản…</p> : membership.error ? <p role="alert">{membership.error} <button onClick={membership.refresh}>Thử lại trạng thái gói</button></p> : membership.hasPremium && membership.premiumUntil ? <p>Gói Plus của bạn còn hạn đến {new Date(membership.premiumUntil).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}. <a href="/learn/sao">Vào học Plus</a></p> : null}
      </section>}
      {/* Packages Section Heading */}
      <section className="packages-catalog-section" id="cac-goi-hoc" aria-labelledby="packages-archive-title">
        <div className="packages-archive-heading">
          <div>
            <p className="packages-label">Lựa chọn gói đồng hành</p>
            <h2 id="packages-archive-title">
              Khởi đầu miễn phí<br />
              <em>hoặc nâng tầm chuyên sâu</em>
            </h2>
          </div>
          <p className="packages-results">Mở khóa trọn vẹn toàn bộ 6 nhạc cụ và khoá học nâng cao</p>
        </div>

        {!loading && !packages.length && !error && (
          <p>Các gói học đang được cập nhật. <a href="/learn">Tiếp tục học miễn phí</a></p>
        )}

        {/* Packages Grid */}
        {!loading && (
          <div className="packages-grid">
            {/* Free Tier */}
            <section className="package-card free-card" aria-labelledby="package-free">
              <div className="card-top">
                <span className="package-tier-badge">Cơ bản</span>
                <h3 id="package-free">Học Miễn Phí</h3>
                <p className="package-price">0đ<span>/trọn đời</span></p>
                <p className="card-desc">
                  Khám phá các nốt nhạc đầu tiên, cấu tạo nhạc cụ và kiến thức văn hóa di sản âm nhạc truyền thống.
                </p>
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
                <a className="packages-card-btn secondary" href="/learn">
                  Khám phá miễn phí <ArrowUpRight size={17} />
                </a>
              </div>
            </section>

            {/* Premium Tier */}
            <section className="package-card premium-card" aria-labelledby="package-premium">
              <div className="card-ribbon">
                GÓI TOÀN DIỆN TẤT CẢ NHẠC CỤ
              </div>
              <div className="card-top">
                <span className="package-tier-badge gold">Tài khoản Premium All-Access</span>
                <h3 id="package-premium">Gói Chuyên Sâu (Plus)</h3>
                <p className="package-price gold-price">
                  {money(paidPackage?.amountVnd ?? 59000)}<span>/{paidPackage?.accessDays ?? 30} ngày</span>
                </p>
                <p className="card-desc">
                  Mở khóa trọn vẹn toàn bộ hệ thống nhạc cụ dân tộc, làm chủ kỹ thuật diễn tấu tinh tế và các tác phẩm biểu diễn kinh điển.
                </p>
              </div>
              <ul className="package-features highlight">
                <li>
                  <Check size={16} className="gold-check" />
                  <strong>Mở khóa toàn bộ khóa nâng cao:</strong> Sáo trúc, Đàn tranh, Đàn bầu, Đàn nguyệt, Đàn nhị, Tỳ bà
                </li>
                <li>
                  <Check size={16} className="gold-check" />
                  <strong>Kỹ thuật tinh hoa:</strong> Cột hơi cơ hoành, vuốt ngón, luyến láy, uốn cần, rung phím
                </li>
                <li>
                  <Check size={16} className="gold-check" />
                  Chấm điểm & phân tích cao độ chuẩn xác thời gian thực với AI Pitch Detector
                </li>
                <li>
                  <Check size={16} className="gold-check" />
                  Trợ lý gia sư AI VRhythm hướng dẫn kỹ thuật cá nhân hóa 24/7
                </li>
                <li>
                  <Check size={16} className="gold-check" />
                  Tải toàn bộ kho sheet nhạc ký âm chuẩn Bravura độc quyền
                </li>
                <li>
                  <Check size={16} className="gold-check" />
                  Thanh toán tự động, đối soát minh bạch qua Cổng PayOS (VietQR)
                </li>
              </ul>
              <div className="card-action">
                {membership.hasPremium ? (
                  <div className="activated-status">
                    <CheckCircle2 size={18} className="gold-check" />
                    <span>Plus đang hoạt động</span>
                  </div>
                ) : (
                  <button
                    data-activity="checkout_start"
                    className="packages-card-btn primary"
                    disabled={busy || membership.loading || Boolean(membership.error) || !paidPackage || paidPackage.checkoutMode !== 'PayOS'}
                    onClick={() => void handlePayOSCheckout()}
                  >
                    <QrCode size={18} />
                    {busy
                      ? 'Đang kết nối PayOS…'
                      : !paidPackage || paidPackage.checkoutMode !== 'PayOS'
                        ? 'Thanh toán chưa mở'
                        : user
                          ? 'Nâng cấp Premium qua PayOS'
                          : 'Đăng nhập để nâng cấp Premium'}
                  </button>
                )}
                <p className="packages-security-note">
                  <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  Thanh toán an toàn qua cổng PayOS · Quét mã VietQR bằng mọi ứng dụng ngân hàng.
                </p>
              </div>
            </section>
          </div>
        )}
      </section>

      {/* Feature Comparison Matrix Section */}
      <section className="packages-compare-section" aria-labelledby="compare-heading">
        <p className="packages-label" style={{ textAlign: 'center' }}>So sánh quyền lợi</p>
        <h2 id="compare-heading">
          Chi tiết quyền lợi<br />
          <em>từng cấp độ tài khoản</em>
        </h2>
        <div className="packages-compare-table-wrapper">
          <table className="packages-compare-table">
            <thead>
              <tr>
                <th>Tính năng & Quyền lợi</th>
                <th className="center">Gói Miễn Phí</th>
                <th className="center premium-col">Gói Premium Chuyên Sâu</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lộ trình học 6 bộ môn nhạc cụ dân tộc</td>
                <td className="center">Khóa nhập môn cơ bản</td>
                <td className="center"><strong>Toàn bộ khóa học từ cơ bản đến nâng cao</strong></td>
              </tr>
              <tr>
                <td>Chấm điểm cao độ thời gian thực AI Pitch Detector</td>
                <td className="center">Mô phỏng cơ bản</td>
                <td className="center"><strong>Không giới hạn qua micro thực tế</strong></td>
              </tr>
              <tr>
                <td>Kỹ thuật nâng cao (rung hơi, uốn cần, luyến láy, gảy móng)</td>
                <td className="center">✕</td>
                <td className="center"><strong>Đầy đủ chuyên đề và video phân tích</strong></td>
              </tr>
              <tr>
                <td>Kho sheet nhạc tương tác chuẩn Bravura</td>
                <td className="center">Chỉ xem bản nhạc mẫu</td>
                <td className="center"><strong>Toàn bộ kho nhạc & tải file ký âm</strong></td>
              </tr>
              <tr>
                <td>Trợ lý gia sư AI VRhythm giải đáp 24/7</td>
                <td className="center">✕</td>
                <td className="center"><strong>Trò chuyện & tư vấn kỹ thuật không giới hạn</strong></td>
              </tr>
              <tr>
                <td>Cập nhật nội dung & tác phẩm mới liên tục</td>
                <td className="center">Cơ bản</td>
                <td className="center"><strong>Ưu tiên mở khóa toàn bộ tác phẩm mới</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Editorial Closing CTA Section */}
      <section className="packages-closing">
        <h2>
          Thanh âm bạn yêu,<br />
          <em>sẵn sàng bắt đầu từ hôm nay</em>
        </h2>
        <p>
          Trải nghiệm học nhạc cụ dân tộc tương tác bài bản, kết hợp công nghệ chấm điểm AI Pitch Detector thông minh cùng VRhythm.
        </p>
        <div className="packages-closing-actions">
          {membership.hasPremium ? <a className="primary" href="/learn/sao">Vào học Plus <ArrowUpRight size={18} /></a> : <button
            data-activity="checkout_start"
            className="primary"
            disabled={busy || membership.loading || Boolean(membership.error) || !paidPackage || paidPackage.checkoutMode !== 'PayOS'}
            onClick={() => void handlePayOSCheckout()}
          >
            Nâng cấp tài khoản Premium <ArrowUpRight size={18} />
          </button>}
          <a className="secondary-link" href="/learn">
            Khám phá miễn phí trước <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="packages-footer">
        <a href="/">VRhythm</a>
        <span>Di sản · Nhịp điệu · Công nghệ</span>
        <a href="#packages-title">Về đầu trang ↑</a>
      </footer>
    </main>
  );
}
