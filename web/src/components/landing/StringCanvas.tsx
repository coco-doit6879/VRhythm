import { useEffect, useRef } from 'react';
const notes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'];
const labels = ['Đô', 'Rê', 'Mi', 'Sol', 'La', 'Đô cao', 'Rê cao', 'Mi cao'];

export default function StringCanvas({ playNote }: { playNote: (id: string, note: string) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pluck = useRef<(index: number) => void>(() => {});
  const last = useRef(-1);
  useEffect(() => {
    const element = canvas.current!;
    const ctx = element.getContext('2d');
    if (!ctx) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const struck = Array<number>(8).fill(-10000);
    let frame = 0; let width = 0; let height = 0;
    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      // A top-down zither study: warm soundboard, eight playable strings, movable bridges.
      ctx.fillStyle = '#e0c6a0'; ctx.strokeStyle = '#7c603d'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(width * .08, height * .08); ctx.lineTo(width * .84, height * .04); ctx.quadraticCurveTo(width * .98, height * .48, width * .88, height * .95); ctx.lineTo(width * .1, height * .91); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#ab875b';
      for (let j = 0; j < 5; j++) { ctx.beginPath(); ctx.moveTo(width * (.12 + j * .005), height * .12); ctx.lineTo(width * (.14 + j * .005), height * .87); ctx.stroke(); }
      let animating = false;
      for (let i = 0; i < 8; i++) {
        const y = height * (.18 + i * .09); const age = (time - struck[i]) / 1000;
        const amplitude = motion.matches ? 0 : age < 1.8 ? Math.exp(-age * 3.7) * 10 : 0;
        animating ||= amplitude > .03;
        ctx.strokeStyle = age < .3 ? '#a74729' : '#735f43'; ctx.lineWidth = age < .3 ? 1.8 : 1;
        ctx.beginPath();
        for (let x = width * .13; x <= width * .89; x += 2) {
          const offset = Math.sin((x - width * .13) / (width * .76) * Math.PI) * Math.sin(age * 95) * amplitude;
          if (x === width * .13) ctx.moveTo(x, y); else ctx.lineTo(x, y + offset);
        }
        ctx.stroke();
        const bridge = width * (.35 + i * .047);
        ctx.fillStyle = '#685137'; ctx.beginPath(); ctx.moveTo(bridge, y - 7); ctx.lineTo(bridge - 5, y + 6); ctx.lineTo(bridge + 5, y + 6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#6e563d'; ctx.beginPath(); ctx.arc(width * .13, y, 3, 0, Math.PI * 2); ctx.fill();
      }
      frame = animating ? requestAnimationFrame(draw) : 0;
    };
    const resize = () => { const rect = element.getBoundingClientRect(); width = rect.width; height = rect.height; const dpr = Math.min(window.devicePixelRatio || 1, 2); element.width = width * dpr; element.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); cancelAnimationFrame(frame); draw(performance.now()); };
    pluck.current = index => { struck[index] = performance.now(); if (!frame) draw(performance.now()); };
    const observer = new ResizeObserver(resize); observer.observe(element);
    const changed = () => { cancelAnimationFrame(frame); draw(performance.now()); };
    motion.addEventListener('change', changed);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); motion.removeEventListener('change', changed); pluck.current = () => {}; };
  }, []);
  const strike = (index: number) => { pluck.current(index); playNote('tranh', notes[index]); };
  return <div className="lp-zither">
    <canvas ref={canvas} aria-hidden="true" onPointerMove={event => { if (event.pointerType !== 'mouse' && event.buttons === 0) return; const rect = event.currentTarget.getBoundingClientRect(); const y = (event.clientY - rect.top) / rect.height; const index = Math.round((y - .18) / .09); if (index >= 0 && index < 8 && last.current !== index) { last.current = index; strike(index); } }} onPointerLeave={() => { last.current = -1; }} onPointerDown={event => { const rect = event.currentTarget.getBoundingClientRect(); const index = Math.round(((event.clientY - rect.top) / rect.height - .18) / .09); if (index >= 0 && index < 8) { last.current = index; strike(index); } }} />
    <div className="lp-note-keys" role="group" aria-label="Gảy dây đàn tranh bằng bàn phím hoặc chạm">{notes.map((note, index) => <button key={note} aria-label={`Gảy nốt ${labels[index]}`} onClick={() => strike(index)}>{labels[index].replace(' cao', '⁺')}</button>)}</div>
  </div>;
}
