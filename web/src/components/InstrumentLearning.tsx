import { useEffect, useState } from 'react';
import type { Instrument } from '../data/mock';
import { api, type AuthResponse, type CourseDetail } from '../services/api';

export function InstrumentLearning({ instrument, user, onAuth, onLesson }: { instrument: Instrument; user: AuthResponse | null; onAuth: () => void; onLesson: (route: { courseId: number; chapterId: number; lessonId: number }) => void }) {
  const [courses, setCourses] = useState<CourseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<number | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setCourses([]);
    const normalize = (name: string) => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase().trim();
    api.getCourses().then(list => Promise.all(list.filter(course => normalize(course.instrument) === normalize(instrument.name)).map(course => api.getCourse(course.id))))
      .then(result => { if (active) setCourses(result); })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Không thể tải khóa học.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [instrument.id, user?.token, revision]);

  const enroll = async (course: CourseDetail) => {
    if (!user) { onAuth(); return; }
    setBusy(course.id); setError('');
    try {
      await api.enroll(course.id, course.accessType);
      const updated = await api.getCourse(course.id);
      setCourses(current => current.map(item => item.id === updated.id ? updated : item));
    } catch (err) { setError(err instanceof Error ? err.message : 'Đăng ký chưa thành công. Vui lòng thử lại.'); }
    finally { setBusy(null); }
  };

  return <main className="page instrument-learning">
    <a className="text-button" href="/learn">← Danh mục học tập</a>
    <section className="instrument-page-hero"><div><span className="section-kicker">Từ tìm hiểu đến thực hành</span><h1>Học {instrument.name.toLocaleLowerCase('vi')}</h1><p>Khám phá nội dung và lộ trình từng khóa học trước khi đăng ký. Chọn khóa phù hợp để bắt đầu hành trình cùng {instrument.name.toLocaleLowerCase('vi')}.</p><a href={`/explore/${instrument.id}`} className="text-button">Tìm hiểu văn hóa của nhạc cụ →</a></div><img src={instrument.transparentImage ?? instrument.image} alt={instrument.name} /></section>
    {loading && <p role="status">Đang tải nội dung khóa học…</p>}
    {error && <div role="alert" className="course-state error">{error} <button className="text-button" onClick={() => setRevision(value => value + 1)}>Thử lại</button></div>}
    {!loading && !error && courses.length === 0 && <div className="course-state"><h2>Chưa có khóa học đang mở</h2><p>Các khóa học {instrument.name.toLocaleLowerCase('vi')} sẽ xuất hiện tại đây khi được phát hành.</p><a href="/learn" className="text-button">Xem những khóa học khác →</a></div>}
    {courses.map(course => {
      const chapters = [...course.chapters].sort((a, b) => a.sortOrder - b.sortOrder);
      const lessons = chapters.flatMap(chapter => [...chapter.lessons].sort((a, b) => a.sortOrder - b.sortOrder).map(lesson => ({ ...lesson, chapterId: chapter.id })));
      const next = lessons.find(lesson => !lesson.isCompleted) ?? lessons[0];
      return <section className="course-overview" key={course.id}>
        <header><span className="section-kicker">{course.accessType === 'Free' ? 'Miễn phí' : 'Khóa học cần mở khóa'} · {chapters.length} chương · {lessons.length} bài</span><h2>{course.title}</h2><p>{course.description}</p></header>
        <h3>Bạn sẽ học những gì?</h3><ul className="course-topics">{chapters.map(chapter => <li key={chapter.id}>{chapter.title}</li>)}</ul>
        <h3>Lộ trình học</h3>
        {chapters.length === 0 && <p>Nội dung chi tiết đang được cập nhật.</p>}
        <div className="course-roadmap">{chapters.map((chapter, index) => <details key={chapter.id} open={index === 0}><summary><span>Chương {index + 1} · {chapter.title}</span><small>{chapter.lessons.length} bài</small></summary><ol>{[...chapter.lessons].sort((a,b) => a.sortOrder - b.sortOrder).map(lesson => <li key={lesson.id}><span>{lesson.title}</span><small>{{ Theory: 'Lý thuyết', Video: 'Video', Quiz: 'Trắc nghiệm', Practical: 'Thực hành' }[lesson.type] ?? lesson.type}{lesson.durationSeconds ? ` · ${Math.ceil(lesson.durationSeconds / 60)} phút` : ''}</small></li>)}</ol></details>)}</div>
        <footer className="course-enrollment">{course.isEnrolled && course.isUnlocked ? <><p role="status">{course.isCompleted ? 'Bạn đã hoàn thành khóa học này.' : 'Bạn đã đăng ký khóa học này.'}</p><button className="primary" disabled={!next} onClick={() => next && onLesson({ courseId: course.id, chapterId: next.chapterId, lessonId: next.id })}>{course.isCompleted ? 'Xem lại bài học' : 'Vào học'}</button></> : <><p>Đọc lộ trình phía trên và đăng ký khi bạn sẵn sàng.</p><button className="primary" disabled={busy !== null || lessons.length === 0} onClick={() => void enroll(course)}>{busy === course.id ? 'Đang đăng ký…' : !user ? 'Đăng nhập để đăng ký học' : course.accessType === 'Free' ? 'Đăng ký học miễn phí' : 'Mở khóa khóa học'}</button></>}</footer>
      </section>;
    })}
  </main>;
}
