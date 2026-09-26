import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import type { Instrument } from '../data/mock';
import { api, courseErrorMessage, type AuthResponse, type CourseDetail } from '../services/api';

function refineCourseTitle(title: string): string {
  return title.replace(/:\s*Từ Cơ Bản Đến Bèo Dạt Mây Trôi/gi, '').trim();
}

function refineCourseDescription(desc: string): string {
  if (/bèo dạt mây trôi/i.test(desc) && /người mới bắt đầu/i.test(desc)) {
    return 'Lộ trình học sáo trúc bài bản và dễ tiếp cận, đưa bạn từ những nốt nhạc đầu tiên đến khi tự tin chinh phục giai điệu dân ca kinh điển Bèo Dạt Mây Trôi.';
  }
  return desc;
}

function refineChapterTitle(title: string): string {
  if (/Làm quen nốt nhạc/i.test(title)) {
    return 'Làm quen nốt nhạc (Đô, Rê, Mi, Fa, Sol, La, Si)';
  }
  if (/Kỹ thuật trang trí/i.test(title)) {
    return 'Kỹ thuật rung hơi và luyến ngón';
  }
  if (/Chinh phục Bèo Dạt Mây Trôi/i.test(title)) {
    return 'Chinh phục giai điệu dân ca kinh điển Bèo Dạt Mây Trôi';
  }
  return title;
}

function refineCourse(course: CourseDetail): CourseDetail {
  return {
    ...course,
    title: refineCourseTitle(course.title),
    description: refineCourseDescription(course.description),
    chapters: course.chapters.map(chapter => ({
      ...chapter,
      title: refineChapterTitle(chapter.title),
    })),
  };
}

export function InstrumentLearning({ instrument, user, onAuth, onLesson }: { instrument: Instrument; user: AuthResponse | null; onAuth: () => void; onLesson: (route: { courseId: number; chapterId: number; lessonId: number }) => void }) {
  const [courses, setCourses] = useState<CourseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<number | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true); setError(''); setCourses([]);
    const normalize = (name: string) => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase().trim();
    api.getCourses(controller.signal).then(list => Promise.all(list.filter(course => normalize(course.instrument) === normalize(instrument.name)).map(course => api.getCourse(course.id, controller.signal))))
      .then(result => { if (active) setCourses(result.map(refineCourse)); })
      .catch(err => { if (active) setError(courseErrorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [instrument.id, user?.token, revision]);

  const enroll = async (course: CourseDetail) => {
    if (!user) { onAuth(); return; }
    setBusy(course.id); setError('');
    try {
      await api.enroll(course.id, course.accessType);
      const updated = await api.getCourse(course.id);
      setCourses(current => current.map(item => item.id === updated.id ? refineCourse(updated) : item));
    } catch (err) { setError(courseErrorMessage(err)); }
    finally { setBusy(null); }
  };

  return <main className="page instrument-learning">
    <a className="text-button" href="/learn"><ArrowLeft size={18} /> Danh mục học tập</a>
    <section className="instrument-page-hero"><div><span className="section-kicker"><Sparkles size={14} /> Từ tìm hiểu đến thực hành</span><h1>Học {instrument.name.toLocaleLowerCase('vi')}</h1><p>Khám phá nội dung và lộ trình từng khóa học trước khi đăng ký. Chọn khóa phù hợp để bắt đầu hành trình cùng {instrument.name.toLocaleLowerCase('vi')}.</p><a href={`/explore/${instrument.id}`} className="primary hero-explore-btn">Tìm hiểu văn hóa nhạc cụ <ArrowRight size={18} /></a></div><img src={`/images/generated/carousel-${instrument.id}.webp`} alt={`${instrument.name} — minh họa`} /></section>
    {loading && <p role="status">Đang tải nội dung khóa học…</p>}
    {error && <div role="alert" className="course-state error">{error} <button className="text-button" onClick={() => setRevision(value => value + 1)}>Thử lại</button></div>}
    {!loading && !error && courses.length === 0 && <div className="course-state"><h2>Chưa có khóa học đang mở</h2><p>Các khóa học {instrument.name.toLocaleLowerCase('vi')} sẽ xuất hiện tại đây khi được phát hành.</p><a href="/learn" className="text-button">Xem những khóa học khác →</a></div>}
    {courses.map(course => {
      const chapters = [...course.chapters].sort((a, b) => a.sortOrder - b.sortOrder);
      const lessons = chapters.flatMap(chapter => [...chapter.lessons].sort((a, b) => a.sortOrder - b.sortOrder).map(lesson => ({ ...lesson, chapterId: chapter.id })));
      const next = lessons.find(lesson => !lesson.isCompleted) ?? lessons[0];
      return <section className="course-overview" key={course.id}>
        <header><span className="section-kicker"><Sparkles size={14} /> {course.accessType === 'Free' ? 'Miễn phí' : 'Khóa học cần mở khóa'} · {chapters.length} chương · {lessons.length} bài</span><h2>{course.title}</h2><p>{course.description}</p></header>
        <h3>Bạn sẽ học những gì?</h3><ul className="course-topics">{chapters.map(chapter => <li key={chapter.id}>{chapter.title}</li>)}</ul>
        <h3>Lộ trình học</h3>
        {chapters.length === 0 && <p>Nội dung chi tiết đang được cập nhật.</p>}
        <div className="course-roadmap">{chapters.map((chapter, index) => <details key={chapter.id} open={index === 0}><summary><span>Chương {index + 1} · {chapter.title}</span><small>{chapter.lessons.length} bài</small></summary><ol>{[...chapter.lessons].sort((a,b) => a.sortOrder - b.sortOrder).map(lesson => <li key={lesson.id}><span>{lesson.title}</span><small>{{ Theory: 'Lý thuyết', Video: 'Video', Quiz: 'Trắc nghiệm', Practical: 'Thực hành' }[lesson.type] ?? lesson.type}{lesson.durationSeconds ? ` · ${Math.ceil(lesson.durationSeconds / 60)} phút` : ''}</small></li>)}</ol></details>)}</div>
        <footer className="course-enrollment">
          {lessons.length === 0 ? <>
            <p>Khóa học đang được bổ sung bài học. Bạn có thể xem các nhạc cụ khác trong lúc chờ.</p>
            <button className="primary" disabled>Nội dung đang cập nhật</button>
          </> : course.isEnrolled && course.isUnlocked ? <>
            <p role="status">{course.isCompleted ? 'Bạn đã hoàn thành khóa học này.' : 'Bạn đã đăng ký khóa học này.'}</p>
            <button className="primary" onClick={() => next && onLesson({ courseId: course.id, chapterId: next.chapterId, lessonId: next.id })}>{course.isCompleted ? 'Xem lại bài học' : 'Vào học'}</button>
          </> : <>
            <p>Đọc lộ trình phía trên và đăng ký khi bạn sẵn sàng.</p>
            <button className="primary" disabled={busy !== null} onClick={() => void enroll(course)}>{busy === course.id ? 'Đang đăng ký…' : !user ? 'Đăng nhập để đăng ký học' : course.accessType === 'Free' ? 'Đăng ký học miễn phí' : 'Mở khóa khóa học'}</button>
          </>}
        </footer>
      </section>;
    })}
  </main>;
}
