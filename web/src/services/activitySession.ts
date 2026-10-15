// A random per-tab identifier, rotated after 30 minutes without product activity.
export function activitySession(): string | null {
  try {
    if (navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl || localStorage.getItem('vrhythm_analytics_disabled') === 'true') return null;
    const raw = sessionStorage.getItem('vrhythm_activity_session');
    const saved = raw ? JSON.parse(raw) : null;
    const now = Date.now();
    const id = saved && /^[0-9a-f-]{36}$/i.test(saved.id) && now - saved.lastAt < 30 * 60 * 1000 ? saved.id : crypto.randomUUID();
    sessionStorage.setItem('vrhythm_activity_session', JSON.stringify({ id, lastAt: now }));
    return id;
  } catch { return null; }
}

export function activityPath(path: string): string | null {
  return path.length <= 100 && path === path.trim() && /^(\/|\/(explore|learn)(\/[a-z-]{1,30})?|\/library(\/[a-z0-9-]{1,60})?|\/(login|register|profile|packages|admin)|\/lesson\/[1-9][0-9]{0,8}\/chapter\/[1-9][0-9]{0,8}\/lesson\/[1-9][0-9]{0,8})$/.test(path) ? path : null;
}
