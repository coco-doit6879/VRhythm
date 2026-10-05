export function InstrumentBackdrop({ id }: { id: string }) {
  return <div className={`instrument-backdrop instrument-backdrop-${id}`} aria-hidden="true"><img src={`/images/generated/carousel-${id}.webp`} alt="" decoding="async" /></div>;
}
