import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { instruments } from '../data/mock';
import { useScrollReveal } from './useScrollReveal';

export function ExplorePage() {
  const root = useScrollReveal('.ex-guide > div, .ex-archive-heading, .ex-card, .ex-closing');
  return <main className="ex-page" ref={root}>
    <section className="ex-intro" aria-labelledby="ex-title">

      <div className="ex-intro-grid"><h1 id="ex-title">Mỗi nhạc cụ,<br /><em>một câu chuyện<br />văn hóa</em></h1><div className="ex-intro-aside"><p>Khám phá nguồn gốc, cấu tạo và những không gian diễn xướng đã nuôi dưỡng thanh âm Việt qua nhiều thế hệ</p><a href="#thu-vien">Mở bộ sưu tập <ArrowDown size={17} /></a></div></div>
    </section>
    <section className="ex-archive" id="thu-vien" aria-labelledby="ex-archive-title">
      <div className="ex-archive-heading"><div><p className="ex-label">Bộ sưu tập thanh âm</p><h2 id="ex-archive-title">Tìm một tiếng đàn<br /><em>Đọc một miền di sản</em></h2></div></div>
      <p className="ex-results">{instruments.length} nhạc cụ trong bộ sưu tập</p>
      <div className="ex-grid">{instruments.map(item => <article className={`ex-card ex-card-${item.id}`} key={item.id}>
        <a className="ex-card-link" href={`/explore/${item.id}`} aria-label={`Đọc câu chuyện ${item.name}`}>
          <div className="ex-art"><span className="ex-card-family">{item.family}</span><img src={item.transparentImage || item.image} alt={item.name} width={['bau', 'tranh'].includes(item.id) ? 1536 : 1024} height={['bau', 'tranh'].includes(item.id) ? 1024 : 1536} loading="lazy" /></div>
          <div className="ex-card-copy"><h3>{item.name}<ArrowUpRight size={26} aria-hidden="true" /></h3><p className="ex-description">{item.description.replace(/\.$/, '')}</p><div className="ex-card-bottom"><span>Đọc câu chuyện <ArrowUpRight size={16} /></span></div></div>
        </a>
      </article>)}</div>
    </section>
    <section className="ex-closing"><h2>Thanh âm bạn yêu,<br /><em>có thể bắt đầu từ đôi tay bạn</em></h2><a href="/learn">Chọn nhạc cụ để học <ArrowUpRight size={18} /></a></section>
    <footer className="ex-footer"><a href="/">VRhythm</a><span>Di sản · Nhịp điệu · Công nghệ</span><a href="#ex-title">Về đầu trang ↑</a></footer>
  </main>;
}
