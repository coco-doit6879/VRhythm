import { Check, ChevronLeft, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { bambooFluteScore, mockLessons } from '../data/mock';
import { WebSheetMusic } from './WebSheetMusic';

const midi: Record<string, number> = { C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81, B5: 83, C6: 84 };
const duration = 750;

export function LessonPlayer({ onBack }: { onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);
  const current = bambooFluteScore.notes[index];

  const stop = () => { if (timer.current) window.clearTimeout(timer.current); timer.current = null; setPlaying(false); };
  const play = () => { if (playing) return; setPlaying(true); };
  useEffect(() => {
    if (!playing) return;
    const audio = new Audio(`/audio/${current.pitch}.ogg`);
    audio.volume = .82;
    void audio.play().catch(() => undefined);
    timer.current = window.setTimeout(() => { if (index + 1 >= bambooFluteScore.notes.length) { stop(); } else setIndex(index + 1); }, duration);
    return () => { audio.pause(); audio.currentTime = 0; if (timer.current) window.clearTimeout(timer.current); };
  }, [playing, index, current.pitch]);
  useEffect(() => () => stop(), []);
  return <main className="page lesson-page"><button className="text-button" onClick={onBack}><ChevronLeft size={18} /> Quay lại khóa học</button><div className="lesson-header"><div><div className="section-kicker">Bài 04 · Thực hành</div><h1>Luyện gam Đô trưởng</h1><p>Nghe từng nốt, quan sát thế bấm và thử chơi lại trên cây sáo của bạn.</p></div><span className="lesson-badge"><Volume2 size={16} /> Sáo trúc · 15 phút</span></div><div className="lesson-grid"><section className="practice-card"><div className="practice-top"><span>Web Sheet Engine · {bambooFluteScore.metadata.tempo} BPM</span><strong>{index + 1} / {bambooFluteScore.notes.length}</strong></div><div className="real-sheet"><WebSheetMusic score={bambooFluteScore} currentIndex={index} /></div><div className="target-note"><small>Nốt hiện tại</small><strong>{current.pitch}</strong><span>Giữ hơi đều, ngón tay bịt kín lỗ sáo</span></div><div className="practice-controls"><button className="icon-button" onClick={() => setIndex(Math.max(0, index - 1))}>‹</button><button className="play-large" onClick={playing ? stop : play}>{playing ? <Pause /> : <Play />}</button><button className="icon-button" onClick={() => setIndex(Math.min(bambooFluteScore.notes.length - 1, index + 1))}>›</button><button className="icon-button" onClick={() => { stop(); setIndex(0); }}><RotateCcw size={16} /></button></div><div className="lesson-progress"><i style={{ width: `${(index / (bambooFluteScore.notes.length - 1)) * 100}%` }} /></div></section><aside className="lesson-sidebar"><div className="section-kicker">Nội dung khóa học</div><h2>Nhập môn Sáo Trúc</h2>{mockLessons.map(lesson => <div className={lesson.id === 104 ? 'lesson-item current' : 'lesson-item'} key={lesson.id}><span>{lesson.done ? <Check size={14} /> : lesson.id === 104 ? '04' : '05'}</span><div><strong>{lesson.title}</strong><small>{lesson.type} · {lesson.duration}</small></div></div>)}</aside></div></main>;
}
