import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, Copy, Crown, ExternalLink, QrCode, ShieldCheck, Sparkles, X } from 'lucide-react';
import { api, type AuthResponse, type CheckoutOrder, type LearningPackage } from '../services/api';
import { parsePayOSCallbackParams, premiumStorage, type PayOSPaymentResponse, type PremiumSubscription } from '../services/payos';
import './packages-page.css';

const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`;

export function PackagesPage({ user, onAuth }: { user: AuthResponse | null; onAuth: () => void }) {
  const [packages, setPackages] = useState<LearningPackage[]>([]);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [payosData, setPayosData] = useState<PayOSPaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'warn'; message: string } | null>(null);
  const [retry, setRetry] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(() => premiumStorage.isActive());
  const [premiumInfo, setPremiumInfo] = useState<PremiumSubscription | null>(() => premiumStorage.get());
  const [showCelebration, setShowCelebration] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 minutes for VietQR transaction

  const requestId = useRef(crypto.randomUUID());
  const working = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Check PayOS return URL parameters on mount
  useEffect(() => {
    const callback = parsePayOSCallbackParams(window.location.search);
    if (callback.isCallback) {
      if (callback.status === 'PAID') {
        const sub = premiumStorage.activate(
          callback.orderCode ?? Date.now(),
          'flute-plus',
          'Gói Premium Chuyên Sâu',
          59000,
          30
        );
        setIsPremium(true);
        setPremiumInfo(sub);
        setShowCelebration(true);
        setNotification({ type: 'success', message: 'Thanh toán PayOS thành công! Quyền truy cập Premium đã được kích hoạt.' });
        window.history.replaceState({}, '', '/packages');
      } else if (callback.status === 'CANCELLED') {
        setNotification({ type: 'warn', message: 'Bạn đã hủy lượt thanh toán PayOS. Bạn có thể thử lại bất cứ lúc nào.' });
        window.history.replaceState({}, '', '/packages');
      }
    }
  }, []);

  // Timer for QR payment countdown
  useEffect(() => {
    if (!payosData) return;
    setCountdown(900);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [payosData]);

  // Load packages and previous demo order if any
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError('');

    void (async () => {
      try {
        const result = await api.getPackages(controller.signal);
        if (!active) return;
        setPackages(result);

        const id = new URLSearchParams(window.location.search).get('order');
        if (id && user) {
          const existing = await api.getCheckout(id);
          if (active) setOrder(existing);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Không tải được các gói học. Vui lòng thử lại.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; controller.abort(); };
  }, [retry, user?.userId]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(() => {});
  };

  const handlePayOSCheckout = async (packageCode: string) => {
    if (!user) {
      sessionStorage.setItem('vrhythm_return_to', '/packages');
      onAuth();
      return;
    }
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError('');

    try {
      const paymentData = await api.createPayOSPayment(packageCode);
      if (!mounted.current) return;
      setPayosData(paymentData);
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : 'Không thể khởi tạo cổng thanh toán PayOS. Vui lòng thử lại.');
      }
    } finally {
      working.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  const handleConfirmPaid = () => {
    if (!payosData) return;
    const sub = premiumStorage.activate(
      payosData.orderCode,
      'flute-plus',
      'Gói Premium Chuyên Sâu',
      payosData.amount,
      30
    );
    setIsPremium(true);
    setPremiumInfo(sub);
    setPayosData(null);
    setShowCelebration(true);
    setNotification({ type: 'success', message: 'Kích hoạt thành công gói Premium Chuyên Sâu qua PayOS!' });
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="page packages-page">
      <a className="text-button back-link" href="/learn/sao">← Quay lại lộ trình học sáo trúc</a>

      <header className="packages-intro">
        <span className="section-kicker"><Sparkles size={14} /> Nâng tầm kỹ nghệ âm nhạc</span>
        <h1>Học sáo trúc sâu hơn.<br /><em>Cùng tài khoản Premium.</em></h1>
        <p>Mở khóa toàn bộ bài học nâng cao, kỹ thuật rung hơi, vuốt ngón, chuyển nốt và thư viện sheet nhạc độc quyền cùng công nghệ nhận diện cao độ AI.</p>
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

      {/* Celebration Card for Active Premium */}
      {(showCelebration || isPremium) && (
        <section className="premium-active-card" aria-label="Trạng thái Premium">
          <div className="premium-card-header">
            <div className="crown-badge"><Crown size={28} /></div>
            <div>
              <h2>Bạn đang sở hữu Tài khoản Premium</h2>
              <p>Toàn bộ các khóa học nâng cao (Khóa 6 & 7) và tính năng AI Scoring đã được mở khóa vĩnh viễn trong thời hạn gói.</p>
              {premiumInfo?.expiresAt && (
                <small className="expires-tag">Hạn dùng đến: {new Date(premiumInfo.expiresAt).toLocaleDateString('vi-VN')}</small>
              )}
            </div>
          </div>
          <div className="unlocked-features-grid">
            <div className="unlocked-feature-item">
              <CheckCircle2 size={18} className="feature-icon" />
              <span><strong>Khóa 6:</strong> Sáo trúc — Hơi đều và chuyển nốt (Luyện cơ hoành & rung hơi)</span>
            </div>
            <div className="unlocked-feature-item">
              <CheckCircle2 size={18} className="feature-icon" />
              <span><strong>Khóa 7:</strong> Sáo trúc — Luyện câu nhạc (Kỹ thuật luyến láy, vuốt nốt điêu luyện)</span>
            </div>
            <div className="unlocked-feature-item">
              <CheckCircle2 size={18} className="feature-icon" />
              <span><strong>AI Scoring:</strong> Nhận diện cao độ qua micro không giới hạn</span>
            </div>
            <div className="unlocked-feature-item">
              <CheckCircle2 size={18} className="feature-icon" />
              <span><strong>Sheet Music:</strong> Tải toàn bộ bản ký âm chuẩn Bravura</span>
            </div>
          </div>
          <div className="premium-actions">
            <a className="primary" href="/learn/sao">Vào học khóa học nâng cao ngay <ArrowRight size={18} /></a>
          </div>
        </section>
      )}

      {/* Packages Grid */}
      {!loading && !packages.length && !error && (
        <p>Các gói học đang được cập nhật. <a href="/learn/sao">Tiếp tục học miễn phí</a></p>
      )}

      {!loading && (
        <div className="packages-grid">
          {/* Free Tier */}
          <section className="package-card free-card" aria-labelledby="package-free">
            <div className="card-top">
              <span className="package-tier-badge">Cơ bản</span>
              <h2 id="package-free">Học Miễn Phí</h2>
              <p className="package-price">0đ<span>/trọn đời</span></p>
              <p className="card-desc">Làm quen với sáo trúc, cách phát âm những nốt đầu tiên và bài Bèo Dạt Mây Trôi.</p>
            </div>
            <ul className="package-features">
              <li><Check size={16} /> 2 Khóa cơ bản nền tảng (Khóa 1 & 5)</li>
              <li><Check size={16} /> Nhận diện nốt và luyện cao độ cơ bản</li>
              <li><Check size={16} /> Đọc ký âm sheet nhạc chuẩn 75%</li>
              <li className="dimmed">✕ Khóa học kỹ thuật nâng cao (Khóa 6 & 7)</li>
              <li className="dimmed">✕ Không giới hạn thời lượng AI Scoring</li>
            </ul>
            <div className="card-action">
              <a className="secondary-action" href="/learn/sao">Bắt đầu học miễn phí <ArrowRight size={16} /></a>
            </div>
          </section>

          {/* Premium Tier */}
          <section className="package-card premium-card" aria-labelledby="package-premium">
            <div className="card-ribbon">
              <Sparkles size={13} /> KHUYÊN DÙNG ĐỂ HỌC SÂU HƠN
            </div>
            <div className="card-top">
              <span className="package-tier-badge gold">Tài khoản Premium</span>
              <h2 id="package-premium">Gói Chuyên Sâu (Plus)</h2>
              <p className="package-price gold-price">59.000đ<span>/tháng (30 ngày)</span></p>
              <p className="card-desc">Dành cho người học muốn nắm vững cột hơi, vuốt ngón, luyến láy để diễn tấu trọn vẹn tác phẩm.</p>
            </div>
            <ul className="package-features highlight">
              <li><Check size={16} className="gold-check" /> <strong>Mở khóa trọn bộ Khóa 6:</strong> Sáo trúc — Hơi đều và chuyển nốt</li>
              <li><Check size={16} className="gold-check" /> <strong>Mở khóa trọn bộ Khóa 7:</strong> Sáo trúc — Luyện câu nhạc & luyến láy</li>
              <li><Check size={16} className="gold-check" /> Chấm điểm & phân tích cao độ thời gian thực với AI Pitch Detector</li>
              <li><Check size={16} className="gold-check" /> Trợ lý gia sư Flute AI hỏi đáp kỹ thuật không giới hạn</li>
              <li><Check size={16} className="gold-check" /> Thanh toán tự động bảo mật qua Cổng PayOS (VietQR)</li>
            </ul>
            <div className="card-action">
              {isPremium ? (
                <div className="activated-status">
                  <CheckCircle2 size={18} className="gold-check" />
                  <span>Đã kích hoạt trên tài khoản</span>
                </div>
              ) : (
                <button
                  className="primary gold-button"
                  disabled={busy}
                  onClick={() => handlePayOSCheckout('flute-plus')}
                >
                  <QrCode size={18} />
                  {busy ? 'Đang kết nối PayOS…' : user ? 'Nâng cấp Premium qua PayOS' : 'Đăng nhập để nâng cấp Premium'}
                </button>
              )}
              <p className="package-note">
                <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Thanh toán an toàn qua cổng PayOS · Quét mã VietQR bằng mọi app ngân hàng.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* PayOS VietQR Payment Modal */}
      {payosData && (
        <div className="payos-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="payos-modal-title">
          <div className="payos-modal-card">
            <button className="payos-modal-close" onClick={() => setPayosData(null)} aria-label="Đóng cửa sổ"><X size={20} /></button>
            <div className="payos-modal-header">
              <span className="payos-badge">Cổng thanh toán PayOS</span>
              <h2 id="payos-modal-title">Quét mã VietQR để nâng cấp Premium</h2>
              <p className="payos-timer">Mã giao dịch có hiệu lực trong: <strong>{formatCountdown(countdown)}</strong></p>
            </div>

            <div className="payos-modal-body">
              {/* QR Code Container */}
              <div className="payos-qr-box">
                <img
                  src={payosData.qrCode}
                  alt={`Mã VietQR thanh toán PayOS ${money(payosData.amount)}`}
                  className="payos-qr-img"
                />
                <p className="payos-qr-hint">Mở ứng dụng ngân hàng hoặc MoMo quét mã QR trên</p>
              </div>

              {/* Bank Transfer Details with One-click Copy */}
              <div className="payos-details-list">
                <div className="payos-detail-row">
                  <span className="label">Ngân hàng</span>
                  <span className="value">MB Bank (Quân Đội)</span>
                </div>

                <div className="payos-detail-row">
                  <span className="label">Số tài khoản</span>
                  <span className="value-with-copy">
                    <strong>{payosData.accountNumber}</strong>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(payosData.accountNumber, 'acc')}
                      title="Sao chép số tài khoản"
                    >
                      {copiedField === 'acc' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      {copiedField === 'acc' ? 'Đã chép' : 'Chép'}
                    </button>
                  </span>
                </div>

                <div className="payos-detail-row">
                  <span className="label">Chủ tài khoản</span>
                  <span className="value">{payosData.accountName}</span>
                </div>

                <div className="payos-detail-row">
                  <span className="label">Số tiền</span>
                  <span className="value-with-copy">
                    <strong className="amount-highlight">{money(payosData.amount)}</strong>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(payosData.amount.toString(), 'amount')}
                      title="Sao chép số tiền"
                    >
                      {copiedField === 'amount' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      {copiedField === 'amount' ? 'Đã chép' : 'Chép'}
                    </button>
                  </span>
                </div>

                <div className="payos-detail-row">
                  <span className="label">Nội dung chuyển khoản</span>
                  <span className="value-with-copy">
                    <strong className="code-highlight">{payosData.description}</strong>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(payosData.description, 'desc')}
                      title="Sao chép nội dung"
                    >
                      {copiedField === 'desc' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      {copiedField === 'desc' ? 'Đã chép' : 'Chép'}
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div className="payos-modal-footer">
              <button className="primary confirm-btn" onClick={handleConfirmPaid}>
                <CheckCircle2 size={18} /> Tôi đã chuyển khoản thành công
              </button>
              {payosData.checkoutUrl && (
                <a
                  href={payosData.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-button payos-checkout-link"
                >
                  Mở trang thanh toán PayOS <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
