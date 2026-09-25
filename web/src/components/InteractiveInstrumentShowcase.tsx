import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { instruments, type Instrument } from '../data/mock';

export function InteractiveInstrumentShowcase({ onSelect }: { onSelect: (instrument: Instrument) => void }) {
  // Center instrument index (starts at 0: Đàn nguyệt)
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapIndex = (value: number) => ((value % instruments.length) + instruments.length) % instruments.length;

  const drag = useRef<{ id: number; x: number; moved: boolean; stepWidth: number } | null>(null);
  const suppressClick = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const activeInstrument = instruments[wrapIndex(Math.round(activeIndex + dragOffset))];

  const navigate = (step: number) => {
    setActiveIndex(prev => (prev + step + instruments.length) % instruments.length);
  };

  useEffect(() => {
    const cancelDrag = () => {
      const id = drag.current?.id;
      drag.current = null;
      setDragging(false);
      setDragOffset(0);
      if (id !== undefined && stageRef.current?.hasPointerCapture(id)) stageRef.current.releasePointerCapture(id);
    };
    window.addEventListener('blur', cancelDrag);
    return () => window.removeEventListener('blur', cancelDrag);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary || e.button !== 0 || drag.current) return;
    suppressClick.current = false;
    drag.current = { id: e.pointerId, x: e.clientX, moved: false, stepWidth: Math.max(110, Math.min(180, e.currentTarget.clientWidth / 4)) };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.id !== e.pointerId) return;
    const distance = e.clientX - current.x;
    if (Math.abs(distance) > 6 && !current.moved) {
      current.moved = true;
      suppressClick.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
    }
    if (current.moved) setDragOffset(-distance / current.stepWidth);
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>, cancelled = false) => {
    const current = drag.current;
    if (!current || current.id !== e.pointerId) return;
    const distance = e.clientX - current.x;
    if (!cancelled && current.moved) {
      setActiveIndex(previous => wrapIndex(previous + Math.round(-distance / current.stepWidth)));
    }
    drag.current = null;
    setDragging(false);
    setDragOffset(0);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <section className="instrument-carousel-section" role="region" aria-label="Chọn nhạc cụ" tabIndex={0}
      onKeyDown={event => {
        if (event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        navigate(event.key === 'ArrowRight' ? 1 : -1);
      }}>
      {/* Title & Subtitle Centered at Top */}
      <div className="carousel-header">
        <span className="section-kicker"><Sparkles size={14} /> Bộ sưu tập di sản</span>
        <h2><span style={{ whiteSpace: 'nowrap' }}>7 nhạc cụ truyền thống</span></h2>
        <p>Mỗi nhạc cụ là một bản độc tấu riêng của mỗi bạn trẻ.</p>
      </div>

      {/* Main Wide 3D Carousel Stage */}
      <div className="carousel-stage-container">
        {/* Navigation Arrows on Left and Right */}
        <button
          className="carousel-arrow-btn arrow-left"
          aria-label="Nhạc cụ trước"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </button>

        <div
          ref={stageRef}
          className={`carousel-3d-stage${dragging ? ' is-dragging' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={e => finishDrag(e)}
          onPointerCancel={e => finishDrag(e, true)}
          onLostPointerCapture={e => { if (e.target === e.currentTarget) finishDrag(e, true); }}
          onClickCapture={e => {
            if (suppressClick.current) {
              e.preventDefault();
              e.stopPropagation();
              suppressClick.current = false;
            }
          }}
        >
          {/* Radial Spotlight Glow */}
          <div className="carousel-spotlight-glow" />

          {/* Instruments 3D Ring */}
          <div className="carousel-3d-ring">
            {instruments.map((inst, index) => {
              const total = instruments.length;
              let diff = index - activeIndex - dragOffset;

              // Handle wrapping for infinite loop
              diff = ((diff + total / 2) % total + total) % total - total / 2;

              const isActive = index === wrapIndex(Math.round(activeIndex + dragOffset));

              // Precise 3D Arc Positioning with wide 340px spacing
              const absDiff = Math.abs(diff);
              let translateX = diff * 340;
              let translateZ = 100 - Math.min(absDiff, 1) * 240 - Math.max(0, absDiff - 1) * 140;
              let rotateY = diff < 0 ? Math.min(36, absDiff * 22) : Math.max(-36, -absDiff * 22);
              let scale = Math.max(0.4, 1.18 - Math.min(absDiff, 1) * .36 - Math.max(0, absDiff - 1) * .2);
              let opacity = Math.max(0, 1 - absDiff / 3);
              let zIndex = Math.round(100 - absDiff * 10);

              return (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={isActive ? `Xem ${inst.name}` : `Chuyển sang ${inst.name}`}
                  key={inst.id}
                  className={`carousel-item ${isActive ? 'active' : ''} ${['bau', 'tranh'].includes(inst.id) ? 'carousel-item-wide' : ''}`}
                  onClick={() => {
                    if (isActive) {
                      onSelect(inst);
                    } else {
                      setActiveIndex(index);
                    }
                  }}
                  style={{
                    transform: `translate3d(${translateX}px, 0px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity,
                    zIndex,
                    transition: dragging || absDiff > 2.5 ? 'none' : undefined,
                    pointerEvents: absDiff > 2.5 ? 'none' : undefined,
                  }}
                  title={isActive ? `Bấm để xem chi tiết ${inst.name}` : `Chuyển sang ${inst.name}`}
                >
                  <img
                    src={`/images/generated/carousel-${inst.id}.webp`}
                    alt={`${inst.name} — minh họa`}
                    className="carousel-instrument-img"
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>

          {/* Active Instrument Name Label at Bottom Center */}
          <a className="carousel-active-label" href={`/explore/${activeInstrument.id}`}>
            <span>{activeInstrument.name}</span>
          </a>
        </div>

        <button
          className="carousel-arrow-btn arrow-right"
          aria-label="Nhạc cụ tiếp theo"
          onClick={() => navigate(1)}
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
}



