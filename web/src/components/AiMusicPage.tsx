import { useEffect, useMemo, useRef, useState } from 'react';
import { FileMusic, LockKeyhole, Play, RefreshCw, ScanLine } from 'lucide-react';
import type { SheetScore } from '../audio/fluteScore';
import { AiMusicSheet } from './AiMusicSheet';
import type { AuthResponse } from '../services/api';
import { aiMusic, inspectMusicSheet, musicError, MusicError, type MusicJob, type MusicLibraryItem, type MusicQuota, type MusicTrackPage } from '../services/aiMusic';
import './ai-music-page.css';

const activeJob = (job: MusicJob) => ['Queued', 'Scanning', 'Rendering'].includes(job.status);
const date = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value));
const labels: Record<MusicJob['status'], string> = { Queued: 'Đang gửi ảnh', Scanning: 'Đang nhận dạng sheet', AwaitingReview: 'Chờ bạn kiểm tra sheet', Rendering: 'Đang tạo audio', Completed: 'Đã lưu vào thư viện', Failed: 'Tạo chưa thành công — không mất lượt', Cancelled: 'Đã hủy — không mất lượt' };

export function AiMusicPage({ user, onAuth }: { user: AuthResponse | null; onAuth: () => void }) {
  const [quota, setQuota] = useState<MusicQuota | null>(null);
  const [jobs, setJobs] = useState<MusicJob[]>([]);
  const [job, setJob] = useState<MusicJob | null>(null);
  const [tracks, setTracks] = useState<MusicTrackPage>({ items: [], page: 1, hasMore: false });
  const [library, setLibrary] = useState<MusicLibraryItem[]>([]);
  const [libraryError, setLibraryError] = useState('');
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [draft, setDraft] = useState<SheetScore | null>(null);
  const [savedSheet, setSavedSheet] = useState<{ id: string; score: SheetScore } | null>(null);
  const [practiceVersion, setPracticeVersion] = useState(0);
  const sheetRequest = useRef(0);
  const draftJobId = useRef<string | null>(null);
  const sheetPanel = useRef<HTMLDivElement>(null);
  const revealSheet = useRef(false);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [now, setNow] = useState(Date.now());
  const [media, setMedia] = useState<{ url: string; title: string; private: boolean } | null>(null);
  const [audioBusy, setAudioBusy] = useState('');
  const audioElement = useRef<HTMLAudioElement>(null);
  const audioRequest = useRef<AbortController | null>(null);
  const lifetime = useRef(new AbortController());
  const entitled = Boolean(user && (!user.expiresAt || Date.parse(user.expiresAt) > now) && quota?.hasPremium && quota.premiumUntil && Date.parse(quota.premiumUntil) > now);
  const canReadPrivate = useRef(entitled); canReadPrivate.current = entitled;
  const reviewOpen = job?.status === 'AwaitingReview';
  const expiredDraft = Boolean(job?.reservationExpiresAtUtc && Date.parse(job.reservationExpiresAtUtc) <= now);
  const review = useMemo(() => {
    if (!draft) return { valid: null, error: '' };
    try { return { valid: inspectMusicSheet(JSON.stringify(draft)), error: '' }; }
    catch (cause) { return { valid: null, error: cause instanceof Error ? cause.message : 'Sheet chưa hợp lệ.' }; }
  }, [draft]);

  function handleError(cause: unknown) {
    if (lifetime.current.signal.aborted || (cause instanceof DOMException && cause.name === 'AbortError')) return;
    setError(musicError(cause));
    if (cause instanceof MusicError && [401, 403].includes(cause.status)) {
      canReadPrivate.current = false;
      setQuota(q => q ? { ...q, hasPremium: false, remaining: 0 } : q);
      setDraft(null); setSavedSheet(null);
    }
  }
  async function loadAccount(selectDraft = false) {
    if (!user) return;
    const signal = lifetime.current.signal;
    const [q, t, j] = await Promise.all([aiMusic.quota(signal), aiMusic.tracks(1, signal), aiMusic.jobs(signal)]);
    if (signal.aborted) return;
    setQuota(q); setTracks(t); setJobs(j);
    if (selectDraft && q.hasPremium) setJob(j.find(x => activeJob(x) || x.status === 'AwaitingReview') ?? null);
  }
  useEffect(() => {
    const controller = new AbortController(); lifetime.current = controller;
    aiMusic.library(controller.signal).then(setLibrary).catch(() => { if (!controller.signal.aborted) setLibraryError('Không tải được thư viện có sẵn. Hãy tải lại trang.'); });
    if (user) loadAccount(true).catch(handleError).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => { controller.abort(); audioRequest.current?.abort(); clearInterval(timer); };
  }, []);
  useEffect(() => {
    if (draftJobId.current !== (job?.id ?? null)) { setDraft(null); draftJobId.current = job?.id ?? null; }
    if (job?.status === 'AwaitingReview' && job.draft && entitled) {
      try { setDraft(inspectMusicSheet(JSON.stringify(job.draft)).score); }
      catch (cause) { setDraft(null); setError(cause instanceof Error ? cause.message : 'Không đọc được bản nhạc. Hãy quét lại ảnh.'); }
    }
  }, [job?.id, job?.status, entitled]);
  useEffect(() => {
    if (!entitled) {
      setDraft(null); setSavedSheet(null);
      if (media?.private) { audioElement.current?.pause(); setMedia(null); }
    }
  }, [entitled, media?.private]);
  useEffect(() => () => { if (media) URL.revokeObjectURL(media.url); }, [media]);
  useEffect(() => {
    if (!user || !quota) return;
    const delay = Date.parse(quota.resetsAtUtc) - Date.now();
    if (!Number.isFinite(delay) || delay < 0 || delay > 86400000) return;
    const timer = setTimeout(() => { void loadAccount().catch(handleError); }, delay + 100);
    return () => clearTimeout(timer);
  }, [quota?.resetsAtUtc]);
  useEffect(() => {
    if (!job || !entitled || (!activeJob(job) && !(reviewOpen && expiredDraft))) return;
    const controller = new AbortController(); let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const next = await aiMusic.job(job.id, controller.signal);
        if (controller.signal.aborted) return;
        setJob(next);
        if (!activeJob(next)) await loadAccount();
      } catch (cause) { if (!controller.signal.aborted) handleError(cause); }
      finally { if (!controller.signal.aborted) timer = setTimeout(poll, 4000); }
    };
    timer = setTimeout(poll, 1500);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [job?.id, job?.status, entitled, expiredDraft]);

  async function scan() {
    if (!file || !title.trim() || !entitled) return;
    setBusy(true); setError('');
    try {
      const next = await aiMusic.scan(file, title, requestId, lifetime.current.signal);
      if (lifetime.current.signal.aborted || !canReadPrivate.current) return;
      setSavedSheet(null); revealSheet.current = true; setJob(next); await loadAccount();
    } catch (cause) { handleError(cause); }
    finally { if (!lifetime.current.signal.aborted) setBusy(false); }
  }
  async function render() {
    if (!job || draftJobId.current !== job.id || !review.valid || !entitled || expiredDraft) return;
    setPracticeVersion(v => v + 1);
    setBusy(true); setError('');
    try {
      const next = await aiMusic.render(job.id, review.valid.score, lifetime.current.signal);
      if (lifetime.current.signal.aborted || !canReadPrivate.current) return;
      setJob(next); await loadAccount();
    } catch (cause) { handleError(cause); }
    finally { if (!lifetime.current.signal.aborted) setBusy(false); }
  }
  function stopListening() {
    audioRequest.current?.abort(); audioElement.current?.pause(); setMedia(null);
  }
  useEffect(() => {
    if (revealSheet.current && (draft || savedSheet)) { revealSheet.current = false; sheetPanel.current?.scrollIntoView({ block: 'start' }); }
  }, [draft, savedSheet]);
  async function listen(id: string, name: string, privateTrack: boolean) {
    if (privateTrack && !entitled) return;
    setPracticeVersion(v => v + 1);
    audioRequest.current?.abort(); audioElement.current?.pause(); setMedia(null);
    const controller = new AbortController(); audioRequest.current = controller;
    setAudioBusy(id); setError('');
    try {
      const blob = privateTrack ? await aiMusic.audio(id, controller.signal) : await aiMusic.libraryAudio(id, controller.signal);
      if (controller.signal.aborted || lifetime.current.signal.aborted || (privateTrack && !canReadPrivate.current)) return;
      setMedia({ url: URL.createObjectURL(blob), title: name, private: privateTrack });
    } catch (cause) { if (!controller.signal.aborted) handleError(cause); }
    finally { if (audioRequest.current === controller) setAudioBusy(''); }
  }
  async function viewSheet(id: string) {
    const request = ++sheetRequest.current;
    setBusy(true); setError('');
    try {
      const score = await aiMusic.sheet(id, lifetime.current.signal);
      if (!lifetime.current.signal.aborted && canReadPrivate.current && request === sheetRequest.current) {
        let checked;
        try { checked = inspectMusicSheet(JSON.stringify(score)); }
        catch { throw new MusicError(502, 'INVALID_SHEET', 'Bản nhạc trả về chưa hợp lệ. Hãy tải lại sheet hoặc quét lại ảnh.'); }
        stopListening(); revealSheet.current = true; setSavedSheet({ id, score: checked.score });
      }
    } catch (cause) { handleError(cause); }
    finally { if (!lifetime.current.signal.aborted) setBusy(false); }
  }
  const canScan = entitled && quota?.generationAvailable && quota.remaining > 0 && file && title.trim() && !busy;
  return <main className="page ai-music-page">
    <header className="ai-music-intro"><h1>VRhythm AI</h1><p>Từ ảnh sheet đến tiếng sáo. Kiểm tra và sửa bản nhạc trước khi tạo audio.</p></header>
    {error && <div className="ai-music-error" role="alert"><p>{error}</p><button onClick={() => { setError(''); setLoading(true); void loadAccount(true).catch(handleError).finally(() => setLoading(false)); }}><RefreshCw size={16} aria-hidden="true" /> Tải lại trạng thái</button></div>}
    {loading && <div className="ai-music-loading" role="status">Đang tải tài khoản và thư viện…</div>}
    <div className="ai-music-sheets" ref={sheetPanel}>
        {job && entitled && !savedSheet && <section className="ai-music-job" aria-labelledby="ai-job-title"><h3 id="ai-job-title">{job.title}</h3><p role="status">{labels[job.status]}</p>
          {reviewOpen && <>
            <p>Kiểm tra bản nhạc, sửa nốt và tempo trước khi xác nhận.</p>
            {job.reservationExpiresAtUtc && <small>{expiredDraft ? 'Bản nháp đã hết thời gian giữ lượt. Hãy quét lại ảnh.' : `Xác nhận trước ${date(job.reservationExpiresAtUtc)}.`}</small>}
            {draft && draftJobId.current === job.id && <AiMusicSheet key={`${job.id}-${practiceVersion}`} score={draft} valid={Boolean(review.valid)} onChange={setDraft} disabled={busy || expiredDraft} onPractice={stopListening} />}
            <p id="ai-sheet-validation" className={review.error ? 'ai-music-invalid' : 'ai-music-help'} role={review.error ? 'alert' : undefined}>{review.error || (review.valid ? `${review.valid.count} nốt / dấu lặng · ${review.valid.tempo} BPM · ${review.valid.duration.toFixed(1)} giây` : 'Không đọc được sheet. Hãy quét lại ảnh.')}</p>
            <button className="ai-music-primary" disabled={busy || !review.valid || expiredDraft || !quota?.generationAvailable} onClick={() => void render()}><FileMusic size={18} aria-hidden="true" />{busy ? 'Đang xác nhận…' : 'Tạo audio từ sheet đã sửa'}</button>
            <small>Chỉ tính 1 lượt khi audio được tạo và lưu thành công.</small>
          </>}
          {!reviewOpen && draft && draftJobId.current === job.id && ['Rendering', 'Completed'].includes(job.status) && <AiMusicSheet key={`${job.id}-${practiceVersion}`} score={draft} valid={Boolean(review.valid)} onPractice={stopListening} />}
          {job.status === 'Completed' && <a href="#ai-personal-library">Mở thư viện cá nhân</a>}
          {job.failureCode === 'RESERVATION_EXPIRED' && <p>Bản nháp hết hạn. Quét lại để bắt đầu yêu cầu mới.</p>}
          {['Completed', 'Failed', 'Cancelled'].includes(job.status) && <button onClick={() => { setRequestId(crypto.randomUUID()); setJob(null); setDraft(null); setError(''); }}>Bắt đầu bản mới</button>}
        </section>}
      {savedSheet && entitled && <section className="ai-music-saved-sheet" aria-label="Sheet đã lưu">
        <div className="ai-music-sheet-heading"><h2>{savedSheet.score.metadata.title}</h2><button onClick={() => { sheetRequest.current++; setSavedSheet(null); }}>Đóng sheet</button></div>
        <AiMusicSheet key={`${savedSheet.id}-${practiceVersion}`} score={savedSheet.score} valid onPractice={stopListening} />
      </section>}
    </div>
    <div className="ai-music-workspace">
      <section className="ai-music-create" aria-labelledby="ai-create-title">
        <h2 id="ai-create-title">Tạo bản nhạc riêng</h2>
        {!user ? <div className="ai-music-access"><p>Premium mở tính năng tạo 3 bản nhạc mỗi ngày. Bạn vẫn có thể nghe thư viện có sẵn.</p><button className="ai-music-primary" onClick={onAuth}>Đăng nhập để tạo nhạc</button><a href="/packages">Xem gói học</a></div> : <>
          {quota && <div className="ai-music-quota"><strong>{entitled ? `${quota.remaining} / ${quota.dailyLimit} lượt khả dụng hôm nay` : 'Cần Premium còn hiệu lực'}</strong><span>{quota.completed} đã tạo · {quota.reserved} đang giữ</span><small>Làm mới lúc {date(quota.resetsAtUtc)} (giờ Việt Nam). Không cộng dồn.</small></div>}
          {!loading && !entitled && <p><a href="/packages">Mua hoặc gia hạn Premium</a> để tạo, nghe và sử dụng nhạc riêng.</p>}
          {entitled && quota && !quota.generationAvailable && <p className="ai-music-notice">Dịch vụ tạo nhạc chưa sẵn sàng. Chưa thể gửi ảnh và không mất lượt.</p>}
          {entitled && quota?.remaining === 0 && <p className="ai-music-notice">Đã dùng hoặc đang giữ đủ 3 lượt hôm nay. Bạn vẫn có thể hoàn tất bản nháp đang giữ lượt.</p>}
          <form onSubmit={event => { event.preventDefault(); void scan(); }} className="ai-music-form">
            <label htmlFor="ai-title">Tên bản nhạc</label><input id="ai-title" maxLength={200} value={title} disabled={busy} onChange={e => { setTitle(e.target.value); setRequestId(crypto.randomUUID()); }} placeholder="Ví dụ: Bèo dạt mây trôi" required />
            <label htmlFor="ai-image">Ảnh sheet</label><input id="ai-image" type="file" accept="image/png,image/jpeg" disabled={busy || !entitled} aria-describedby="ai-image-help" onChange={e => {
              const selected = e.target.files?.[0]; setFile(null); setRequestId(crypto.randomUUID()); setError('');
              if (!selected) return;
              if (!['image/png', 'image/jpeg'].includes(selected.type) || selected.size < 24 || selected.size > 5 * 1024 * 1024) { setError('Chọn ảnh PNG hoặc JPEG, tối đa 5 MB.'); e.target.value = ''; return; }
              setFile(selected);
            }} />
            <small id="ai-image-help">PNG hoặc JPEG, tối đa 5 MB. Một giai điệu đơn âm, tối đa 120 giây, C4–B6.</small>
            <button className="ai-music-primary" type="submit" disabled={!canScan}><ScanLine size={18} aria-hidden="true" />{busy && !reviewOpen ? 'Đang gửi…' : 'Quét ảnh thành sheet'}</button>
          </form>
          <p className="ai-music-help">Quét ảnh chưa tạo audio. Bản nháp giữ một lượt trong tối đa 20 phút; lỗi hoặc hết hạn sẽ trả lượt.</p>
        </>}
        {entitled && jobs.length > 0 && <details className="ai-music-recent"><summary>Yêu cầu gần đây</summary><ul>{jobs.map(j => <li key={j.id}><button disabled={busy} onClick={() => { setSavedSheet(null); setJob(j); setError(''); }}>{j.title} — {labels[j.status]}</button></li>)}</ul></details>}
      </section>
      <section className="ai-music-library" id="ai-personal-library" aria-labelledby="ai-library-title"><h2 id="ai-library-title">Thư viện của bạn</h2>
        {!user ? <p>Đăng nhập để xem những bản nhạc đã lưu trong tài khoản.</p> : <>
          {!entitled && tracks.items.length > 0 && <p>Bài vẫn được lưu. Gia hạn Premium để nghe và sử dụng.</p>}
          {!loading && tracks.items.length === 0 && <p>Chưa có bản nhạc riêng. Quét ảnh và duyệt sheet để tạo bài đầu tiên.</p>}
          <ul className="ai-music-track-list">{tracks.items.map(t => <li key={t.id}><div><strong>{t.title}</strong><small>{Math.round(t.durationSeconds)} giây{t.isLocked || !entitled ? ' · Cần Premium' : ''}</small></div><div className="ai-music-row-actions"><button aria-label={`Nghe ${t.title}`} disabled={!entitled || t.isLocked || audioBusy === t.id} onClick={() => void listen(t.id, t.title, true)}>{t.isLocked || !entitled ? <LockKeyhole size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}{audioBusy === t.id ? 'Đang tải…' : 'Nghe'}</button><button disabled={!entitled || t.isLocked || busy} onClick={() => void viewSheet(t.id)}>Xem sheet</button></div></li>)}</ul>
          {tracks.hasMore && <button disabled={busy} onClick={() => { setBusy(true); void aiMusic.tracks(tracks.page + 1, lifetime.current.signal).then(next => setTracks(current => ({ ...next, items: [...current.items, ...next.items] }))).catch(handleError).finally(() => setBusy(false)); }}>Xem thêm bản nhạc</button>}
        </>}
        <section className="ai-music-public" aria-labelledby="ai-public-title"><h2 id="ai-public-title">Thư viện có sẵn</h2><p>Nghe các bản đã được mở cho mọi người.</p>
          {libraryError && <p role="alert">{libraryError}</p>}
          {!libraryError && library.length === 0 && <p>Chưa có bản nhạc công khai được mở.</p>}
          <ul className="ai-music-track-list">{library.map(t => <li key={t.id}><div><strong>{t.title}</strong><small>{Math.round(t.durationSeconds)} giây</small></div><button aria-label={`Nghe ${t.title}`} disabled={audioBusy === t.id} onClick={() => void listen(t.id, t.title, false)}><Play size={16} aria-hidden="true" />{audioBusy === t.id ? 'Đang tải…' : 'Nghe'}</button></li>)}</ul>
        </section>
      </section>
    </div>
    {media && <aside className="ai-music-player" aria-label="Trình phát nhạc"><strong>{media.title}</strong><audio key={media.url} ref={audioElement} controls autoPlay src={media.url} onError={() => setError('Trình duyệt không phát được audio. Hãy thử tải lại bản nhạc.')} /><button onClick={() => { audioElement.current?.pause(); setMedia(null); }}>Đóng trình phát</button></aside>}
  </main>;
}
