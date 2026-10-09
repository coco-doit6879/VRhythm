import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';

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
      <h1 className="auth-editorial-title">
        <span>Học bằng tai.</span>
        <em>Nhớ bằng tim.</em>
      </h1>
      <p className="quote">“Âm nhạc truyền thống không ở phía sau chúng ta.<br />Di sản ấy đang chờ được nghe lại.”</p>
    </div>
    <div className="auth-card">
      <div className="auth-tabs">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => onModeChange('login')}>Đăng nhập</button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => onModeChange('register')}>Tạo tài khoản</button>
      </div>
      <h2><Sparkles size={20} style={{ color: 'var(--teal)', display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />{mode === 'login' ? 'Chào mừng trở lại' : 'Bắt đầu hành trình'}</h2>
      <p className="muted">{mode === 'login' ? 'Tiếp tục nơi bạn đã dừng lại.' : 'Chọn nhạc cụ và học theo nhịp của bạn.'}</p>
      {error && <div className="auth-error" role="alert">{error}</div>}
      <form onSubmit={submit}>
        {mode === 'register' && <label>Họ và tên<input required maxLength={200} autoComplete="name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Nguyễn Văn An" /></label>}
        <label>Email<input required type="email" maxLength={320} autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ban@example.com" /></label>
        <label>Mật khẩu<input required minLength={mode === 'register' ? 8 : 1} maxLength={200} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={mode === 'register' ? 'Tối thiểu 8 ký tự' : 'Mật khẩu của bạn'} /></label>
        <button className="primary full" disabled={busy}>{busy ? 'Đang kết nối...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</button>
      </form>
      <div className="divider"><span>hoặc</span></div>
      <GoogleSignInButton />
    </div>
  </section>;
}
