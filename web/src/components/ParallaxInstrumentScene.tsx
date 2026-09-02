import { useState } from 'react';

type Point = { x: number; y: number };

export function ParallaxInstrumentScene() {
  const [point, setPoint] = useState<Point>({ x: 0, y: 0 });
  const tilt = `rotateX(${point.y * -4}deg) rotateY(${point.x * 5}deg)`;
  const move = (depth: number) => ({ transform: `${tilt} translate3d(${point.x * depth}px, ${point.y * depth}px, ${depth * 2}px)` });
  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => { const box = event.currentTarget.getBoundingClientRect(); setPoint({ x: (event.clientX - box.left) / box.width * 2 - 1, y: (event.clientY - box.top) / box.height * 2 - 1 }); };
  return <div className="parallax-scene" onPointerMove={handleMove} onPointerLeave={() => setPoint({ x: 0, y: 0 })} onPointerCancel={() => setPoint({ x: 0, y: 0 })}>
    <img className="parallax-instrument day-layer" src="/images/Dan_Day_Transparent.png" alt="" style={move(-18)} draggable="false" />
    <img className="parallax-instrument sao-layer" src="/images/Sao_Truc_Transparent.png" alt="Sáo trúc Việt Nam" style={move(10)} draggable="false" />
    <img className="parallax-instrument bau-layer" src="/images/Dan_Bau_Tranparent.png" alt="" style={move(24)} draggable="false" />
    <div className="parallax-hint"><span /> Rê chuột để khám phá</div>
  </div>;
}
