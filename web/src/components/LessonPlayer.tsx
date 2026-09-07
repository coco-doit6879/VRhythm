import { ArrowLeft, ArrowRight, Check, ChevronLeft, CheckCircle2, CirclePlay, Mic, Pause, Play, RotateCcw, Square, Volume2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { bambooFluteScore, mockLessons } from '../data/mock';
import { api, authStorage } from '../services/api';
import { WebSheetMusic } from './WebSheetMusic';

type LessonRoute = { courseId: number; chapterId: number; lessonId: number };
type Lesson = { id: number; title: string; type: string; duration: string; done: boolean };
type Chapter = { id: number; title: string; lessons: Lesson[] };
type QuizQuestion = { question: string; options: string[]; answer: number; explanation: string };

const midi: Record<string, number> = { C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81, B5: 83, C6: 84 };
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const chapters: Chapter[] = [
  { id: 1, title: 'Nhập môn Sáo Trúc', lessons: mockLessons.slice(0, 5) },
  { id: 2, title: 'Làm quen nốt nhạc', lessons: [{ id: 201, title: 'Vị trí 3 nốt Đồ, Rê, Mi', type: 'Theory', duration: '9 phút', done: false }, { id: 202, title: 'Thực hành 3 nốt', type: 'Practical', duration: '12 phút', done: false }] },
  { id: 3, title: 'Hoàn thiện thang âm', lessons: [{ id: 301, title: 'Thang âm Đô trưởng', type: 'Practical', duration: '15 phút', done: false }, { id: 302, title: 'Kiểm tra cuối chương', type: 'Quiz', duration: '5 câu hỏi', done: false }] },
];
const completionKey = 'vrhythm_completed_lessons';
const readCompletedLessons = (): number[] => JSON.parse(localStorage.getItem(completionKey) ?? '[]') as number[];
const quizQuestions: Record<number, QuizQuestion[]> = {
  105: [
    { question: 'Sáo trúc Việt Nam thường được làm từ chất liệu nào?', options: ['Tre hoặc trúc', 'Kim loại', 'Nhựa', 'Gỗ lim'], answer: 0, explanation: 'Tre và trúc tạo ra thân sáo nhẹ, bền và có âm sắc gần gũi.' },
    { question: 'Kỹ thuật thở nền tảng khi chơi sáo trúc là gì?', options: ['Thở ngực', 'Thở bụng', 'Nín thở', 'Thở thật nhanh'], answer: 1, explanation: 'Thở bụng giúp luồng hơi đều và kiểm soát được độ dài của âm.' },
    { question: 'Nếu ngón tay bịt lỗ sáo không kín, điều gì thường xảy ra?', options: ['Âm thanh vang hơn', 'Sáo tự lên tông', 'Tiếng bị xì hoặc không kêu', 'Không có thay đổi'], answer: 2, explanation: 'Khe hở làm thất thoát cột khí, khiến âm bị xì hoặc không phát ra.' },
  ],
  302: [
    { question: 'Trong thang âm Đô trưởng, sau nốt Mi là nốt nào?', options: ['Rê', 'Fa', 'Sol', 'Si'], answer: 1, explanation: 'Thứ tự cơ bản là Đô, Rê, Mi, Fa, Sol, La, Si, Đô.' },
    { question: 'Muốn lên nốt cao hơn trên sáo, người chơi thường cần làm gì?', options: ['Thổi mạnh hơn có kiểm soát', 'Bịt thêm tất cả lỗ', 'Dừng luồng hơi', 'Đổi sang dây đàn'], answer: 0, explanation: 'Quãng cao cần luồng hơi nhanh và tập trung hơn, không chỉ thổi thật mạnh.' },
    { question: 'Bước nào giúp tiếng sáo ổn định nhất?', options: ['Bịt kín lỗ và giữ hơi đều', 'Đổi ngón liên tục', 'Thổi đứt quãng', 'Cắn vào thân sáo'], answer: 0, explanation: 'Hai nền tảng đầu tiên luôn là thế ngón kín và luồng hơi đều.' },
  ],
};

function detectPitch(buffer: Float32Array, sampleRate: number) {
  let rms = 0;
  for (const sample of buffer) rms += sample * sample;
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.015) return null;
  let bestOffset = -1;
  let bestCorrelation = 0;
  for (let offset = 18; offset < buffer.length / 2; offset += 2) {
    let correlation = 0;
    for (let index = 0; index < buffer.length - offset; index += 2) correlation += 1 - Math.abs(buffer[index] - buffer[index + offset]);
    correlation /= buffer.length / 2;
    if (correlation > bestCorrelation) { bestCorrelation = correlation; bestOffset = offset; }
  }
  return bestOffset > 0 && bestCorrelation > 0.45 ? sampleRate / bestOffset : null;
}

function pitchLabel(frequency: number) {
  const midiNote = Math.round(69 + 12 * Math.log2(frequency / 440));
  const name = `${noteNames[(midiNote + 120) % 12]}${Math.floor(midiNote / 12) - 1}`;
  return { name, midiNote, cents: Math.round((69 + 12 * Math.log2(frequency / 440) - midiNote) * 100) };
}

export function LessonPlayer({ route, onBack, onOpenLesson }: { route: LessonRoute; onBack: () => void; onOpenLesson: (route: LessonRoute) => void }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [detected, setDetected] = useState<{ name: string; midiNote: number; cents: number } | null>(null);
  const [recordingError, setRecordingError] = useState('');
  const [completed, setCompleted] = useState(() => readCompletedLessons().includes(route.lessonId));
  const timer = useRef<number | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const animation = useRef<number | null>(null);
  const chapter = chapters.find(item => item.id === route.chapterId) ?? chapters[0];
  const currentLesson = chapter.lessons.find(lesson => lesson.id === route.lessonId) ?? chapter.lessons[0];
  const current = bambooFluteScore.notes[index] ?? bambooFluteScore.notes[0];
  useEffect(() => setCompleted(readCompletedLessons().includes(route.lessonId)), [route.lessonId]);

  const stop = () => { if (timer.current) window.clearTimeout(timer.current); timer.current = null; setPlaying(false); };
  useEffect(() => { if (!playing || currentLesson.type !== 'Practical') return; const audio = new Audio(`/audio/${current.pitch}.ogg`); audio.volume = .82; void audio.play().catch(() => undefined); timer.current = window.setTimeout(() => { if (index + 1 >= bambooFluteScore.notes.length) stop(); else setIndex(index + 1); }, 750); return () => { audio.pause(); audio.currentTime = 0; if (timer.current) window.clearTimeout(timer.current); }; }, [playing, index, current.pitch, currentLesson.type]);
  useEffect(() => () => { stop(); if (animation.current) cancelAnimationFrame(animation.current); mediaStream.current?.getTracks().forEach(track => track.stop()); void audioContext.current?.close(); }, []);

  const stopRecording = () => { if (animation.current) cancelAnimationFrame(animation.current); mediaStream.current?.getTracks().forEach(track => track.stop()); mediaStream.current = null; void audioContext.current?.close(); audioContext.current = null; setRecording(false); };
  const startRecording = async () => {
    if (recording) { stopRecording(); return; }
    if (!navigator.mediaDevices?.getUserMedia) { setRecordingError('Trình duyệt này không hỗ trợ microphone.'); return; }
    try {
      setRecordingError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const context = new AudioContext(); const source = context.createMediaStreamSource(stream); const analyser = context.createAnalyser();
      analyser.fftSize = 2048; source.connect(analyser); const buffer = new Float32Array(analyser.fftSize);
      mediaStream.current = stream; audioContext.current = context; setRecording(true);
      const analyse = () => { analyser.getFloatTimeDomainData(buffer); const frequency = detectPitch(buffer, context.sampleRate); if (frequency) setDetected(pitchLabel(frequency)); animation.current = requestAnimationFrame(analyse); };
      analyse();
    } catch { setRecordingError('Không thể truy cập microphone. Hãy cấp quyền rồi thử lại.'); setRecording(false); }
  };

  const targetMidi = midi[current.pitch] ?? 72;
  const isInTune = detected !== null && detected.midiNote === targetMidi && Math.abs(detected.cents) <= 35;
  const selectLesson = (lessonId: number, chapterId: number) => onOpenLesson({ courseId: route.courseId, chapterId, lessonId });
  const completeLesson = async () => {
    const completedLessons = new Set(readCompletedLessons());
    completedLessons.add(route.lessonId);
    localStorage.setItem(completionKey, JSON.stringify([...completedLessons]));
    setCompleted(true);
    if (!authStorage.read()) return;
    try {
      if (currentLesson.type === 'Theory') await api.completeTheory(route.lessonId);
      if (currentLesson.type === 'Video') await api.updateLessonProgress(route.courseId, route.lessonId, 1, 1);
      if (currentLesson.type === 'Practical') await api.submitPractical(route.lessonId, route.lessonId === 104 ? ['G5', 'G5'] : bambooFluteScore.notes.map(note => note.pitch));
      await api.recalculateCourseCompletion(route.courseId);
    } catch { /* Keep the local completion state while the mock lesson is not in the API catalog. */ }
  };
  const labelType = (type: string) => type === 'Theory' ? 'Lý thuyết' : type === 'Video' ? 'Video' : type === 'Practical' ? 'Thực hành' : 'Trắc nghiệm';
  const quiz = quizQuestions[route.lessonId];

  return <main className="page lesson-page"><button className="text-button" onClick={onBack}><ChevronLeft size={18} /> Quay lại khóa học</button><div className="lesson-header"><div><div className="section-kicker">Chương {String(route.chapterId).padStart(2, '0')} · Bài {String(route.lessonId).padStart(2, '0')}</div><h1>{currentLesson.title}</h1><p>{currentLesson.type === 'Theory' ? 'Nắm nền tảng trước khi bắt đầu luyện tập.' : currentLesson.type === 'Video' ? 'Xem hướng dẫn và thực hành từng bước cùng giảng viên.' : currentLesson.type === 'Quiz' ? 'Kiểm tra lại kiến thức sau chương học.' : 'Nghe từng nốt, quan sát thế bấm và thử chơi lại trên cây sáo của bạn.'}</p></div><span className="lesson-badge"><Volume2 size={16} /> Sáo trúc · {currentLesson.duration}</span></div><div className="lesson-grid"><section className="practice-card">{currentLesson.type === 'Theory' && <TheoryLesson lessonId={route.lessonId} completed={completed} onComplete={completeLesson} />}{currentLesson.type === 'Video' && <VideoLesson lessonId={route.lessonId} completed={completed} onComplete={completeLesson} />}{currentLesson.type === 'Quiz' && <QuizLesson questions={quiz ?? quizQuestions[105]} completed={completed} onComplete={completeLesson} />}{currentLesson.type === 'Practical' && <PracticeLesson current={current} index={index} playing={playing} setIndex={setIndex} stop={stop} play={() => setPlaying(true)} scoreLength={bambooFluteScore.notes.length} recording={recording} detected={detected} isInTune={isInTune} recordingError={recordingError} startRecording={startRecording} completed={completed} onComplete={completeLesson} />}</section><aside className="lesson-sidebar"><div className="section-kicker">Nội dung khóa học</div><h2>Nhập môn Sáo Trúc</h2>{chapters.map(item => { const doneCount = item.lessons.filter(lesson => lesson.done || readCompletedLessons().includes(lesson.id)).length; const chapterDone = doneCount === item.lessons.length; return <div className="chapter-group" key={item.id}><h3><span>Chương {String(item.id).padStart(2, '0')} · {item.title}</span><small>{doneCount}/{item.lessons.length} {chapterDone && <CheckCircle2 size={14} />}</small></h3>{item.lessons.map(lesson => { const isDone = lesson.done || readCompletedLessons().includes(lesson.id); return <button className={lesson.id === route.lessonId ? 'lesson-item current' : 'lesson-item'} key={lesson.id} onClick={() => selectLesson(lesson.id, item.id)}><span>{isDone ? <Check size={14} /> : String(lesson.id % 100 || item.id).padStart(2, '0')}</span><div><strong>{lesson.title}</strong><small>{labelType(lesson.type)} · {lesson.duration}</small></div></button>; })}</div>; })}</aside></div></main>;
}

function TheoryLesson({ lessonId, completed, onComplete }: { lessonId: number; completed: boolean; onComplete: () => void }) {
  const isNotes = lessonId === 201;
  return <article className="lesson-content"><div className="content-kicker">Lý thuyết</div><h2>{isNotes ? 'Ba nốt đầu tiên: Đồ, Rê, Mi' : 'Sáo trúc Việt Nam và cách tạo âm'}</h2><p>{isNotes ? 'Ba nốt Đồ, Rê, Mi là nền tảng để bạn bắt đầu đọc sheet nhạc và làm quen với thế bấm.' : 'Sáo trúc thường được làm từ tre hoặc trúc. Âm thanh hình thành khi luồng hơi đi qua lỗ thổi và làm rung cột khí trong thân sáo.'}</p><div className="lesson-points"><div><b>01</b><span>{isNotes ? 'Bịt kín sáu lỗ để tạo nốt Đồ.' : 'Giữ thân sáo ngang, môi thả lỏng và hướng hơi ổn định.'}</span></div><div><b>02</b><span>{isNotes ? 'Mở lần lượt lỗ dưới để chuyển sang Rê rồi Mi.' : 'Tập hơi đều trước khi tăng lực để âm không bị xì.'}</span></div><div><b>03</b><span>{isNotes ? 'Chuyển ngón chậm, không nhấc ngón quá cao.' : 'Nghe độ vang của âm để tự điều chỉnh góc môi.'}</span></div></div><CompletionButton completed={completed} onComplete={onComplete} label="Đánh dấu đã học" /></article>;
}

function VideoLesson({ lessonId, completed, onComplete }: { lessonId: number; completed: boolean; onComplete: () => void }) {
  const video = lessonId === 102
    ? { id: 'YwYzC-aL9M4', title: 'Hướng dẫn học thổi sáo cho người mới' }
    : { id: '5ppzDF6GE1w', title: 'Thực hành và nghe âm thanh sáo trúc' };
  return <article className="lesson-content"><div className="content-kicker">Video hướng dẫn</div><h2>{video.title}</h2><div className="video-frame"><iframe title={video.title} src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div><p className="video-note">Video được tải trực tiếp từ YouTube. Bạn có thể mở toàn màn hình để quan sát tư thế và thế ngón rõ hơn.</p><a className="text-button" href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer"><CirclePlay size={16} /> Mở video trên YouTube</a><CompletionButton completed={completed} onComplete={onComplete} label="Đã xem xong video" /></article>;
}

function QuizLesson({ questions, completed, onComplete }: { questions: QuizQuestion[]; completed: boolean; onComplete: () => void }) {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = questions.reduce((total, item, index) => total + (selected[index] === item.answer ? 1 : 0), 0);
  const passed = score / questions.length >= .7;
  return <article className="lesson-content quiz-content"><div className="content-kicker">Trắc nghiệm</div><h2>Kiểm tra kiến thức</h2><p>Chọn đáp án, sau đó bấm nộp bài để xem kết quả và giải thích.</p>{questions.map((item, index) => <div className="quiz-question" key={item.question}><h3><span>{String(index + 1).padStart(2, '0')}</span>{item.question}</h3><div className="quiz-options">{item.options.map((option, optionIndex) => <button className={selected[index] === optionIndex ? 'quiz-option selected' : 'quiz-option'} disabled={submitted} key={option} onClick={() => setSelected(current => ({ ...current, [index]: optionIndex }))}>{option}</button>)}</div>{submitted && <div className={selected[index] === item.answer ? 'quiz-feedback correct' : 'quiz-feedback incorrect'}>{selected[index] === item.answer ? <CheckCircle2 size={16} /> : <XCircle size={16} />}{selected[index] === item.answer ? 'Chính xác. ' : 'Chưa đúng. '}{item.explanation}</div>}</div>)}<div className="quiz-footer">{submitted ? <strong>Kết quả: {score} / {questions.length}</strong> : <span>{Object.keys(selected).length} / {questions.length} câu đã chọn</span>}<button className="primary" disabled={Object.keys(selected).length < questions.length} onClick={() => { setSubmitted(true); if (passed) onComplete(); }}>{submitted ? 'Đã chấm bài' : 'Nộp bài'}</button></div>{submitted && !passed && <p className="recorder-error">Bạn cần đạt ít nhất 70% để hoàn thành bài quiz.</p>}{submitted && passed && !completed && <p className="pitch-result correct">Quiz đạt yêu cầu, bài học đã được ghi nhận.</p>}</article>;
}

function PracticeLesson({ current, index, playing, setIndex, stop, play, scoreLength, recording, detected, isInTune, recordingError, startRecording, completed, onComplete }: { current: { pitch: string }; index: number; playing: boolean; setIndex: (value: number) => void; stop: () => void; play: () => void; scoreLength: number; recording: boolean; detected: { name: string; cents: number } | null; isInTune: boolean; recordingError: string; startRecording: () => void; completed: boolean; onComplete: () => void }) {
  return <><div className="practice-top"><span>Sheet nhạc · 80 BPM</span><strong>{String(index + 1).padStart(2, '0')} / {String(scoreLength).padStart(2, '0')}</strong></div><div className="real-sheet"><WebSheetMusic score={bambooFluteScore} currentIndex={index} /></div><div className="target-note"><small>Nốt mục tiêu</small><strong>{current.pitch}</strong><span>Giữ hơi đều, ngón tay bịt kín lỗ sáo</span></div><div className="practice-controls"><button className="icon-button" aria-label="Nốt trước" onClick={() => setIndex(Math.max(0, index - 1))}><ArrowLeft size={17} /></button><button className="play-large" aria-label={playing ? 'Tạm dừng' : 'Phát bài tập'} onClick={playing ? stop : play}>{playing ? <Pause /> : <Play />}</button><button className="icon-button" aria-label="Nốt tiếp theo" onClick={() => setIndex(Math.min(scoreLength - 1, index + 1))}><ArrowRight size={17} /></button><button className="icon-button" aria-label="Đặt lại" onClick={() => { stop(); setIndex(0); }}><RotateCcw size={16} /></button></div><div className="lesson-progress"><i style={{ width: `${(index / (scoreLength - 1)) * 100}%` }} /></div><div className="pitch-recorder"><div className="recorder-heading"><div><span className="section-kicker">Luyện bằng microphone</span><h3>Kiểm tra nốt thổi</h3></div><button className={recording ? 'record-button active' : 'record-button'} onClick={startRecording}>{recording ? <Square size={15} /> : <Mic size={15} />} {recording ? 'Dừng nghe' : 'Bắt đầu nghe'}</button></div><div className="pitch-readout"><strong>{detected?.name ?? '--'}</strong><span>{detected ? `${detected.cents > 0 ? '+' : ''}${detected.cents} cents` : 'Thổi một nốt vào microphone'}</span></div><div className={`pitch-result ${detected ? (isInTune ? 'correct' : 'adjust') : ''}`}>{detected ? (isInTune ? 'Đúng cao độ mục tiêu' : `Đang nghe ${detected.name}, hãy điều chỉnh hơi`) : 'Ứng dụng chỉ phân tích âm thanh, không lưu bản ghi.'}</div>{recordingError && <p className="recorder-error">{recordingError}</p>}</div><CompletionButton completed={completed} onComplete={onComplete} label="Hoàn thành bài thực hành" /></>;
}

function CompletionButton({ completed, onComplete, label }: { completed: boolean; onComplete: () => void; label: string }) {
  return completed
    ? <div className="completion-done"><CheckCircle2 size={16} /> Đã hoàn thành</div>
    : <button className="primary completion-button" onClick={onComplete}>{label}</button>;
}
