import { ArrowRight, Check, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { api, courseErrorMessage, type CourseDetail, type LessonDetail, type PracticalDetail, type QuizDetail } from '../services/api';
import { PracticalLesson } from './PracticalLesson';
import { VideoLesson } from './VideoLesson';
import './lesson-player.css';

type LessonRoute = { courseId: number; chapterId: number; lessonId: number };
type Loaded = { course: CourseDetail; lesson: LessonDetail; quiz?: QuizDetail; practical?: PracticalDetail; videoUrl?: string };
const labels: Record<string, string> = { Theory: 'Lý thuyết', Video: 'Video', Quiz: 'Trắc nghiệm', Practical: 'Thực hành' };

export function LessonPlayer(props: { route: LessonRoute; onBack: () => void; onOpenLesson: (route: LessonRoute) => void }) {
  return <LessonSession key={`${props.route.courseId}-${props.route.chapterId}-${props.route.lessonId}`} {...props} />;
}

function LessonSession({ route, onBack, onOpenLesson }: { route: LessonRoute; onBack: () => void; onOpenLesson: (route: LessonRoute) => void }) {
  const [data, setData] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ passed: boolean; scorePercentage: number } | null>(null);
  const [completed, setCompleted] = useState(false);
  const submitting = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoadError(''); setData(null);
    void (async () => {
      try {
        const course = await api.getCourse(route.courseId, controller.signal);
        const summary = course.chapters.find(c => c.id === route.chapterId)?.lessons.find(l => l.id === route.lessonId);
        if (!summary) { setLoadError('Bài học không thuộc khóa học này. Hãy quay lại và chọn từ lộ trình.'); return; }
        if (!course.isEnrolled || !course.isUnlocked) { setLoadError('Bạn cần đăng nhập và đăng ký hoặc mở khóa học trước khi vào bài.'); return; }
        let loaded: Loaded;
        if (summary.type === 'Quiz') loaded = { course, lesson: summary, quiz: await api.getQuiz(summary.id, controller.signal) };
        else if (summary.type === 'Practical') loaded = { course, lesson: summary, practical: await api.getPractical(summary.id, controller.signal) };
        else {
          const lesson = await api.getLesson(summary.id, controller.signal);
          loaded = { course, lesson };
          if (summary.type === 'Video') {
            try { loaded.videoUrl = await api.getVideoUrl(course.id, summary.id, controller.signal); }
            catch { loaded.videoUrl = undefined; }
          }
        }
        if (!controller.signal.aborted) { setData(loaded); setCompleted(summary.isCompleted); }
      } catch (e) { if (!controller.signal.aborted) setLoadError(courseErrorMessage(e)); }
    })();
    return () => controller.abort();
  }, [route.courseId, route.chapterId, route.lessonId, retry]);

  const submit = async (action: () => Promise<{ passed: boolean; scorePercentage: number } | void>) => {
    if (submitting.current) return;
    submitting.current = true; setBusy(true); setError(''); setResult(null);
    try {
      const grade = await action();
      if (!mounted.current) return;
      if (grade) setResult(grade);
      if (!grade || grade.passed) {
        setCompleted(true);
        setData(previous => previous && ({ ...previous, course: { ...previous.course, chapters: previous.course.chapters.map(c => ({ ...c, lessons: c.lessons.map(l => l.id === route.lessonId ? { ...l, isCompleted: true } : l) })) } }));
        try { await api.recalculateCourseCompletion(route.courseId); }
        catch { if (mounted.current) setError('Bài học đã lưu. Tổng tiến độ khóa học chưa cập nhật; hãy tải lại khóa học để kiểm tra.'); }
      }
    } catch (e) { if (mounted.current) setError(courseErrorMessage(e)); }
    finally { submitting.current = false; if (mounted.current) setBusy(false); }
  };

  const lessonOrder = data?.course.chapters
    .slice().sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap(chapter => chapter.lessons.slice().sort((a, b) => a.sortOrder - b.sortOrder)
      .map(lesson => ({ courseId: route.courseId, chapterId: chapter.id, lessonId: lesson.id, title: lesson.title })));
  const nextLesson = lessonOrder?.[(lessonOrder.findIndex(lesson => lesson.lessonId === route.lessonId)) + 1];

  return <main className="page lesson-page course-player">
    <button className="text-button" onClick={onBack}><ChevronLeft size={18} /> Quay lại khóa học</button>
    {!data && !loadError && <p role="status">Đang tải bài học…</p>}
    {loadError && <div role="alert" className="lesson-load-error"><p>{loadError}</p><button className="primary" onClick={() => setRetry(n => n + 1)}>Thử lại</button></div>}
    {data && <>
      <header className="lesson-header"><div><div className="section-kicker">{data.course.title} · {labels[data.lesson.type]}</div><h1>{data.lesson.title}</h1></div></header>
      <div className="lesson-grid"><section className="practice-card" aria-label="Nội dung bài học" aria-busy={busy}>
        {data.lesson.type === 'Theory' && <article className="lesson-content"><h2>Nội dung bài học</h2><div className="lesson-prose">{data.lesson.theory?.content || 'Nội dung đang được cập nhật.'}</div>{data.lesson.theory?.content && !completed && <button className="primary completion-button" disabled={busy} onClick={() => void submit(async () => { await api.completeTheory(route.lessonId); })}>{busy ? 'Đang lưu…' : 'Đánh dấu đã học'}</button>}</article>}
        {data.lesson.type === 'Video' && <VideoLesson url={data.videoUrl} content={data.lesson.video?.content} completed={completed} busy={busy} onComplete={(watched, total) => submit(async () => { await api.updateLessonProgress(route.courseId, route.lessonId, watched, total); })} onConfirmExternal={() => submit(async () => { await api.completeExternalVideo(route.courseId, route.lessonId); })} />}
        {data.quiz && <QuizLesson quiz={data.quiz} busy={busy} completed={completed} onSubmit={answers => submit(() => api.submitQuiz(route.lessonId, answers))} />}
        {data.practical && <PracticalLesson practical={data.practical} busy={busy} completed={completed} onSubmit={notes => submit(() => api.submitPractical(route.lessonId, notes))} />}
        {error && <p role="alert" className="lesson-feedback error">{error}</p>}
        {result && <p role="status" className="lesson-feedback">{result.passed ? 'Đạt' : 'Chưa đạt'} · {Math.round(result.scorePercentage)}%. {!result.passed && 'Bạn có thể luyện lại rồi nộp bài.'}</p>}
        {completed && <p className="completion-done"><CheckCircle2 size={18} /> Đã hoàn thành</p>}
        {completed && <div className="lesson-next-action">{nextLesson
          ? <button className="primary" onClick={() => onOpenLesson(nextLesson)}>Bài tiếp theo · {nextLesson.title} <ArrowRight size={18} aria-hidden="true" /></button>
          : <button className="primary" onClick={onBack}>Xem lại khóa học <ArrowRight size={18} aria-hidden="true" /></button>}
        </div>}
      </section><aside className="lesson-sidebar"><details><summary>Nội dung khóa học <span>{data.course.chapters.reduce((n, c) => n + c.lessons.length, 0)} bài</span></summary><div className="lesson-outline">{data.course.chapters.map(chapter => <section className="chapter-group" key={chapter.id}><h2>{chapter.title}</h2>{chapter.lessons.map((lesson, index) => <button aria-current={lesson.id === route.lessonId ? 'page' : undefined} className={`lesson-item ${lesson.id === route.lessonId ? 'current' : ''}`} key={lesson.id} onClick={() => onOpenLesson({ courseId: route.courseId, chapterId: chapter.id, lessonId: lesson.id })}><span>{lesson.isCompleted ? <Check size={14} /> : index + 1}</span><div><strong>{lesson.title}</strong><small>{labels[lesson.type]}{lesson.isCompleted ? ' · Đã hoàn thành' : ''}</small></div></button>)}</section>)}</div></details></aside></div>
    </>}
  </main>;
}

function QuizLesson({ quiz, busy, completed, onSubmit }: { quiz: QuizDetail; busy: boolean; completed: boolean; onSubmit: (answers: Array<{ questionId: number; selectedOptionId: number }>) => Promise<void> }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  if (!quiz.questions.length) return <p>Nội dung câu hỏi đang được cập nhật.</p>;
  return <article className="lesson-content"><h2>Kiểm tra kiến thức</h2><p>Chọn một đáp án cho mỗi câu. Kết quả được chấm và lưu trên máy chủ.</p>{quiz.questions.map((question, index) => <fieldset className="lesson-question" key={question.id} disabled={busy || completed}><legend>{index + 1}. {question.prompt}</legend>{question.options.map(option => <label className="lesson-answer" key={option.id}><input type="radio" name={`question-${question.id}`} checked={answers[question.id] === option.id} onChange={() => setAnswers(old => ({ ...old, [question.id]: option.id }))} />{option.text}</label>)}</fieldset>)}{!completed && <button className="primary" disabled={busy || quiz.questions.some(q => answers[q.id] == null)} onClick={() => void onSubmit(quiz.questions.map(q => ({ questionId: q.id, selectedOptionId: answers[q.id] })))}>{busy ? 'Đang chấm…' : 'Nộp bài'}</button>}</article>;
}
