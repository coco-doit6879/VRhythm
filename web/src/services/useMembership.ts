import { useEffect, useState } from 'react';
import { api, ApiError, type AuthResponse } from './api';

type Access = { hasPremium: boolean; premiumUntil: string | null };
export type Membership = Access & { loading: boolean; error: string; refresh: () => void };
export const refreshMembership = () => window.dispatchEvent(new Event('vrhythm-membership-refresh'));

export function useMembership(user: AuthResponse | null, route: string): Membership {
  const [revision, setRevision] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [state, setState] = useState<{ token: string; access?: Access; error?: string }>({ token: '' });
  const refresh = () => setRevision(n => n + 1);
  useEffect(() => {
    const focus = () => { if (!document.hidden) refresh(); };
    window.addEventListener('focus', focus);
    document.addEventListener('visibilitychange', focus);
    window.addEventListener('vrhythm-membership-refresh', refresh);
    return () => {
      window.removeEventListener('focus', focus);
      document.removeEventListener('visibilitychange', focus);
      window.removeEventListener('vrhythm-membership-refresh', refresh);
    };
  }, []);
  useEffect(() => {
    if (!user) { setState({ token: '' }); return; }
    const controller = new AbortController();
    setState(previous => previous.token === user.token ? { ...previous, error: undefined } : { token: user.token });
    void (async () => {
      let access: Access | undefined;
      try {
        const profile = await api.getProfile(controller.signal);
        if (profile.premiumUntil === null || typeof profile.premiumUntil === 'string') {
          access = { premiumUntil: profile.premiumUntil, hasPremium: profile.hasPremium ?? Boolean(profile.premiumUntil && Date.parse(profile.premiumUntil) > Date.now()) };
        }
      } catch (cause) {
        if (controller.signal.aborted || (cause instanceof ApiError && [401, 403].includes(cause.status))) throw cause;
      }
      // Supports deployed APIs that predate membership fields in the profile DTO.
      access ??= await api.getAiMusicMembership(controller.signal);
      if (!controller.signal.aborted) { setState({ token: user.token, access }); setNow(Date.now()); }
    })().catch(() => {
      if (!controller.signal.aborted) setState({ token: user.token, error: 'Chưa xác nhận được gói tài khoản. Vui lòng thử lại.' });
    });
    return () => controller.abort();
  }, [user?.token, route, revision]);
  const access = user && state.token === user.token ? state.access : undefined;
  useEffect(() => {
    const deadlines = [access?.premiumUntil, user?.expiresAt].flatMap(value => value && Date.parse(value) > Date.now() ? [Date.parse(value)] : []);
    if (!deadlines.length) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.min(86400000, Math.min(...deadlines) - Date.now() + 1));
    return () => clearTimeout(timer);
  }, [access?.premiumUntil, user?.expiresAt, now]);
  const sessionExpired = Boolean(user?.expiresAt && Date.parse(user.expiresAt) <= now);
  const error = sessionExpired ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để kiểm tra gói.' : user && state.token === user.token ? state.error ?? '' : '';
  return {
    hasPremium: Boolean(user && access?.hasPremium && access.premiumUntil && Date.parse(access.premiumUntil) > now && (!user.expiresAt || Date.parse(user.expiresAt) > now)),
    premiumUntil: access?.premiumUntil ?? null,
    loading: Boolean(user && !access && !error), error, refresh,
  };
}
