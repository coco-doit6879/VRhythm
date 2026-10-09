import { CircleUserRound, LogIn, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import './header-navigation.css';

type Props = { active: string; loggedIn: boolean; onNavigate: (view: string) => void; onSignOut: () => void };

export function Header({ active, loggedIn, onNavigate, onSignOut }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [active]);
  const go = (view: string) => { onNavigate(view); setOpen(false); };
  return <header className={`topbar${scrolled ? ' is-scrolled' : ''}`}>
    <button className="brand" onClick={() => go('home')} aria-label="VRhythm trang chủ">
      <span className="brand-mark"><img src="/images/generated/vrhythm-logo-mark.webp" alt="" width="44" height="44" /></span><span><strong>VRhythm</strong><small>Di sản · Nhịp điệu · Công nghệ</small></span>
    </button>
    <div className="header-tools"><button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-expanded={open} aria-controls="main-navigation">{open ? <X /> : <Menu />}</button></div>
    <nav id="main-navigation" className={open ? 'nav open' : 'nav'}>
      <button aria-current={active === 'home' ? 'page' : undefined} className={active === 'home' ? 'active' : ''} onClick={() => go('home')}>Trang chủ</button>
      <button aria-current={active === 'explore' ? 'page' : undefined} className={active === 'explore' ? 'active' : ''} onClick={() => go('explore')}>Khám phá</button>
      <button aria-current={active === 'learn' ? 'page' : undefined} className={active === 'learn' ? 'active' : ''} onClick={() => go('learn')}>Học tập</button>
      <button aria-current={active === 'library' ? 'page' : undefined} className={active === 'library' ? 'active' : ''} onClick={() => go('library')}>Thư viện</button>
      <button aria-current={active === 'packages' ? 'page' : undefined} className={active === 'packages' ? 'active' : ''} onClick={() => go('packages')}>Gói học</button>
      {loggedIn ? <><button className={active === 'profile' ? 'active' : ''} onClick={() => go('profile')}><CircleUserRound size={15} /> Hồ sơ</button><button className="nav-account" onClick={() => { setOpen(false); onSignOut(); }}><LogOut size={15} /> Thoát</button></> : <button className={active === 'auth' ? 'active' : ''} onClick={() => go('auth')}><LogIn size={15} /> Đăng nhập</button>}
    </nav>
  </header>;
}
