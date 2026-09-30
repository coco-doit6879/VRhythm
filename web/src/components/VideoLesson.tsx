import { useRef, useState } from 'react';

function youtubeId(raw?: string): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) :
      ['youtube.com', 'www.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname) ?
        url.pathname.startsWith('/embed/') ? url.pathname.split('/')[2] : url.searchParams.get('v') : null;
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}

export function VideoLesson({ url, content, completed, busy, onComplete, onConfirmExternal }: { url?: string; content?: string; completed: boolean; busy: boolean; onComplete: (watched: number, total: number) => Promise<void>; onConfirmExternal: () => Promise<void> }) {
  const video = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState({ watched: 0, total: 0 });
  const [error, setError] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const externalId = youtubeId(url);
  const update = () => {
    const element = video.current;
    if (!element || !Number.isFinite(element.duration)) return;
    let watched = 0;
    for (let i = 0; i < element.played.length; i++) watched += element.played.end(i) - element.played.start(i);
    setProgress({ watched: Math.floor(watched), total: Math.ceil(element.duration) });
  };
  const ready = progress.total > 0 && progress.watched / progress.total >= .9;
  return <article className="lesson-content"><h2>Video hướng dẫn</h2>{externalId ? <iframe className="lesson-external-video" title="Video hướng dẫn" src={`https://www.youtube-nocookie.com/embed/${externalId}?rel=0`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : url ? <video ref={video} src={url} controls playsInline preload="metadata" onTimeUpdate={update} onEnded={update} onError={() => setError(true)} /> : <p role="status">Video của bài học chưa sẵn sàng. Bạn có thể xem các bài khác trong lộ trình.</p>}{error && <p role="alert">Không tải được video. Hãy tải lại bài học để lấy đường dẫn mới.</p>}{content && <div className="lesson-prose">{content}</div>}{externalId && <><a className="lesson-video-link" href={`https://www.youtube.com/watch?v=${externalId}`} target="_blank" rel="noopener noreferrer">Mở video trên YouTube ↗</a><p>Sau khi xem video trên YouTube, xác nhận để ghi nhận bài học. Ứng dụng không đo thời lượng xem của video bên ngoài.</p><label className="lesson-video-confirm"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} disabled={busy || completed} /> Tôi đã xem xong video</label>{!completed && <button className="primary" disabled={!confirmed || busy} onClick={() => void onConfirmExternal()}>{busy ? 'Đang lưu…' : 'Xác nhận hoàn thành video'}</button>}</>}{url && !externalId && <><p>Đã xem {progress.total ? Math.floor(progress.watched / progress.total * 100) : 0}%. Xem ít nhất 90% video để hoàn thành.</p>{!completed && <button className="primary" disabled={!ready || busy || error} onClick={() => void onComplete(progress.watched, progress.total)}>{busy ? 'Đang lưu…' : 'Lưu tiến độ video'}</button>}</>}</article>;
}
