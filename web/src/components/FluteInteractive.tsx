import { Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const fingering: Record<string, number[]> = { C5: [1, 1, 1, 1, 1, 1], D5: [1, 1, 1, 1, 1, 0], E5: [1, 1, 1, 1, 0, 0], F5: [1, 1, 1, 0, 0, 0], G5: [1, 1, 0, 0, 0, 0], A5: [1, 0, 0, 0, 0, 0], B5: [0, 0, 0, 0, 0, 0] };
const hotspotPositions = [
  { left: '38%', top: '34%' },
  { left: '46%', top: '42%' },
  { left: '53%', top: '49%' },
  { left: '60%', top: '55%' },
  { left: '67%', top: '62%' },
  { left: '74%', top: '69%' },
];

export function FluteInteractive() {
  const [holes, setHoles] = useState(fingering.C5);
  const [note, setNote] = useState('C5');
  const activePitch = Object.entries(fingering).find(([, pattern]) => pattern.every((value, index) => value === holes[index]))?.[0];
  useEffect(() => { if (activePitch) setNote(activePitch); }, [activePitch]);
  const play = () => { if (!activePitch) return; const audio = new Audio(`/audio/${activePitch}.ogg`); audio.volume = .85; void audio.play(); };
  const toggle = (index: number) => setHoles(current => current.map((value, holeIndex) => holeIndex === index ? (value ? 0 : 1) : value));
  return <div className="flute-interactive"><div className="flute-visual"><img src="/images/Sao_Truc.jpg" alt="Sáo trúc Việt Nam" />{holes.map((value, index) => <button aria-label={`Lỗ bấm ${index + 1}`} className={value ? 'flute-hotspot closed' : 'flute-hotspot open'} style={hotspotPositions[index]} onClick={() => toggle(index)} key={index}>{index + 1}</button>)}</div><div className="flute-controls"><div><span className="section-kicker">Thế bấm hiện tại</span><strong>{activePitch ?? 'Thế bấm tự do'}</strong><small>{activePitch ? 'Đã nhận diện · sẵn sàng phát âm' : 'Hãy thử một thế bấm cơ bản'}</small></div><button className="play-note" disabled={!activePitch} onClick={play}><Volume2 size={17} /> Nghe nốt</button></div><div className="hole-row">{holes.map((value, index) => <button className={value ? 'hole-button closed' : 'hole-button open'} onClick={() => toggle(index)} key={index}><span>{index + 1}</span>{value ? 'Bịt' : 'Mở'}</button>)}</div><p className="flute-tip">Bấm vào lỗ trên ảnh hoặc nút bên dưới. Màu tối là lỗ đang bịt, màu sáng là lỗ đang mở.</p></div>;
}
