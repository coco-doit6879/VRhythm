import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { instruments, type Instrument } from '../data/mock';

export function InteractiveInstrumentShowcase({ onSelect }: { onSelect: (instrument: Instrument) => void }) {
  // Center instrument index (starts at 0: Đàn nguyệt)
  const [activeIndex, setActiveIndex] = useState(0);
  const activeInstrument = instruments[activeIndex];

  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const navigate = (step: number) => {
    setActiveIndex(prev => (prev + step + instruments.length) % instruments.length);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      const target = event.target as HTMLElement;
      if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      event.preventDefault();
      navigate(event.key === 'ArrowRight' ? 1 : -1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current || dragStartX.current === null) return;
    const diffX = e.clientX - dragStartX.current;
    if (Math.abs(diffX) > 40) {
      navigate(diffX > 0 ? -1 : 1);
    }
    isDragging.current = false;
    dragStartX.current = null;
  };

  return (
    <section className="instrument-carousel-section" aria-label="7 Nhạc cụ truyền thống">
      {/* Title & Subtitle Centered at Top */}
      <div className="carousel-header">
        <h2>7 nhạc cụ truyền thống</h2>
        <p>Mỗi nhạc cụ là một bằng độc tấu riêng trong tuyển Sinh viên.</p>
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
          className="carousel-3d-stage"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Radial Spotlight Glow */}
          <div className="carousel-spotlight-glow" />

          {/* Instruments 3D Ring */}
          <div className="carousel-3d-ring">
            {instruments.map((inst, index) => {
              const total = instruments.length;
              let diff = index - activeIndex;

              // Handle wrapping for infinite loop
              if (diff > total / 2) diff -= total;
              if (diff < -total / 2) diff += total;

              const isActive = diff === 0;

              // Precise 3D Arc Positioning with wide 340px spacing
              const absDiff = Math.abs(diff);
              let translateX = diff * 340;
              let translateZ = isActive ? 100 : -absDiff * 140;
              let rotateY = diff < 0 ? Math.min(36, absDiff * 22) : Math.max(-36, -absDiff * 22);
              let scale = isActive ? 1.18 : Math.max(0.4, 0.82 - (absDiff - 1) * 0.2);
              let opacity = isActive ? 1.0 : Math.max(0.25, 0.82 - (absDiff - 1) * 0.28);
              let zIndex = 10 - absDiff;

              return (
                <div
                  key={inst.id}
                  className={`carousel-item ${isActive ? 'active' : ''}`}
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
                  }}
                  title={isActive ? `Bấm để xem chi tiết ${inst.name}` : `Chuyển sang ${inst.name}`}
                >
                  <img
                    src={inst.transparentImage ?? inst.image}
                    alt={inst.name}
                    className="carousel-instrument-img"
                    draggable={false}
                  />
                </div>
              );
            })}
          </div>

          {/* Active Instrument Name Label at Bottom Center */}
          <div className="carousel-active-label" onClick={() => onSelect(activeInstrument)}>
            <span>{activeInstrument.name}</span>
          </div>
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



