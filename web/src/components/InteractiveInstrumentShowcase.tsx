import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { instruments, type Instrument } from '../data/mock';

type Point = { x: number; y: number };

export function InteractiveInstrumentShowcase({ onSelect }: { onSelect: (instrument: Instrument) => void }) {
  const [selected, setSelected] = useState<Instrument>(instruments[3]);
  const [rotation, setRotation] = useState<Point>({ x: 0, y: 0 });
  const [direction, setDirection] = useState(1);
  const [changing, setChanging] = useState(false);
  const changeTimer = useRef<number | null>(null);

  const choose = (instrument: Instrument, nextDirection = 1) => {
    if (instrument.id === selected.id) return;
    setDirection(nextDirection);
    setRotation({ x: 0, y: 0 });
    setChanging(true);
    setSelected(instrument);
    if (changeTimer.current) window.clearTimeout(changeTimer.current);
    changeTimer.current = window.setTimeout(() => setChanging(false), 560);
  };

  const moveSelection = (step: number) => {
    const index = instruments.findIndex(instrument => instrument.id === selected.id);
    choose(instruments[(index + step + instruments.length) % instruments.length], step);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      const target = event.target as HTMLElement;
      if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      event.preventDefault();
      moveSelection(event.key === 'ArrowRight' ? 1 : -1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); if (changeTimer.current) window.clearTimeout(changeTimer.current); };
  }, [selected.id]);

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => { const box = event.currentTarget.getBoundingClientRect(); setRotation({ x: ((event.clientY - box.top) / box.height * 2 - 1) * -7, y: ((event.clientX - box.left) / box.width * 2 - 1) * 9 }); };

  return <section className="instrument-showcase" aria-label="Khám phá nhạc cụ tương tác"><button className="showcase-arrow showcase-arrow-left" aria-label="Nhạc cụ trước" onClick={() => moveSelection(-1)}><ArrowLeft size={20} /></button><div className="showcase-copy"><div className="section-kicker">02 · Gặp gỡ nhạc cụ</div><h2>{selected.name}</h2><p className="showcase-tone">{selected.tone}</p><p>{selected.description}</p><button className="text-button" onClick={() => onSelect(selected)}>Mở trải nghiệm <ArrowRight size={16} /></button></div><div className="showcase-stage" onPointerMove={handleMove} onPointerLeave={() => setRotation({ x: 0, y: 0 })}><img className={changing ? `showcase-image transparent changing direction-${direction}` : 'showcase-image transparent'} src={selected.transparentImage ?? selected.image} alt={selected.name} style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(35px)` }} /></div><div className="showcase-side"><div className="section-kicker">Câu chuyện nhạc cụ</div><p className="showcase-history">{selected.history}</p><div className="fact-column">{selected.facts.map((fact, index) => <span key={fact}><b>0{index + 1}</b>{fact}</span>)}</div></div><button className="showcase-arrow showcase-arrow-right" aria-label="Nhạc cụ tiếp theo" onClick={() => moveSelection(1)}><ArrowRight size={20} /></button></section>;
}
