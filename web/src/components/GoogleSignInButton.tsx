import { useEffect, useRef, useState } from 'react';
import { api, authStorage } from '../services/api';
import './google-sign-in.css';

type IdentityApi = {
  initialize(options: { client_id: string; callback: (response: { credential: string }) => void }): void;
  renderButton(element: HTMLElement, options: { theme: string; size: string; text: string; width: number; locale: string }): void;
};
declare global { interface Window { google?: { accounts: { id: IdentityApi } } } }

let scriptPromise: Promise<IdentityApi> | undefined;
let initialized = false;
let receiveCredential: ((credential: string) => void) | undefined;

function loadIdentity(): Promise<IdentityApi> {
  if (window.google?.accounts.id) return Promise.resolve(window.google.accounts.id);
  if (!scriptPromise) scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    const timer = window.setTimeout(() => fail(), 15000);
    const fail = () => { clearTimeout(timer); script.remove(); scriptPromise = undefined; reject(new Error('Không thể tải Google. Vui lòng thử lại sau.')); };
    script.onerror = fail;
    script.onload = () => {
      clearTimeout(timer);
      if (window.google?.accounts.id) resolve(window.google.accounts.id);
      else fail();
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function GoogleSignInButton() {
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Đang tải Google…');
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let submitting = false;
    const login = async (credential: string) => {
      if (!active || submitting) return;
      submitting = true;
      setError(''); setStatus('Đang đăng nhập…');
      try {
        const auth = await api.googleLogin(credential);
        if (!active) return;
        authStorage.write(auth);
        const returnTo = sessionStorage.getItem('vrhythm_return_to');
        sessionStorage.removeItem('vrhythm_return_to');
        window.location.assign(returnTo && (returnTo === '/packages' || returnTo === '/learn/sao') ? returnTo : '/learn');
      } catch (err) {
        if (active) { setError(err instanceof Error ? err.message : 'Không thể đăng nhập Google.'); setStatus(''); }
      } finally { submitting = false; }
    };
    void (async () => {
      try {
        const providers = await api.getAuthProviders();
        if (!active) return;
        if (!providers.googleClientId) { setStatus('Google chưa khả dụng'); return; }
        const identity = await loadIdentity();
        if (!active || !container.current) return;
        receiveCredential = login;
        if (!initialized) {
          identity.initialize({ client_id: providers.googleClientId, callback: response => receiveCredential?.(response.credential) });
          initialized = true;
        }
        identity.renderButton(container.current, { theme: 'outline', size: 'large', text: 'continue_with', width: Math.min(320, container.current.clientWidth), locale: 'vi' });
        setStatus('');
      } catch {
        if (active) setStatus('Google chưa khả dụng');
      }
    })();
    return () => { active = false; if (receiveCredential === login) receiveCredential = undefined; };
  }, []);
  return <>
    <div className="social-button google-sign-in" aria-label="Đăng nhập bằng Google">
      <div ref={container} className="google-sign-in-target" />
      {status && <span role="status">{status}</span>}
    </div>
    {error && <p className="auth-error" role="alert">{error}</p>}
  </>;
}
