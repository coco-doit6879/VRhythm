import { Play, RotateCcw, Search, Square } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PhysicalFluteEngine } from '../audio/PhysicalFluteEngine';
import { buildScoreTimeline } from '../audio/fluteScore';
import { musicLibrary } from '../data/musicLibrary';
import { LibraryNotation } from './LibraryNotation';
import './music-library.css';

const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
const timeLabel = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export default function MusicLibraryPage({ songId }: { songId?: string }) {
  const song = songId ? musicLibrary.find(item => item.id === songId) : musicLibrary[0];
  const [query, setQuery] = useState('');
  const filtered = musicLibrary.filter(item => normalize(`${item.title} ${item.region}`).includes(normalize(query.trim())));
  return <main className="page music-library">
    <header className="library-intro"><h1>Thư viện <em>âm nhạc.</em></h1><p>Chọn một giai điệu, mở bản nhạc và nghe tiếng sáo.</p></header>
    <div className="library-layout">
      <aside className="library-catalog" aria-label="Danh sách bản nhạc">
        <label className="library-search"><Search size={18} aria-hidden="true" /><input type="search" aria-label="Tìm bản nhạc" placeholder="Tìm bản nhạc…" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <ul>{filtered.map(item => <li key={item.id}><a href={`/library/${item.id}`} aria-current={song?.id === item.id ? 'page' : undefined}><strong>{item.title}</strong><span>{item.region} · {item.level}</span></a></li>)}</ul>
        {!filtered.length && <p role="status">Không tìm thấy bản nhạc. Thử tên bài khác.</p>}
      </aside>
      {song ? <LibrarySheet key={song.id} song={song} /> : <section className="library-missing"><h2>Không tìm thấy bản nhạc</h2><a href="/library">Quay lại thư viện</a></section>}
    </div>
  </main>;
}

function LibrarySheet({ song }: { song: typeof musicLibrary[number] }) {
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [starting, setStarting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState('');
  const engine = useRef<PhysicalFluteEngine | null>(null);
  const frame = useRef<number | null>(null);
  const generation = useRef(0);
  const sheetPanel = useRef<HTMLDivElement>(null);
  const score = useMemo(() => ({ ...song.score, metadata: { ...song.score.metadata, tempo: song.score.metadata.tempo * speed } }), [song, speed]);
  const timeline = useMemo(() => buildScoreTimeline(score), [score]);

  const stop = () => {
    generation.current++;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    engine.current?.stop();
    setPlaying(false); setStarting(false); setActiveIndex(-1); setElapsed(0);
  };
  useEffect(() => {
    const hidden = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', hidden);
    return () => {
      generation.current++;
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      void engine.current?.dispose();
      document.removeEventListener('visibilitychange', hidden);
    };
  }, []);


  const play = async () => {
    stop(); setError(''); setStarting(true);
    const run = ++generation.current;
    try {
      const { PhysicalFluteEngine } = await import('../audio/PhysicalFluteEngine');
      if (run !== generation.current) return;
      engine.current ??= new PhysicalFluteEngine();
      const { startTime } = await engine.current.playSequence(timeline.sequence, timeline.sequenceOptions);
      if (run !== generation.current) { engine.current.stop(); return; }
      setStarting(false); setPlaying(true);
      const tick = () => {
        if (run !== generation.current || !engine.current) return;
        const position = Math.max(0, engine.current.currentTime - startTime);
        if (position >= timeline.totalDuration) {
          engine.current.stop(); setPlaying(false); setActiveIndex(-1); setElapsed(timeline.totalDuration); frame.current = null; return;
        }
        setElapsed(position);
        setActiveIndex(timeline.events.findIndex(event => position >= event.start && position < event.start + event.duration));
        frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    } catch {
      if (run === generation.current) { stop(); setError('Không mở được âm thanh. Hãy kiểm tra trình duyệt và thử lại.'); }
    }
  };

  return <section className="library-score" aria-labelledby="library-song-title">
    <div className="library-score-heading"><div><h2 id="library-song-title">{song.title}</h2><p>{song.region} · Sáo trúc · {score.metadata.timeSignature.beats}/{score.metadata.timeSignature.beatType}</p></div><span>♩ = {Math.round(score.metadata.tempo)}</span></div>
    <div className="library-controls">
      <button className="library-play" disabled={starting} onClick={() => playing ? stop() : void play()}>{playing ? <Square size={17} /> : <Play size={17} />}{starting ? 'Đang chuẩn bị…' : playing ? 'Dừng' : 'Nghe mẫu'}</button>
      <button className="library-reset" aria-label="Về đầu bản nhạc" onClick={() => { stop(); if (sheetPanel.current) sheetPanel.current.scrollTop = 0; }}><RotateCcw size={18} /></button>
      <label>Tốc độ <select aria-label="Tốc độ phát" value={speed} onChange={event => { stop(); setSpeed(Number(event.target.value)); }}><option value={.75}>0,75×</option><option value={1}>1×</option><option value={1.25}>1,25×</option></select></label>
      <span className="library-time">{timeLabel(elapsed)} / {timeLabel(timeline.totalDuration)}</span>
    </div>
    {error && <p className="library-error" role="alert">{error}</p>}
    <div className="library-sheet-paper" ref={sheetPanel} aria-label={`Sheet ${song.title}`} tabIndex={0}>
      <LibraryNotation score={score} activeIndex={activeIndex} />
    </div>
    <p className="library-score-note">Bản luyện đơn âm · Nốt sáng theo tiếng sáo khi nghe mẫu.</p>
  </section>;
}
