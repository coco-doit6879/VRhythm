import { prepareAiMusicImage } from './aiMusicImage';
import { authStorage } from './api';
import { buildScoreTimeline, type SheetScore } from '../audio/fluteScore';

const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5205';
const privatePath = '/api/me/ai-music';
export type MusicQuota = { hasPremium: boolean; premiumUntil: string | null; dailyLimit: number; completed: number; reserved: number; remaining: number; resetsAtUtc: string; generationAvailable: boolean };
export type MusicJob = { id: string; title: string; status: 'Queued' | 'Scanning' | 'AwaitingReview' | 'Rendering' | 'Completed' | 'Failed' | 'Cancelled'; createdAtUtc: string; reservationExpiresAtUtc: string | null; failureCode: string | null; draft: unknown; trackId: string | null };
export type MusicTrack = { id: string; title: string; durationSeconds: number; createdAtUtc: string; isLocked: boolean };
export type MusicLibraryItem = Pick<MusicTrack, 'id' | 'title' | 'durationSeconds'>;
export type MusicTrackPage = { items: MusicTrack[]; page: number; hasMore: boolean };
export class MusicError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) { super(message); }
}
export function musicError(error: unknown): string {
  return error instanceof MusicError ? error.message : 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại cùng yêu cầu; không cần gửi một bản mới.';
}
async function call<T>(path: string, init: RequestInit = {}, audio = false, publicRead = false): Promise<T> {
  const auth = publicRead ? null : authStorage.read();
  if (!publicRead && !auth) throw new MusicError(401, 'AUTH_REQUIRED', 'Vui lòng đăng nhập lại.');
  const headers = new Headers(init.headers);
  if (auth) headers.set('Authorization', `Bearer ${auth.token}`);
  const controller = new AbortController();
  const cancel = () => controller.abort();
  init.signal?.addEventListener('abort', cancel, { once: true });
  if (init.signal?.aborted) cancel();
  const timer = window.setTimeout(cancel, 30000);
  try {
    const response = await fetch(`${base}${path}`, { ...init, headers, cache: 'no-store', signal: controller.signal });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const validation = response.status === 422 && data?.error?.code === 'INVALID_INPUT' && typeof data.error.message === 'string' && data.error.message.length <= 400 ? data.error.message : null;
      const message = validation ?? (response.status === 401 ? 'Vui lòng đăng nhập lại.' : response.status === 403 ? 'Cần Premium còn hiệu lực để tạo, nghe hoặc dùng nhạc riêng.' : response.status === 429 ? 'Đã hết lượt hoặc gửi quá nhiều yêu cầu. Vui lòng đợi rồi thử lại.' : response.status >= 500 ? 'Dịch vụ tạo nhạc chưa sẵn sàng. Vui lòng thử lại sau.' : 'Yêu cầu chưa thực hiện được. Hãy tải lại trạng thái và thử lại.');
      throw new MusicError(response.status, typeof data?.error?.code === 'string' ? data.error.code : 'REQUEST_FAILED', message);
    }
    if (audio) {
      const blob = await response.blob();
      if (!blob.size || blob.size > 12 * 1024 * 1024 || !response.headers.get('Content-Type')?.startsWith('audio/wav')) throw new MusicError(502, 'INVALID_AUDIO', 'Máy chủ trả về audio không hợp lệ.');
      return blob as T;
    }
    return await response.json() as T;
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener('abort', cancel);
  }
}
export const aiMusic = {
  quota: (signal: AbortSignal) => call<MusicQuota>(`${privatePath}/quota`, { signal }),
  jobs: (signal: AbortSignal) => call<MusicJob[]>(`${privatePath}/jobs`, { signal }),
  job: (id: string, signal: AbortSignal) => call<MusicJob>(`${privatePath}/jobs/${encodeURIComponent(id)}`, { signal }),
  tracks: (page: number, signal: AbortSignal) => call<MusicTrackPage>(`${privatePath}/tracks?page=${page}`, { signal }),
  scan: async (file: File, title: string, requestId: string, signal: AbortSignal) => {
    signal.throwIfAborted();
    let image: File;
    try { image = await prepareAiMusicImage(file); }
    catch (cause) { throw new MusicError(422, 'INVALID_IMAGE', cause instanceof Error ? cause.message : 'Không đọc được ảnh. Hãy chọn lại ảnh.'); }
    signal.throwIfAborted();
    const body = new FormData(); body.append('Image', image); body.append('Title', title.trim()); body.append('RequestId', requestId);
    return call<MusicJob>(`${privatePath}/jobs`, { method: 'POST', body, signal });
  },
  render: (id: string, sheet: unknown, signal: AbortSignal) => call<MusicJob>(`${privatePath}/jobs/${encodeURIComponent(id)}/render`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sheet }), signal }),
  sheet: (id: string, signal: AbortSignal) => call<unknown>(`${privatePath}/tracks/${encodeURIComponent(id)}/sheet`, { signal }),
  audio: (id: string, signal: AbortSignal) => call<Blob>(`${privatePath}/tracks/${encodeURIComponent(id)}/audio`, { signal }, true),
  library: (signal: AbortSignal) => call<MusicLibraryItem[]>('/api/ai-music/library', { signal }, false, true),
  libraryAudio: (id: string, signal: AbortSignal) => call<Blob>(`/api/ai-music/library/${encodeURIComponent(id)}/audio`, { signal }, true, true),
};

/** Review is a data editor, never executable AI-generated content. Server/worker validate again. */
export function inspectMusicSheet(text: string) {
  if (new TextEncoder().encode(text).length > 256 * 1024) throw new Error('Sheet tối đa 256 KB.');
  let score: SheetScore;
  try { score = JSON.parse(text); } catch { throw new Error('JSON chưa hợp lệ. Kiểm tra dấu phẩy và dấu ngoặc.'); }
  if (!score?.metadata || typeof score.metadata.title !== 'string' || !score.metadata.title.trim() || score.metadata.title.length > 200 || !Array.isArray(score.notes) || !score.notes.length || score.notes.length > 2048) throw new Error('Cần tên bài và từ 1 đến 2048 nốt / dấu lặng.');
  const ids = new Set<string>();
  for (const note of score.notes) {
    if (!note || typeof note.id !== 'string' || !note.id.trim() || note.id.length > 100 || ids.has(note.id)) throw new Error('Mỗi nốt cần ID duy nhất, tối đa 100 ký tự.');
    ids.add(note.id);
    if (typeof note.duration !== 'string' || !/^(w|h|q|8|e|16|s)\.{0,2}$/i.test(note.duration)) throw new Error('Trường độ hợp lệ: w, h, q, 8, 16; có thể thêm dấu chấm.');
    if (note.rest !== undefined && typeof note.rest !== 'boolean') throw new Error('rest phải là true hoặc false.');
  }
  const timeline = buildScoreTimeline(score);
  if (!timeline.events.some(n => n.frequency !== null) || timeline.totalDuration > 120) throw new Error('Bài phải có nốt phát âm và dài tối đa 120 giây.');
  if (timeline.events.some(n => n.frequency !== null && (n.frequency < 261.6255 || n.frequency > 1975.534))) throw new Error('Dịch vụ hiện nhận cao độ C4–B6. Không tự hạ tông.');
  return { score, count: score.notes.length, duration: timeline.totalDuration, tempo: score.metadata.tempo };
}
