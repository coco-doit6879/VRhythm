import { instruments } from '../../data/mock';

// Keep the catalogue and route IDs in the existing source of truth.
export const catalogue = instruments.filter(instrument => instrument.id === 'sao');
export const artwork: Record<string, { width: number; height: number }> = {
  sao: { width: 1024, height: 1536 }, nguyet: { width: 1024, height: 1536 },
  tranh: { width: 1536, height: 1024 }, bau: { width: 1536, height: 1024 },
  nhi: { width: 1024, height: 1536 }, tyba: { width: 1024, height: 1536 },
};
export const chapters = [
  { id: 'sao', title: ['Gửi giai điệu', 'vào một hơi thở'], tone: 'Mộc mạc & trong trẻo' },
];
export function InstrumentArt({ id, className = '' }: { id: string; className?: string }) {
  const item = catalogue.find(instrument => instrument.id === id)!;
  const src = item.transparentImage || `/images/generated/carousel-${item.id}.webp`;
  return <img className={`lp-instrument-art ${className}`} src={src} alt={item.name} {...artwork[id]} loading="lazy" decoding="async" />;
}
