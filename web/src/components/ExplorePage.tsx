import { ArrowUpRight } from 'lucide-react';
import { instruments } from '../data/mock';
import { useScrollReveal } from './useScrollReveal';

export function ExplorePage() {
  const root = useScrollReveal('.ex-card');
  return <main className="ex-page" ref={root}>
    <section className="ex-intro" aria-labelledby="ex-title">
      <h1 id="ex-title">Khám phá <em>nhạc cụ Việt Nam.</em></h1>
      <p>Tìm hiểu nguồn gốc, âm sắc và câu chuyện văn hóa của từng nhạc cụ.</p>
    </section>
    <section className="ex-archive" id="thu-vien" aria-labelledby="ex-archive-title">
      <div className="ex-archive-heading"><h2 id="ex-archive-title">Nhạc cụ truyền thống</h2></div>
      <div className="ex-grid">{instruments.map(item => <article className={`ex-card ex-card-${item.id}`} key={item.id}>
        <a className="ex-card-link" href={`/explore/${item.id}`} aria-label={`Đọc câu chuyện ${item.name}`}>
          <div className="ex-art"><span className="ex-card-family">{item.family}</span><img src={item.transparentImage || item.image} alt={item.name} width={['bau', 'tranh'].includes(item.id) ? 1536 : 1024} height={['bau', 'tranh'].includes(item.id) ? 1024 : 1536} loading="lazy" /></div>
          <div className="ex-card-copy"><h3>{item.name}<ArrowUpRight size={24} aria-hidden="true" /></h3><p className="ex-description">{item.description}</p><p className="ex-card-origin">{item.origin}</p></div>
        </a>
      </article>)}</div>
    </section>
    <footer className="ex-footer"><a href="/">VRhythm</a><a href="/learn">Chọn nhạc cụ để học <ArrowUpRight size={18} aria-hidden="true" /></a></footer>
  </main>;
}
