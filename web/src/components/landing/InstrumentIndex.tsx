import { useState } from 'react';
import { ArrowUpRight, Plus, Minus } from 'lucide-react';
import { catalogue, InstrumentArt } from './instruments';

export function InstrumentIndex({ playNote }: { playNote: (id: string, note: string) => void }) {
  const [active, setActive] = useState(catalogue[0].id);
  const [expanded, setExpanded] = useState<string | null>(null);
  const notes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'];
  const select = (id: string, index: number) => { setActive(id); playNote(id, notes[index % notes.length]); };
  return <section className="lp-index lp-wrap" id="nhac-cu" aria-labelledby="lp-index-title">
    <div className="lp-section-heading"><p className="lp-label">01 / Mục lục thanh âm</p><h2 id="lp-index-title">Một di sản.<br /><i>Nhiều tiếng nói.</i></h2><p>Mỗi nhạc cụ là một bản độc tấu riêng.<br />Tìm thanh âm khiến bạn muốn thử.</p></div>
    <div className="lp-index-layout">
      <div className="lp-index-preview" aria-hidden="true"><div className="lp-orbit" />{catalogue.map(item => <div key={item.id} className={`lp-preview-item ${active === item.id ? 'is-active' : ''}`}><InstrumentArt id={item.id} /><span>{item.latinName}</span></div>)}<span className="lp-label lp-preview-note">Chạm tên nhạc cụ để khám phá</span></div>
      <ol className="lp-index-list">
        {catalogue.map((item, index) => <li key={item.id} className={active === item.id ? 'is-active' : ''} onPointerEnter={event => { if (event.pointerType === 'mouse') select(item.id, index); }}>
          <div className="lp-index-row"><span className="lp-index-number">{String(index + 1).padStart(2, '0')}</span><a href={`/explore/${item.id}`} onFocus={() => select(item.id, index)}><h3>{item.name}</h3><span>{item.tone}</span></a><button className="lp-index-expand" aria-label={`${expanded === item.id ? 'Thu gọn' : 'Xem'} ${item.name}`} aria-expanded={expanded === item.id} aria-controls={`index-${item.id}`} onClick={() => { setExpanded(expanded === item.id ? null : item.id); select(item.id, index); }}>{expanded === item.id ? <Minus size={18} /> : <Plus size={18} />}</button><ArrowUpRight className="lp-row-arrow" size={22} aria-hidden="true" /></div>
          <div className="lp-index-detail" id={`index-${item.id}`} hidden={expanded !== item.id}><InstrumentArt id={item.id} /><p>{item.description}</p><a className="lp-link" href={`/learn/${item.id}`}>Bắt đầu học <ArrowUpRight size={16} /></a></div>
        </li>)}
      </ol>
    </div>
    <p className="lp-index-footnote">{String(catalogue.length).padStart(2, '0')} nhạc cụ trong bộ sưu tập <span>Âm thanh trải nghiệm được tổng hợp, không phải bản thu nhạc cụ.</span></p>
  </section>;
}
