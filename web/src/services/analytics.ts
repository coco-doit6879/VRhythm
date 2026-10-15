import { apiRequest } from './api';

export type SessionActivity = { sessionId: string; events: number; users: number; startedAt: string; lastAt: string };
export type ActivityRow = { id: string; userId: number | null; userName: string | null; kind: string; path: string; previousPath: string | null; action: string | null; occurredAt: string };
export type PageResult<T> = { items: T[]; hasMore: boolean };
export type AnalyticsSummary = {
  days: number; since: string; until: string; firstEventAt: string | null;
  totalUsers: number; newUsers: number; activeUsers: number; sessions: number; pageViews: number; interactions: number;
  enrollments: number; completedLessons: number; examAttempts: number; paidOrders: number; revenueVnd: number; chatRequests: number; chatTokens: number;
  daily: Array<{ day: string; pageViews: number; sessions: number }>;
  pages: Array<{ path: string; views: number }>;
  transitions: Array<{ from: string; to: string; count: number }>;
  recentSessions: PageResult<SessionActivity>;
};
export const analyticsApi = {
  summary: (days: number, signal: AbortSignal) => apiRequest<AnalyticsSummary>(`/api/admin/analytics?days=${days}`, { signal }),
  sessions: (days: number, page: number, signal: AbortSignal) => apiRequest<PageResult<SessionActivity>>(`/api/admin/analytics/sessions?days=${days}&page=${page}`, { signal }),
  journey: (sessionId: string, days: number, page: number, signal: AbortSignal) => apiRequest<{ events: ActivityRow[]; hasMore: boolean }>(`/api/admin/analytics/sessions/${encodeURIComponent(sessionId)}?days=${days}&page=${page}`, { signal }),
};
