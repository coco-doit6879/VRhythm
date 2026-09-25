import { useState } from 'react';
import { Sparkles } from 'lucide-react';

type Props = { mode: 'login' | 'register'; onModeChange: (mode: 'login' | 'register') => void; onSubmit: (data: { fullName?: string; email: string; password: string }) => Promise<void> };

export function AuthPanel({ mode, onModeChange, onSubmit }: Props) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể kết nối tài khoản.');
    } finally {
      setBusy(false);
    }
  };
  return <section className="auth-layout">
    <div className="auth-story">
      <span className="eyebrow"><Sparkles size={14} /> Một hành trình · Vạn giai điệu</span>
      <h1>Học bằng tai<br /><em>Nhớ bằng tim</em></h1>
      <p>Để VRhythm đi cùng bạn từ nốt nhạc đầu tiên đến giai điệu của riêng mình.</p>
      <p className="quote">“Âm nhạc truyền thống không ở phía sau chúng ta.<br />Di sản ấy đang chờ được nghe lại.”</p>
    </div>
    <div className="auth-card">
      <div className="auth-tabs">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => onModeChange('login')}>Đăng nhập</button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => onModeChange('register')}>Tạo tài khoản</button>
      </div>
      <h2><Sparkles size={20} style={{ color: 'var(--teal)', display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />{mode === 'login' ? 'Chào mừng trở lại' : 'Bắt đầu hành trình'}</h2>
      <p className="muted">{mode === 'login' ? 'Tiếp tục nơi bạn đã dừng lại.' : 'Chọn nhạc cụ và học theo nhịp của bạn.'}</p>
      {error && <div className="auth-error" style={{ color: '#c85c48', fontSize: '12px', margin: '8px 0' }}>{error}</div>}
      <form onSubmit={submit}>
        {mode === 'register' && <label>Họ và tên<input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Nguyễn Văn An" /></label>}
        <label>Email<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ban@example.com" /></label>
        <label>Mật khẩu<input required minLength={6} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Tối thiểu 6 ký tự" /></label>
        <button className="primary full" disabled={busy}>{busy ? 'Đang kết nối...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</button>
      </form>
      <div className="divider"><span>hoặc</span></div>
      <button className="social-button" type="button" onClick={() => void onSubmit({ fullName: 'Người học VRhythm', email: form.email || 'learner@vrhythm.vn', password: 'googlepassword' })}>
        <svg width="18" height="18" viewBox="0 0 24 24" style={{ flex: '0 0 auto' }}>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>Đăng nhập bằng Google</span>
      </button>
    </div>
  </section>;
}
