import { ArrowUpRight } from 'lucide-react';
import { catalogue, chapters, InstrumentArt } from './instruments';

export function InstrumentChapter({ chapter, index }: { chapter: typeof chapters[number]; index: number }) {
  const item = catalogue.find(instrument => instrument.id === chapter.id)!;
  return <section id={`chuong-${item.id}`} className={`lp-chapter lp-chapter-${item.id}`} aria-labelledby={`title-${item.id}`}>
    <div className="lp-chapter-inner lp-wrap">
      <div className="lp-chapter-meta"><span className="lp-label">Chương {String(index + 1).padStart(2, '0')} / {item.name}</span><span className="lp-label">{item.family} · {item.materials}</span></div>
      <span className="lp-chapter-number" aria-hidden="true">0{index + 1}</span>
      <div className="lp-chapter-art"><div className="lp-chapter-ring" /><InstrumentArt id={item.id} /><span className="lp-vertical-label">{item.latinName}</span></div>
      <div className="lp-chapter-copy"><p className="lp-label">{chapter.tone}</p><h3 id={`title-${item.id}`}>{chapter.title.map(line => <span className="lp-chapter-line" key={line}>{line}</span>)}</h3><p>{item.description}</p><div className="lp-actions"><a className="lp-button" href={`/learn/${item.id}`}>Bắt đầu học <ArrowUpRight size={18} /></a><a className="lp-link" href={`/explore/${item.id}`}>Câu chuyện nhạc cụ <ArrowUpRight size={16} /></a></div></div>
      <div className="lp-chapter-progress" aria-label="Vị trí trong bộ sưu tập">{catalogue.map(instrument => <a key={instrument.id} href={chapters.some(c => c.id === instrument.id) ? `#chuong-${instrument.id}` : `/explore/${instrument.id}`} aria-label={instrument.name} aria-current={instrument.id === item.id ? 'step' : undefined}><span /></a>)}</div>
      <p className="lp-chapter-bottom">Mỗi nhạc cụ, một khởi đầu <span>VRHYTHM / {String(index + 1).padStart(2, '0')}</span></p>
    </div>
  </section>;
}
