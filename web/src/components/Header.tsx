import { CircleUserRound, LogIn, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

type Props = { active: string; loggedIn: boolean; onNavigate: (view: string) => void; onSignOut: () => void };

export function Header({ active, loggedIn, onNavigate, onSignOut }: Props) {
  const [open, setOpen] = useState(false);
  const go = (view: string) => { onNavigate(view); setOpen(false); };
  return <header className="topbar">
    <button className="brand" onClick={() => go('home')} aria-label="VRhythm trang chủ">
      <span className="brand-mark"><img src="/images/generated/vrhythm-logo-mark.webp" alt="" width="44" height="44" /></span><span><strong>VRhythm</strong><small>Di sản · Nhịp điệu · Công nghệ</small></span>
    </button>
    <div className="header-tools"><button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-expanded={open} aria-controls="main-navigation">{open ? <X /> : <Menu />}</button></div>
    <nav id="main-navigation" className={open ? 'nav open' : 'nav'}>
      <button className={active === 'home' ? 'active' : ''} onClick={() => go('home')}>Trang chủ</button>
      <button className={active === 'explore' ? 'active' : ''} onClick={() => go('explore')}>Khám phá</button>
      <button className={active === 'learn' ? 'active' : ''} onClick={() => go('learn')}>Học tập</button>
      {loggedIn ? <><button className={active === 'profile' ? 'active' : ''} onClick={() => go('profile')}><CircleUserRound size={15} /> Hồ sơ</button><button className="nav-account" onClick={() => { setOpen(false); onSignOut(); }}><LogOut size={15} /> Thoát</button></> : <button className={active === 'auth' ? 'active' : ''} onClick={() => go('auth')}><LogIn size={15} /> Đăng nhập</button>}
    </nav>
  </header>;
}
