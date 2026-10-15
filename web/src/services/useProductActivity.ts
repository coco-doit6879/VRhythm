import { useEffect, useRef } from 'react';
import { authStorage, BASE_URL } from './api';
import { activityPath, activitySession } from './activitySession';

type ProductEvent = { eventId: string; sessionId: string; kind: 'page_view' | 'interaction'; path: string; previousPath?: string; action?: string };

async function record(event: ProductEvent) {
  try {
    const auth = authStorage.read();
    await fetch(`${BASE_URL}/api/activity/events`, {
      method: 'POST', body: JSON.stringify(event), keepalive: true,
      headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth.token}` } : {}) },
      signal: AbortSignal.timeout(5000),
    });
  } catch { /* Product tracking must not interrupt navigation or learning. */ }
}

export function useProductActivity(pathname: string) {
  const previous = useRef('');
  useEffect(() => {
    if (!import.meta.env.PROD && import.meta.env.VITE_ENABLE_ACTIVITY !== 'true') return;
    const path = activityPath(pathname); const sessionId = activitySession();
    if (!path || !sessionId || previous.current === `${sessionId}:${path}`) return;
    previous.current = `${sessionId}:${path}`;
    let previousPath: string | undefined;
    try {
      const raw = sessionStorage.getItem('vrhythm_activity_previous');
      const saved = raw ? JSON.parse(raw) : null;
      if (saved?.sessionId === sessionId) previousPath = activityPath(saved.path) ?? undefined;
      sessionStorage.setItem('vrhythm_activity_previous', JSON.stringify({ sessionId, path }));
    } catch { /* Session storage is optional. */ }
    void record({ eventId: crypto.randomUUID(), sessionId, kind: 'page_view', path, previousPath });
  }, [pathname]);

  useEffect(() => {
    if (!import.meta.env.PROD && import.meta.env.VITE_ENABLE_ACTIVITY !== 'true') return;
    let lastClick = 0;
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || Date.now() - lastClick < 750) return;
      const marked = event.target.closest<HTMLElement>('[data-activity]');
      const action = marked?.dataset.activity ?? (event.target.closest('a[href^="/learn/"],a[href^="/lesson/"]') ? 'course_open' : undefined);
      if (!action || !['navigation', 'course_open', 'enroll', 'lesson_complete', 'practice_start', 'chat_open', 'checkout_start'].includes(action)) return;
      const path = activityPath(window.location.pathname); const sessionId = activitySession();
      if (!path || !sessionId) return;
      lastClick = Date.now();
      void record({ eventId: crypto.randomUUID(), sessionId, kind: 'interaction', path, action });
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, []);
}
