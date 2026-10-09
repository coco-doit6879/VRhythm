import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { api, type AuthResponse, type CheckoutOrder, type LearningPackage } from '../services/api';
import './packages-page.css';

const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`;
const statuses = { Pending: 'Chờ thử thanh toán', DemoSucceeded: 'Đã hoàn tất lượt thử', Failed: 'Lượt thử chưa thành công', Cancelled: 'Đã hủy lượt thử', Expired: 'Lượt thử đã hết hạn' };

export function PackagesPage({ user, onAuth }: { user: AuthResponse | null; onAuth: () => void }) {
  const [packages, setPackages] = useState<LearningPackage[]>([]);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const requestId = useRef(crypto.randomUUID());
  const working = useRef(false);
  const mounted = useRef(true);
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
        const id = new URLSearchParams(location.search).get('order');
        if (id && user) {
          const existing = await api.getCheckout(id);
          if (active) setOrder(existing);
        }
      } catch (err) { if (active) setError(err instanceof Error ? err.message : 'Không tải được các gói học. Vui lòng thử lại.'); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; controller.abort(); };
  }, [retry, user?.userId]);
  const act = async (action: () => Promise<CheckoutOrder>) => {
    if (working.current) return;
    working.current = true; setBusy(true); setError('');
    try {
      const result = await action();
      if (!mounted.current) return;
      setOrder(result);
      history.replaceState({}, '', `/packages?order=${encodeURIComponent(result.id)}`);
    } catch (err) { if (mounted.current) setError(err instanceof Error ? err.message : 'Không thực hiện được lượt thử. Vui lòng thử lại.'); }
    finally { working.current = false; if (mounted.current) setBusy(false); }
  };
  const reset = () => { requestId.current = crypto.randomUUID(); setOrder(null); setError(''); history.replaceState({}, '', '/packages'); };
  return <main className="page packages-page">
    <a className="text-button" href="/learn/sao">Quay lại học sáo trúc</a>
    <header className="packages-intro"><h1>Học sáo trúc.<br /><em>Theo nhịp của bạn.</em></h1><p>Bắt đầu miễn phí hoặc chọn lộ trình luyện tập nâng cao.</p></header>
    {loading && <p role="status">Đang tải các gói học…</p>}
    {error && <div className="packages-error" role="alert"><p>{error}</p><button className="text-button" disabled={busy} onClick={() => setRetry(value => value + 1)}>Tải lại</button></div>}
    {!loading && !packages.length && !error && <p>Các gói học đang được cập nhật. <a href="/learn/sao">Tiếp tục học miễn phí</a></p>}
    {!loading && !order && <div className="packages-list">{packages.map(item => <section className="package-option" key={item.code} aria-labelledby={`package-${item.code}`}>
      <h2 id={`package-${item.code}`}>{item.name}</h2>
      <p className="package-price">{money(item.amountVnd)}{item.amountVnd > 0 && <span>/tháng</span>}</p>
      <p>{item.amountVnd === 0 ? 'Làm quen với sáo trúc và những nốt đầu tiên.' : `Gói truy cập ${item.accessDays} ngày, không tự gia hạn.`}</p>
      <ul>{item.courses.map(course => <li key={course.id}>{course.title}</li>)}</ul>
      {!item.courses.length && <p>Nội dung đang được bổ sung.</p>}
      {item.checkoutMode === 'Free' ? <a className="primary" href="/learn/sao">Học miễn phí <ArrowRight size={18} /></a>
        : <><button className="primary" disabled={busy || item.checkoutMode !== 'Demo'} onClick={() => user ? void act(() => api.createCheckout(item.code, requestId.current)) : onAuth()}>{busy ? 'Đang tạo lượt thử…' : item.checkoutMode === 'Demo' ? user ? 'Thử thanh toán' : 'Đăng nhập để thử' : 'Thanh toán chưa mở'}</button><p className="package-note">Thanh toán mẫu · Không thu tiền và chưa mở khóa bài.</p></>}
    </section>)}</div>}
    {order && <section className="checkout-summary" aria-labelledby="checkout-title">
      <h2 id="checkout-title">{statuses[order.status]}</h2>
      <p className="package-price">Plus · {money(order.amountVnd)}<span>/{order.accessDays} ngày</span></p>
      <p>Đây là lượt thử thanh toán. Không thu tiền và không cấp quyền truy cập Plus.</p>
      <div className="checkout-actions">{order.status === 'Pending' ? <><button className="primary" disabled={busy} onClick={() => void act(() => api.completeDemoCheckout(order.id, 'success'))}>Thử thành công</button><button className="text-button" disabled={busy} onClick={() => void act(() => api.completeDemoCheckout(order.id, 'failed'))}>Thử thất bại</button><button className="text-button" disabled={busy} onClick={() => void act(() => api.completeDemoCheckout(order.id, 'cancelled'))}>Hủy lượt thử</button></> : <><a className="primary" href="/learn/sao">Tiếp tục học sáo trúc</a><button className="text-button" onClick={reset}>Chọn lại gói</button></>}</div>
      {busy && <p role="status">Đang cập nhật lượt thử…</p>}
    </section>}
  </main>;
}
