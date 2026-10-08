import { ArrowUpRight } from 'lucide-react';
import { catalogue, chapters, InstrumentArt } from './instruments';

export function InstrumentChapter({ chapter }: { chapter: typeof chapters[number] }) {
  const item = catalogue.find(instrument => instrument.id === chapter.id)!;
  return <section id={`chuong-${item.id}`} className={`lp-chapter lp-chapter-${item.id}`} aria-labelledby={`title-${item.id}`}>
    <div className="lp-chapter-inner lp-wrap">
      <div className="lp-chapter-art"><div className="lp-chapter-ring" aria-hidden="true" /><InstrumentArt id={item.id} /></div>
      <div className="lp-chapter-copy"><p className="lp-label">{item.name}</p><h3 id={`title-${item.id}`}>{chapter.title.map(line => <span className="lp-chapter-line" key={line}>{line}</span>)}</h3><p>{item.description.replace(/\.$/, '')}</p><div className="lp-actions"><a className="lp-button" href={`/learn/${item.id}`}>Bắt đầu học <ArrowUpRight size={18} /></a><a className="lp-link" href={`/explore/${item.id}`}>Câu chuyện nhạc cụ <ArrowUpRight size={16} /></a></div></div>
    </div>
  </section>;
}
