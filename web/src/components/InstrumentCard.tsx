import { ArrowUpRight, Volume2 } from 'lucide-react';
import type { Instrument } from '../data/mock';

export function InstrumentCard({ instrument, onSelect }: { instrument: Instrument; onSelect: (instrument: Instrument) => void }) {
  return <button className="instrument-card" style={{ '--instrument-accent': instrument.accent } as React.CSSProperties} onClick={() => onSelect(instrument)}>
    <div className="instrument-art"><img className={instrument.transparentImage ? 'transparent-instrument' : ''} src={instrument.transparentImage ?? instrument.image} alt="" /><span>{instrument.symbol}</span></div>
    <div className="instrument-card-copy"><small>{instrument.origin}</small><h3>{instrument.name}</h3><p>{instrument.tone}</p></div>
    <span className="card-arrow"><ArrowUpRight size={18} /></span><span className="sound-chip"><Volume2 size={14} /> nghe mẫu</span>
  </button>;
}
