import { Mic, RotateCcw, Square } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PracticalDetail } from '../services/api';
import { WebSheetMusic } from './WebSheetMusic';
import { detectPitchHz, frequencyToNote, pitchToFrequency, PracticeNoteTracker, type PracticePhase } from './practicePitch';

type Score = { metadata: { tempo?: number; timeSignature?: { beats: number; beatType: number } }; notes: Array<{ id: string; pitch: string; duration: string }> };

function readScore(practical: PracticalDetail): Score {
  let parsed: Partial<Score> | null = null;
  try { parsed = JSON.parse(practical.sheetMusicJson || 'null'); } catch { /* Legacy lessons may only provide expected notes. */ }
  const sheetNotes = Array.isArray(parsed?.notes) ? parsed.notes : [];
  const expected = [...(practical.expectedNotes || [])].sort((a, b) => a.sortOrder - b.sortOrder);
  // The server grades expectedNotes when present; keep that sequence authoritative.
  const notes = expected.length
    ? expected.map((note, index) => ({ id: String(index), pitch: note.note, duration: sheetNotes[index]?.duration || 'q' }))
    : sheetNotes.filter(note => typeof note?.pitch === 'string').map((note, index) => ({ id: String(index), pitch: note.pitch, duration: note.duration || 'q' }));
  return { metadata: parsed?.metadata || {}, notes };
}

export function PracticalLesson({ practical, busy, completed, onSubmit }: { practical: PracticalDetail; busy: boolean; completed: boolean; onSubmit: (notes: string[]) => Promise<void> }) {
  const score = useMemo(() => readScore(practical), [practical]);
  const [recording, setRecording] = useState(false);
  const [starting, setStarting] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [heard, setHeard] = useState('—');
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<PracticePhase>('waiting');
  const [hint, setHint] = useState('');
  const [error, setError] = useState('');
  const resources = useRef<{ stream?: MediaStream; context?: AudioContext; frame?: number }>({});
  const generation = useRef(0);

  const stop = () => {
    generation.current++;
    const { stream, context, frame } = resources.current;
    if (frame != null) cancelAnimationFrame(frame);
    stream?.getTracks().forEach(track => track.stop());
    if (context && context.state !== 'closed') void context.close().catch(() => {});
    resources.current = {};
  };

  useEffect(() => {
    const hidden = () => { if (document.hidden) { stop(); setRecording(false); setStarting(false); } };
    document.addEventListener('visibilitychange', hidden);
    return () => { stop(); document.removeEventListener('visibilitychange', hidden); };
  }, []);

  const start = async () => {
    if (recording) { stop(); setRecording(false); return; }
    if (starting || busy || completed) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError('Microphone cần HTTPS (hoặc localhost). Trên điện thoại, hãy mở website bằng HTTPS.');
      return;
    }
    const id = ++generation.current;
    setStarting(true); setError(''); setNotes([]); setHeard('—'); setIndex(0); setPhase('waiting'); setHint('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      if (generation.current !== id) { stream.getTracks().forEach(track => track.stop()); return; }
      resources.current.stream = stream;
      const context = new AudioContext();
      resources.current.context = context;
      await context.resume();
      if (generation.current !== id) return;
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      context.createMediaStreamSource(stream).connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);
      const tracker = new PracticeNoteTracker(score.notes.map(note => note.pitch));
      let lastFrame = 0;
      setRecording(true);
      const analyse = (now: number) => {
        if (generation.current !== id) return;
        if (now - lastFrame >= 50) {
          lastFrame = now;
          analyser.getFloatTimeDomainData(buffer);
          const frequency = detectPitchHz(buffer, context.sampleRate);
          setHeard(frequency ? frequencyToNote(frequency) || '—' : '—');
          const observation = tracker.observe(frequency, now);
          setPhase(observation.phase);
          if (observation.phase === 'wrong') setHint(`Nốt ${observation.index + 1} chưa đúng. ${observation.direction === 'higher' ? 'Thử thổi cao hơn.' : observation.direction === 'lower' ? 'Thử thổi thấp hơn.' : 'Hãy thổi lại nốt này.'}`);
          else if (observation.phase === 'separate') setHint('Ngắt hơi ngắn rồi thổi lại nốt giống nhau.');
          else if (observation.direction) setHint(observation.direction === 'higher' ? 'Hơi thấp, tăng cao độ một chút.' : 'Hơi cao, hạ cao độ một chút.');
          else setHint('');
          if (observation.phase === 'advanced' || observation.phase === 'complete') {
            setNotes([...tracker.accepted]);
            setIndex(observation.index);
          }
          if (observation.phase === 'complete') {
            stop(); setRecording(false);
            void onSubmit([...tracker.accepted]);
            return;
          }
        }
        resources.current.frame = requestAnimationFrame(analyse);
      };
      resources.current.frame = requestAnimationFrame(analyse);
    } catch {
      if (generation.current === id) {
        stop(); setRecording(false);
        setError('Không mở được microphone. Kiểm tra quyền microphone trong trình duyệt rồi thử lại.');
      }
    } finally { if (generation.current === id || !resources.current.stream) setStarting(false); }
  };

  if (!score.notes.length || score.notes.some(note => !pitchToFrequency(note.pitch)))
    return <p role="alert">Bài thực hành chưa có nốt nhạc hợp lệ. Vui lòng chọn bài khác hoặc liên hệ giảng viên.</p>;
  if (score.notes.length > 512) return <p role="alert">Bản nhạc này quá dài để luyện bằng microphone trên web.</p>;

  const groups = Array.from({ length: Math.ceil(score.notes.length / 4) }, (_, i) => score.notes.slice(i * 4, i * 4 + 4));
  const target = score.notes[index]?.pitch;
  return <article className="lesson-content practical-lesson">
    <div className="practice-top"><span>Bản nhạc bài học</span>{score.metadata.tempo && <span>{score.metadata.tempo} BPM</span>}</div>
    <div className="lesson-sheet">{groups.map((group, groupIndex) => <WebSheetMusic key={groupIndex} score={{ ...score, notes: group }} currentIndex={Math.floor(index / 4) === groupIndex ? index % 4 : -1} wrongIndex={phase === 'wrong' && Math.floor(index / 4) === groupIndex ? index % 4 : -1} />)}</div>
    <p className="expected-notes">{score.notes.map(note => note.pitch).join(' → ')}</p>
    <div className="pitch-recorder">
      <h2>Thực hành với microphone</h2>
      <p>Thổi theo thứ tự trên bản nhạc. Khi nốt ổn định, hệ thống tự chuyển sang nốt tiếp theo. Nốt hơi cao hoặc thấp sẽ được nhắc chỉnh; chỉ nốt sai rõ hoặc sai lâu mới báo thổi lại.</p>
      <div className="practice-target" aria-live="polite">
        <span>Nốt {Math.min(index + 1, score.notes.length)}/{score.notes.length}</span>
        <strong>{target || 'Hoàn tất lượt thổi'}</strong>
      </div>
      <div className="pitch-readout"><strong>{heard}</strong><span>Micro đang nghe · {notes.length} nốt đúng</span></div>
      <p className={`practice-hint ${phase === 'wrong' ? 'wrong' : ''}`} role={phase === 'wrong' ? 'alert' : 'status'}>{error || hint || (recording ? 'Thổi nốt đang sáng trên bản nhạc.' : notes.length === score.notes.length ? 'Đã nghe đủ nốt; đang gửi kết quả.' : 'Nhấn “Bắt đầu nghe” khi bạn sẵn sàng.')}</p>
      <div className="lesson-actions"><button className="record-button" disabled={busy || completed || starting} onClick={() => void start()}>{recording ? <Square size={18} /> : <Mic size={18} />}{starting ? 'Đang mở microphone…' : recording ? 'Dừng nghe' : 'Bắt đầu nghe'}</button><button className="text-button" disabled={recording || starting || busy || !notes.length} onClick={() => { setNotes([]); setHeard('—'); setIndex(0); setPhase('waiting'); setHint(''); }}><RotateCcw size={16} /> Xóa lượt thu</button></div>
      <p className="recorded-notes">Nốt đã đúng: {notes.length ? notes.join(' · ') : 'Chưa có nốt nào'}</p>
      <p className="video-note">Phân tích cao độ một nhạc cụ tại một thời điểm; không lưu âm thanh. Nên luyện ở nơi yên tĩnh.</p>
      {!completed && notes.length === score.notes.length && <button className="primary" disabled={busy || recording || starting} onClick={() => void onSubmit(notes)}>{busy ? 'Đang chấm…' : 'Gửi lại kết quả'}</button>}
    </div>
  </article>;
}
