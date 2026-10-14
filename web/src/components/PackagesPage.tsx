import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Check, CheckCircle2, Copy, Crown, ExternalLink, QrCode, RefreshCw, ShieldCheck, Sparkles, X } from 'lucide-react';
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
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
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

  // Lock body scroll and listen for ESC key when PayOS modal is open
  useEffect(() => {
    if (!payosData) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPayosData(null);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [payosData]);

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

  const handleVerifyPayment = async () => {
    if (!payosData) return;
    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await api.verifyPayOSPayment(payosData.orderCode);
      if (res.success && res.status === 'PAID') {
        const sub = premiumStorage.activate(
          payosData.orderCode,
          'all-access-plus',
          'Gói Chuyên Sâu Toàn Diện',
          payosData.amount,
          30
        );
        setIsPremium(true);
        setPremiumInfo(sub);
        setPayosData(null);
        setShowCelebration(true);
        setNotification({ type: 'success', message: 'Xác thực thanh toán PayOS thành công! Toàn bộ khóa học nâng cao đã được mở khóa.' });
      } else {
        setVerifyError('Chưa ghi nhận chuyển khoản: Giao dịch đang chờ xác nhận từ ngân hàng. Nếu bạn đã quét VietQR chuyển tiền, vui lòng đợi từ 30 giây đến 1 phút rồi bấm lại.');
      }
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'Chưa thể xác nhận giao dịch lúc này. Vui lòng thử lại.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResetDemoState = () => {
    premiumStorage.clear();
    setIsPremium(false);
    setPremiumInfo(null);
    setShowCelebration(false);
    setNotification({ type: 'info', message: 'Đã đặt lại trạng thái gói học về mặc định (chưa kích hoạt).' });
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

      {/* Celebration Card for Active Premium */}
      {(showCelebration || isPremium) && (
        <section className="premium-active-card" aria-label="Trạng thái Premium">
          <div className="premium-card-header">
            <div className="crown-badge"><Crown size={28} /></div>
            <div>
              <h2>Bạn đang sở hữu Tài khoản VRhythm Premium</h2>
              <p>Toàn bộ các khóa học nâng cao cho tất cả bộ môn nhạc cụ truyền thống và tính năng AI Scoring đã được mở khóa.</p>
              {premiumInfo?.expiresAt && (
                <small className="expires-tag">Hạn dùng đến: {new Date(premiumInfo.expiresAt).toLocaleDateString('vi-VN')}</small>
              )}
            </div>
          </div>
          <div className="unlocked-features-grid">
            <div className="unlocked-feature-item">
              <CheckCircle2 size={18} className="feature-icon" />
              <span><strong>🎋 Sáo trúc:</strong> Luyện cơ hoành, cột hơi vững, kỹ thuật rung hơi & luyến láy</span>
            </div>
            <div className="unlocked-feature-item">
              <CheckCircle2 size={18} className="feature-icon" />
              <span><strong>🪕 Đàn tranh & Đàn nguyệt:</strong> Kỹ thuật gảy móng, phím cao, rung nhấn mềm mại</span>
            </div>
            <div className="unlocked-feature-item">
              <CheckCircle2 size={18} className="feature-icon" />
              <span><strong>🎸 Đàn bầu:</strong> Làm chủ điểm bồi âm, uốn cần đàn và luyến nốt truyền thống</span>
            </div>
            <div className="unlocked-feature-item">
              <CheckCircle2 size={18} className="feature-icon" />
              <span><strong>🤖 AI Scoring & Sheet Music:</strong> Chấm điểm thời gian thực & tải toàn bộ ký âm Bravura</span>
            </div>
          </div>
          <div className="premium-actions">
            <a className="primary" href="/learn">Khám phá các khóa học ngay <ArrowRight size={18} /></a>
            <button className="text-button reset-demo-btn" onClick={handleResetDemoState}>
              <RefreshCw size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              Đặt lại trạng thái gói (Dành cho kiểm thử)
            </button>
          </div>
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
              <Sparkles size={13} /> GÓI TOÀN DIỆN TẤT CẢ NHẠC CỤ
            </div>
            <div className="card-top">
              <span className="package-tier-badge gold">Tài khoản Premium All-Access</span>
              <h2 id="package-premium">Gói Chuyên Sâu (Plus)</h2>
              <p className="package-price gold-price">59.000đ<span>/tháng (30 ngày)</span></p>
              <p className="card-desc">Mở khóa trọn vẹn toàn bộ hệ thống nhạc cụ dân tộc, làm chủ kỹ thuật diễn tấu tinh tế và các tác phẩm biểu diễn kinh điển.</p>
            </div>
            <ul className="package-features highlight">
              <li><Check size={16} className="gold-check" /> <strong>Mở khóa toàn bộ khóa nâng cao:</strong> Sáo trúc, Đàn tranh, Đàn bầu, Đàn nguyệt...</li>
              <li><Check size={16} className="gold-check" /> <strong>Kỹ thuật tinh hoa:</strong> Cột hơi cơ hoành, vuốt ngón, luyến láy, uốn cần, nhấn rung</li>
              <li><Check size={16} className="gold-check" /> Chấm điểm & phân tích cao độ chuẩn xác thời gian thực với AI Pitch Detector</li>
              <li><Check size={16} className="gold-check" /> Trợ lý gia sư AI VRhythm hướng dẫn kỹ thuật cá nhân hóa 24/7</li>
              <li><Check size={16} className="gold-check" /> Tải toàn bộ kho sheet nhạc ký âm chuẩn Bravura độc quyền</li>
              <li><Check size={16} className="gold-check" /> Thanh toán tự động, đối soát minh bạch qua Cổng PayOS (VietQR)</li>
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
        <div
          className="payos-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payos-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setPayosData(null); }}
        >
          <div className="payos-modal-card">
            <button
              className="payos-modal-close"
              onClick={() => setPayosData(null)}
              aria-label="Đóng cửa sổ"
              title="Đóng (Esc)"
            >
              <X size={20} />
            </button>

            <div className="payos-modal-header">
              <span className="payos-badge">Cổng thanh toán PayOS</span>
              <h2 id="payos-modal-title">Quét mã VietQR để nâng cấp Premium</h2>
              <p className="payos-timer">Mã giao dịch có hiệu lực trong: <strong>{formatCountdown(countdown)}</strong></p>
            </div>

            <div className="payos-modal-body">
              {/* Left Column: QR Code Box */}
              <div className="payos-qr-box">
                <img
                  src={payosData.qrCode}
                  alt={`Mã VietQR thanh toán PayOS ${money(payosData.amount)}`}
                  className="payos-qr-img"
                  width={210}
                  height={210}
                />
                <p className="payos-qr-hint">Mở ứng dụng ngân hàng hoặc MoMo quét mã QR trên</p>
              </div>

              {/* Right Column: Bank Transfer Details & Action Buttons */}
              <div className="payos-info-column">
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
                    <span className="label">Nội dung CK</span>
                    <span className="value-with-copy">
                      <strong className="code-highlight">{payosData.description}</strong>
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(payosData.description, 'desc')}
                        title="Sao chép nội dung chuyển khoản"
                      >
                        {copiedField === 'desc' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        {copiedField === 'desc' ? 'Đã chép' : 'Chép'}
                      </button>
                    </span>
                  </div>
                </div>

                <div className="payos-modal-footer">
                  {verifyError && (
                    <div className="payos-status-warning" role="alert">
                      <AlertCircle size={16} className="warning-icon" />
                      <span>{verifyError}</span>
                    </div>
                  )}
                  <button
                    className="primary confirm-btn"
                    disabled={verifying}
                    onClick={handleVerifyPayment}
                  >
                    {verifying ? (
                      <><RefreshCw size={16} className="spin-icon" /> Đang kiểm tra giao dịch…</>
                    ) : (
                      <><CheckCircle2 size={18} /> Kiểm tra trạng thái thanh toán</>
                    )}
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
          </div>
        </div>
      )}
    </main>
  );
}
