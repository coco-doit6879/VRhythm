import { CircleUserRound, LogIn, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';

type Props = { active: string; loggedIn: boolean; theme: 'light' | 'dark'; onToggleTheme: () => void; onNavigate: (view: string) => void; onSignOut: () => void };

export function Header({ active, loggedIn, theme, onToggleTheme, onNavigate, onSignOut }: Props) {
  const [open, setOpen] = useState(false);
  const go = (view: string) => { onNavigate(view); setOpen(false); };
  return <header className="topbar">
    <button className="brand" onClick={() => go('home')} aria-label="VRhythm trang chủ">
      <span className="brand-mark">VR</span><span><strong>VRhythm</strong><small>Di sản · Nhịp điệu · Công nghệ</small></span>
    </button>
    <div className="header-tools"><button className="theme-toggle" onClick={onToggleTheme} aria-label={theme === 'dark' ? 'Chuyển sang light mode' : 'Chuyển sang dark mode'}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button><button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Mở menu">{open ? <X /> : <Menu />}</button></div>
    <nav className={open ? 'nav open' : 'nav'}>
      <button className={active === 'home' ? 'active' : ''} onClick={() => go('home')}>Trang chủ</button>
      <button className={active === 'explore' ? 'active' : ''} onClick={() => go('explore')}>Khám phá</button>
      <button className={active === 'learn' ? 'active' : ''} onClick={() => go('learn')}>Học tập</button>
      {loggedIn ? <><button className={active === 'profile' ? 'active' : ''} onClick={() => go('profile')}><CircleUserRound size={15} /> Hồ sơ</button><button className="nav-account" onClick={onSignOut}><LogOut size={15} /> Thoát</button></> : <button className={active === 'auth' ? 'active' : ''} onClick={() => go('auth')}><LogIn size={15} /> Đăng nhập</button>}
    </nav>
  </header>;
}
