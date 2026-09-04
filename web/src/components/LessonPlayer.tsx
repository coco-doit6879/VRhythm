import { BookOpen, Check, ChevronLeft, HelpCircle, Music, Pause, Play, RotateCcw, Video, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { bambooFluteScore, mockLessons, mockQuizData } from '../data/mock';
import { QuizPlayer } from './QuizPlayer';
import { WebSheetMusic } from './WebSheetMusic';

const duration = 750;

export function LessonPlayer({ onBack }: { onBack: () => void }) {
  const [activeLessonId, setActiveLessonId] = useState<number>(104);
  const [completedLessons, setCompletedLessons] = useState<Record<number, boolean>>({
    101: true,
    102: true,
    103: true,
  });

  // Practical sheet music state
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);
  const current = bambooFluteScore.notes[index];

  const currentLesson = mockLessons.find(l => l.id === activeLessonId) || mockLessons[3];

  const stop = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setPlaying(false);
  };
  
  const play = () => {
    if (playing) return;
    setPlaying(true);
  };

  useEffect(() => {
    if (!playing || currentLesson.type !== 'Practical') return;
    const audio = new Audio(`/audio/${current.pitch}.ogg`);
    audio.volume = 0.82;
    void audio.play().catch(() => undefined);
    timer.current = window.setTimeout(() => {
      if (index + 1 >= bambooFluteScore.notes.length) {
        stop();
      } else {
        setIndex(index + 1);
      }
    }, duration);
    return () => {
      audio.pause();
      audio.currentTime = 0;
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, index, current?.pitch, currentLesson.type]);

  useEffect(() => () => stop(), []);

  const handleMarkComplete = (lessonId: number) => {
    setCompletedLessons(prev => ({ ...prev, [lessonId]: true }));
    const currentIdx = mockLessons.findIndex(l => l.id === lessonId);
    if (currentIdx < mockLessons.length - 1) {
      setActiveLessonId(mockLessons[currentIdx + 1].id);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'Video':
        return <Video size={16} />;
      case 'Theory':
        return <BookOpen size={16} />;
      case 'Practical':
        return <Music size={16} />;
      case 'Quiz':
        return <HelpCircle size={16} />;
      default:
        return <BookOpen size={16} />;
    }
  };

  return (
    <main className="page lesson-page">
      <button className="text-button" onClick={onBack}>
        <ChevronLeft size={18} /> Quay lại khóa học
      </button>

      <div className="lesson-header">
        <div>
          <div className="section-kicker">
            Khóa học Sáo Trúc · Bài {mockLessons.findIndex(l => l.id === currentLesson.id) + 1}
          </div>
          <h1>{currentLesson.title}</h1>
          <p>
            {currentLesson.type === 'Practical' && 'Nghe từng nốt, quan sát thế bấm và thử chơi lại trên cây sáo của bạn.'}
            {currentLesson.type === 'Video' && 'Theo dõi video hướng dẫn từng bước của giảng viên.'}
            {currentLesson.type === 'Theory' && 'Đọc kỹ lý thuyết và nắm vững nguyên lý cơ bản.'}
            {currentLesson.type === 'Quiz' && 'Hoàn thành các câu hỏi để kiểm tra lại kiến thức đã học.'}
          </p>
        </div>
        <span className="lesson-badge">
          {getLessonIcon(currentLesson.type)}
          {currentLesson.type} · {currentLesson.duration}
        </span>
      </div>

      <div className="lesson-grid">
        <section className="lesson-main-content">
          {/* Practical Sheet Music Mode */}
          {currentLesson.type === 'Practical' && (
            <div className="practice-card">
              <div className="practice-top">
                <span>Web Sheet Engine · {bambooFluteScore.metadata.tempo} BPM</span>
                <strong>{index + 1} / {bambooFluteScore.notes.length}</strong>
              </div>
              <div className="real-sheet">
                <WebSheetMusic score={bambooFluteScore} currentIndex={index} />
              </div>
              <div className="target-note">
                <small>Nốt hiện tại</small>
                <strong>{current.pitch}</strong>
                <span>Giữ hơi đều, ngón tay bịt kín lỗ sáo</span>
              </div>
              <div className="practice-controls">
                <button className="icon-button" onClick={() => setIndex(Math.max(0, index - 1))}>‹</button>
                <button className="play-large" onClick={playing ? stop : play}>
                  {playing ? <Pause /> : <Play />}
                </button>
                <button className="icon-button" onClick={() => setIndex(Math.min(bambooFluteScore.notes.length - 1, index + 1))}>›</button>
                <button className="icon-button" onClick={() => { stop(); setIndex(0); }}>
                  <RotateCcw size={16} />
                </button>
              </div>
              <div className="lesson-progress">
                <i style={{ width: `${(index / (bambooFluteScore.notes.length - 1)) * 100}%` }} />
              </div>
              <div className="complete-action">
                <button
                  className="primary"
                  onClick={() => handleMarkComplete(currentLesson.id)}
                >
                  <Check size={16} /> Đánh dấu hoàn thành bài học
                </button>
              </div>
            </div>
          )}

          {/* Video Lesson Mode */}
          {currentLesson.type === 'Video' && (
            <div className="video-lesson-card">
              <div className="video-wrapper">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title={currentLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="lesson-text-body">
                <h3>Tóm tắt nội dung bài học</h3>
                <p>{currentLesson.content}</p>
              </div>
              <div className="complete-action">
                <button
                  className="primary"
                  onClick={() => handleMarkComplete(currentLesson.id)}
                >
                  <Check size={16} /> Đánh dấu hoàn thành bài học
                </button>
              </div>
            </div>
          )}

          {/* Theory Lesson Mode */}
          {currentLesson.type === 'Theory' && (
            <div className="theory-lesson-card">
              <div className="theory-header-banner">
                <BookOpen size={32} />
                <div>
                  <h2>{currentLesson.title}</h2>
                  <span>Thời lượng đọc: {currentLesson.duration}</span>
                </div>
              </div>
              <div className="lesson-text-body">
                <h3>1. Tổng quan kiến thức</h3>
                <p>{currentLesson.content}</p>
                
                <h3>2. Kỹ thuật mấu chốt</h3>
                <ul>
                  <li><strong>Tư thế chuẩn:</strong> Thả lỏng toàn bộ ngón tay, giữ thẳng lưng.</li>
                  <li><strong>Cột hơi:</strong> Lấy hơi từ cơ hoành, nhả hơi êm và ổn định.</li>
                  <li><strong>Âm chuẩn:</strong> Lắng nghe tai để điều chỉnh thế môi phù hợp với từng nốt.</li>
                </ul>
              </div>
              <div className="complete-action">
                <button
                  className="primary"
                  onClick={() => handleMarkComplete(currentLesson.id)}
                >
                  <Check size={16} /> Đánh dấu hoàn thành bài học
                </button>
              </div>
            </div>
          )}

          {/* Quiz Mode */}
          {currentLesson.type === 'Quiz' && (
            <QuizPlayer
              quizData={mockQuizData}
              onComplete={(_score, _passed) => {
                handleMarkComplete(currentLesson.id);
              }}
            />
          )}
        </section>

        {/* Sidebar Lesson List */}
        <aside className="lesson-sidebar">
          <div className="section-kicker">Nội dung khóa học</div>
          <h2>Nhập môn Sáo Trúc</h2>
          <div className="sidebar-lesson-list">
            {mockLessons.map(lesson => {
              const isCurrent = lesson.id === currentLesson.id;
              const isDone = completedLessons[lesson.id];
              return (
                <div
                  key={lesson.id}
                  className={`lesson-item ${isCurrent ? 'current' : ''} ${isDone ? 'done' : ''}`}
                  onClick={() => {
                    stop();
                    setActiveLessonId(lesson.id);
                  }}
                >
                  <span className="lesson-number-icon">
                    {isDone ? <Check size={14} /> : getLessonIcon(lesson.type)}
                  </span>
                  <div>
                    <strong>{lesson.title}</strong>
                    <small>{lesson.type} · {lesson.duration}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </main>
  );
}
