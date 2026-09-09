import { ArrowUpRight, BookOpenText } from 'lucide-react';
import type { Instrument } from '../data/mock';

export function InstrumentCard({ instrument, onSelect }: { instrument: Instrument; onSelect: (instrument: Instrument) => void }) {
  return <button className="instrument-card" style={{ '--instrument-accent': instrument.accent } as React.CSSProperties} onClick={() => onSelect(instrument)} aria-label={`Mở hồ sơ văn hóa ${instrument.name}`}>
    <div className="instrument-art"><img className={instrument.transparentImage ? 'transparent-instrument' : ''} src={instrument.transparentImage ?? instrument.image} alt="" /><span>{instrument.symbol}</span></div>
    <div className="instrument-card-copy"><small>{instrument.family} · {instrument.origin}</small><h3>{instrument.name}</h3><p>{instrument.description}</p><span className="profile-link"><BookOpenText size={14} /> Xem hồ sơ văn hóa</span></div>
    <span className="card-arrow"><ArrowUpRight size={18} /></span>
  </button>;
}
