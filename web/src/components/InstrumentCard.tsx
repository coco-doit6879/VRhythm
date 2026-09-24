import { ArrowUpRight, BookOpenText } from 'lucide-react';
import type { Instrument } from '../data/mock';

export function InstrumentCard({ instrument, onSelect }: { instrument: Instrument; onSelect: (instrument: Instrument) => void }) {
  const editorial: Record<string, string> = { sao: 'sao-truc', nguyet: 'dan-nguyet', tranh: 'dan-tranh' };
  const generated = editorial[instrument.id];
  return <button className="instrument-card" style={{ '--instrument-accent': instrument.accent } as React.CSSProperties} onClick={() => onSelect(instrument)} aria-label={`Mở hồ sơ văn hóa ${instrument.name}`}>
    <div className={`instrument-art${generated ? ' editorial-art' : ''}`}><img className={!generated && instrument.transparentImage ? 'transparent-instrument' : ''} src={generated ? `/images/generated/${generated}-editorial.png` : instrument.transparentImage ?? instrument.image} alt="" loading="lazy" />{generated ? <small className="editorial-credit">Ảnh minh họa</small> : <span>{instrument.symbol}</span>}</div>
    <div className="instrument-card-copy"><small>{instrument.family} · {instrument.origin}</small><h3>{instrument.name}</h3><p>{instrument.description}</p><span className="profile-link"><BookOpenText size={14} /> Xem hồ sơ văn hóa</span></div>
    <span className="card-arrow"><ArrowUpRight size={18} /></span>
  </button>;
}
