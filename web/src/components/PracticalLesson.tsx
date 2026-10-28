import { Check, Mic, RotateCcw, Square } from 'lucide-react';
import { type ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { SheetScore } from '../audio/fluteScore';
import type { PracticalDetail } from '../services/api';
import { PracticeListening } from './PracticeListening';
import './practice-workspace.css';
import { WebSheetMusic } from './WebSheetMusic';
import { detectPitchHz, frequencyToNote, pitchToFrequency, PracticeNoteTracker, type PracticeMode, type PracticePhase } from './practicePitch';

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

type PracticalLessonProps = {
  practical: PracticalDetail;
  busy: boolean;
  completed: boolean;
  onSubmit: (notes: string[]) => Promise<void>;
  renderNotation?: (index: number) => ReactNode;
  listeningScore?: SheetScore;
  localPractice?: boolean;
};

export function PracticalLesson({ practical, busy, completed, onSubmit, renderNotation, listeningScore, localPractice = false }: PracticalLessonProps) {
  const score = useMemo(() => readScore(practical), [practical]);
  const [recording, setRecording] = useState(false);
  const [starting, setStarting] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [heard, setHeard] = useState('—');
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<PracticePhase>('waiting');
  const [hint, setHint] = useState('');
  const [error, setError] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');
  const [failed, setFailed] = useState(false);
  const [success, setSuccess] = useState('');
  const [takePlaying, setTakePlaying] = useState(false);
  const [mode, setMode] = useState<PracticeMode>('single-take');
  const [trialCompleted, setTrialCompleted] = useState(false);
  const modeId = useId();
  const attemptCompleted = mode === 'try' ? trialCompleted : completed;
  const takeAudio = useRef<HTMLAudioElement>(null);
  const takeUrl = useRef('');
  const mounted = useRef(true);
  const sheet = useRef<HTMLDivElement>(null);
  const resources = useRef<{ stream?: MediaStream; context?: AudioContext; frame?: number; recorder?: MediaRecorder; limit?: ReturnType<typeof setTimeout> }>({});
  const generation = useRef(0);

  const stop = () => {
    generation.current++;
    const { stream, context, frame, recorder, limit } = resources.current;
    clearTimeout(limit);
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    if (frame != null) cancelAnimationFrame(frame);
    stream?.getTracks().forEach(track => track.stop());
    if (context && context.state !== 'closed') void context.close().catch(() => {});
    resources.current = {};
  };
  const clearAttempt = () => {
    // Ignore late MediaRecorder callbacks from the discarded take or previous mode.
    generation.current++;
    setNotes([]); setHeard('—'); setIndex(0); setPhase('waiting'); setHint(''); setError(''); setSuccess(''); setFailed(false); setTrialCompleted(false);
    takeAudio.current?.pause(); setTakePlaying(false);
    if (takeUrl.current) URL.revokeObjectURL(takeUrl.current);
    takeUrl.current = ''; setRecordingUrl('');
  };

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; if (takeUrl.current) URL.revokeObjectURL(takeUrl.current); };
  }, []);
  useEffect(() => {
    const panel = sheet.current;
    const group = panel?.querySelector(`[data-group="${Math.floor(index / 4)}"]`);
    if (panel && group) panel.scrollTop += group.getBoundingClientRect().top - panel.getBoundingClientRect().top;
  }, [index]);
  useEffect(() => {
    const hidden = () => { if (document.hidden) { stop(); setRecording(false); setStarting(false); } };
    document.addEventListener('visibilitychange', hidden);
    return () => { stop(); document.removeEventListener('visibilitychange', hidden); };
  }, []);

  const start = async () => {
    if (recording) { stop(); setRecording(false); return; }
    if (starting || busy || attemptCompleted) return;
    takeAudio.current?.pause(); setTakePlaying(false);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError('Microphone cần HTTPS (hoặc localhost). Trên điện thoại, hãy mở website bằng HTTPS.');
      return;
    }
    clearAttempt();
    const id = ++generation.current;
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      if (generation.current !== id) { stream.getTracks().forEach(track => track.stop()); return; }
      resources.current.stream = stream;
      // Audio stays in memory on this device, including a failed attempt.
      if (typeof MediaRecorder !== 'undefined') {
        try {
          const recorder = new MediaRecorder(stream);
          const chunks: BlobPart[] = [];
          recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
          recorder.onstop = () => {
            if (!mounted.current || !chunks.length || generation.current !== id + 1) return;
            if (takeUrl.current) URL.revokeObjectURL(takeUrl.current);
            takeUrl.current = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType }));
            setRecordingUrl(takeUrl.current);
          };
          recorder.onerror = () => { if (mounted.current && generation.current === id) setError('Không lưu được lượt thu để nghe lại. Bạn vẫn có thể luyện cao độ.'); };
          recorder.start(); resources.current.recorder = recorder;
        } catch { setError('Trình duyệt chưa hỗ trợ lưu lượt thu; vẫn có thể luyện cao độ.'); }
      }
      const context = new AudioContext();
      resources.current.context = context;
      await context.resume();
      if (generation.current !== id) return;
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      context.createMediaStreamSource(stream).connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);
      const tracker = new PracticeNoteTracker(score.notes.map(note => note.pitch), mode);
      let lastFrame = 0;
      setRecording(true);
      resources.current.limit = setTimeout(() => { stop(); setRecording(false); setHint('Đã dừng sau 3 phút. Bạn có thể nghe lại hoặc bắt đầu lượt mới.'); }, 180_000);
      const analyse = (now: number) => {
        if (generation.current !== id) return;
        if (now - lastFrame >= 50) {
          lastFrame = now;
          analyser.getFloatTimeDomainData(buffer);
          const frequency = detectPitchHz(buffer, context.sampleRate);
          setHeard(frequency ? frequencyToNote(frequency) || '—' : '—');
          const observation = tracker.observe(frequency, now);
          setPhase(observation.phase);
          if (observation.phase === 'wrong') setHint(mode === 'try'
            ? `Nốt ${observation.index + 1} chưa đúng. ${observation.direction === 'higher' ? 'Cần cao hơn.' : observation.direction === 'lower' ? 'Cần thấp hơn.' : ''} Chỉnh lại hoặc ngắt hơi để thử lại nốt này.`
            : `Nốt ${observation.index + 1} chưa đúng. ${observation.direction === 'higher' ? 'Cần cao hơn; ngắt hơi để thử lại từ đầu.' : observation.direction === 'lower' ? 'Cần thấp hơn; ngắt hơi để thử lại từ đầu.' : 'Ngắt hơi để kết thúc lượt này.'}`);
          else if (observation.phase === 'separate') setHint('Đúng cao độ. Ngắt hơi để chốt nốt này.');
          else if (observation.phase === 'reset') {
            stop(); setRecording(false); setNotes([]); setIndex(0); setFailed(true); setSuccess('');
            setHint('Lượt thổi chưa đúng. Đã về nốt đầu; nghe lại rồi bắt đầu lượt mới nhé.');
            return;
          }
          else if (observation.phase === 'retry') {
            setSuccess('');
            setHint(`Thử lại nốt ${observation.index + 1}. Các nốt đã đúng vẫn được giữ.`);
          }
          else if (observation.direction) setHint(observation.direction === 'higher' ? 'Hơi thấp, tăng cao độ một chút.' : 'Hơi cao, hạ cao độ một chút.');
          else if (observation.phase === 'tuning') setHint('');
          if (observation.phase === 'advanced' || observation.phase === 'complete') {
            const completeHint = mode === 'try' ? 'Hoàn tất đánh thử. Kết quả không lưu tiến độ.' : localPractice ? 'Hoàn tất lượt luyện. Bạn có thể nghe lại hoặc tập lại.' : 'Đã nghe đủ nốt; đang gửi kết quả.';
            setHint(observation.phase === 'complete' ? completeHint : 'Thổi nốt tiếp theo khi bạn sẵn sàng.');
            setSuccess(tracker.accepted.at(-1) || '');
            setNotes([...tracker.accepted]);
            setIndex(observation.index);
          }
          if (observation.phase === 'complete') {
            stop(); setRecording(false);
            if (mode === 'try') setTrialCompleted(true);
            else void onSubmit([...tracker.accepted]);
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

  if (!score.notes.length || score.notes.some(note => typeof note.pitch !== 'string' || !pitchToFrequency(note.pitch)))
    return <p role="alert">Bài thực hành chưa có nốt nhạc hợp lệ. Vui lòng chọn bài khác hoặc liên hệ giảng viên.</p>;
  if (score.notes.length > 512) return <p role="alert">Bản nhạc này quá dài để luyện bằng microphone trên web.</p>;

  const groups = Array.from({ length: Math.ceil(score.notes.length / 4) }, (_, i) => score.notes.slice(i * 4, i * 4 + 4));
  const target = score.notes[index]?.pitch;
  const encouragement = phase === 'separate' ? `${target} đúng cao độ!` : success && phase !== 'wrong' ? `${success} đúng rồi!` : '';
  return <article className={`lesson-content practical-lesson ${recordingUrl ? 'has-take' : ''}`}>
    <section className="practice-score-pane" aria-label="Bản nhạc và nghe mẫu">
      <div className="practice-top"><span>Bản nhạc bài học</span>{score.metadata.tempo && <span>{score.metadata.tempo} BPM</span>}</div>
      <PracticeListening notes={score.notes} tempo={score.metadata.tempo || 80} target={target} disabled={recording || starting || takePlaying} sourceScore={listeningScore} />
      {recordingUrl && <div className="practice-take"><label htmlFor="practice-take-audio">{failed ? 'Nghe lại lượt thổi sai' : 'Nghe lại lượt thu'}</label><audio id="practice-take-audio" ref={takeAudio} aria-label={failed ? 'Nghe lại lượt thổi sai' : 'Nghe lại lượt thu'} controls src={recordingUrl} onPlay={() => setTakePlaying(true)} onPause={() => setTakePlaying(false)} onEnded={() => setTakePlaying(false)} /></div>}
      <div className="lesson-sheet" ref={sheet} tabIndex={0} aria-label="Bản nhạc thực hành">{renderNotation ? renderNotation(index) : groups.map((group, groupIndex) => <div data-group={groupIndex} key={groupIndex}><WebSheetMusic score={{ ...score, notes: group }} currentIndex={Math.floor(index / 4) === groupIndex ? index % 4 : -1} wrongIndex={phase === 'wrong' && Math.floor(index / 4) === groupIndex ? index % 4 : -1} /></div>)}</div>
      <details className="practice-note-sequence"><summary>Thứ tự nốt</summary><p className="expected-notes">{score.notes.map(note => note.pitch).join(' → ')}</p></details>
    </section>
    <section className="pitch-recorder" aria-label="Thu và luyện cao độ">
      <h2>Luyện từng nốt</h2>
      <fieldset className="practice-mode-selector" disabled={busy || recording || starting || takePlaying}>
        <legend>Chế độ luyện</legend>
        {([['single-take', 'Đánh một lượt'], ['try', 'Đánh thử']] as const).map(([value, label]) => <label key={value} className={mode === value ? 'is-selected' : ''}>
          <input type="radio" name={modeId} value={value} checked={mode === value} onChange={() => { clearAttempt(); setMode(value); }} />{label}
        </label>)}
      </fieldset>
      <p>{mode === 'try' ? 'Thổi lại nốt hiện tại đến khi đúng, rồi ngắt hơi để sang nốt tiếp theo. Đánh thử không lưu tiến độ.' : 'Thổi nốt đang sáng, giữ đều rồi ngắt hơi để chốt. Thổi sai sẽ cần bắt đầu lại.'}</p>
      {trialCompleted && <div className="practice-trial-result" role="status"><p>Bạn đã hoàn tất lượt đánh thử. Kết quả không lưu tiến độ.</p><button onClick={clearAttempt}>Đánh thử lại</button></div>}
      <div className="practice-target" aria-live="polite">
        <span>Nốt {Math.min(index + 1, score.notes.length)}/{score.notes.length}</span>
        <strong>{target || 'Hoàn tất lượt thổi'}</strong>
      </div>
      <div className="practice-live-feedback">
        <div className="practice-success" role="status"><span key={`${index}-${encouragement}`} className={encouragement ? 'practice-success-pop' : ''}>{encouragement ? <><Check size={20} aria-hidden="true" />{encouragement}</> : 'Mỗi lần thổi, một nốt.'}</span></div>
        <div className="pitch-readout"><strong>{heard}</strong><span>{recording ? 'Micro đang nghe' : 'Micro đã dừng'} · {notes.length} nốt đúng</span></div>
      </div>
      <p className={`practice-hint ${phase === 'wrong' || failed ? 'wrong' : ''}`} role={phase === 'wrong' || failed ? 'alert' : 'status'}>{error || hint || (recording ? 'Thổi nốt đang sáng trên bản nhạc.' : notes.length === score.notes.length ? 'Đã nghe đủ nốt; đang gửi kết quả.' : 'Nhấn “Bắt đầu nghe” khi bạn sẵn sàng.')}</p>
      <div className="lesson-actions"><button data-activity="practice_start" className="record-button" disabled={busy || attemptCompleted || starting} onClick={() => void start()}>{recording ? <Square size={18} /> : <Mic size={18} />}{starting ? 'Đang mở microphone…' : recording ? 'Dừng nghe' : 'Bắt đầu nghe'}</button><button className="text-button" disabled={recording || starting || busy || (!notes.length && !recordingUrl)} onClick={clearAttempt}><RotateCcw size={16} /> Xóa lượt thu</button></div>

      <p className="recorded-notes">Nốt đã đúng: {notes.length ? notes.join(' · ') : 'Chưa có nốt nào'}</p>
      <p className="video-note">Phân tích cao độ một nhạc cụ tại một thời điểm; âm thanh chỉ giữ tạm trên thiết bị để nghe lại, không tải lên máy chủ.</p>
      {mode === 'single-take' && !completed && notes.length === score.notes.length && <button className="primary" disabled={busy || recording || starting} onClick={() => void onSubmit(notes)}>{busy ? 'Đang chấm…' : 'Gửi lại kết quả'}</button>}
    </section>
  </article>;
}
