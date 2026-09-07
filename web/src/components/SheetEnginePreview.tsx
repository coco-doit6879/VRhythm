import { Pause, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { WebSheetMusic } from './WebSheetMusic';

export function SheetEnginePreview() {
  const [playing, setPlaying] = useState(false);
  return <section className="sheet-panel">
    <div className="sheet-heading"><div><span className="eyebrow">Web Sheet Engine</span><h3>Ly ca xanh</h3></div><span className="tempo">♩ = 82</span></div>
    <div className="sheet-canvas"><WebSheetMusic score={{ metadata: { tempo: 82, timeSignature: { beats: 4, beatType: 4 } }, notes: ['C5', 'D5', 'E5', 'G5', 'A5', 'G5', 'E5', 'C5'].map((pitch, index) => ({ id: `n${index}`, pitch, duration: index === 7 ? 'h' : 'q' })) }} currentIndex={playing ? 2 : -1} /></div>
    <div className="sheet-controls"><button className="icon-button" onClick={() => setPlaying(!playing)}>{playing ? <Pause size={17} /> : <Play size={17} />}</button><button className="icon-button" onClick={() => setPlaying(false)}><RotateCcw size={16} /></button><span>{playing ? 'Đang phát mẫu' : 'Sẵn sàng luyện tập'}</span><div className="sheet-progress"><i style={{ width: playing ? '48%' : '0%' }} /></div></div>
  </section>;
}
