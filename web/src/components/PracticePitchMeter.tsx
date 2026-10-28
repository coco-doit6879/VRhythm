import { frequencyToNote, pitchToFrequency, practiceMeterCents, practiceToleranceCents, type PracticeMode } from './practicePitch';

export function PracticePitchMeter({ target, cents, mode, label }: { target: string; cents: number | null; mode: PracticeMode; label: string }) {
  const frequency = pitchToFrequency(target);
  const value = cents == null ? null : practiceMeterCents(cents, mode);
  const tolerance = practiceToleranceCents(mode);
  const inside = value != null && Math.abs(value) <= tolerance;
  const position = value == null ? 50 : 50 + value / 24;
  const halfWidth = tolerance / 24;
  return <div className="practice-pitch-meter">
    <div className="practice-pitch-meter-heading"><span>{label}</span><span>{value == null ? 'Chờ tiếng sáo' : inside ? 'Trong vùng' : value < 0 ? 'Thấp hơn' : 'Cao hơn'}</span></div>
    <div className="practice-pitch-track" role="meter" aria-label={`Cao độ quanh ${target}`} aria-valuemin={-1200} aria-valuemax={1200} aria-valuenow={value ?? 0} aria-valuetext={value == null ? 'Chưa có âm thanh' : inside ? `Trong vùng ${target}` : value < 0 ? `Thấp hơn ${target}` : `Cao hơn ${target}`}>
      <span className="practice-pitch-zone" style={{ left: `${50 - halfWidth}%`, width: `${halfWidth * 2}%` }} aria-hidden="true" />
      <span className="practice-pitch-center" aria-hidden="true" />
      {value != null && <span className={`practice-pitch-marker ${inside ? 'is-inside' : ''}`} style={{ left: `${position}%` }} aria-hidden="true" />}
    </div>
    <div className="practice-pitch-labels" aria-hidden="true"><span>{frequency ? frequencyToNote(frequency / 2) : '—'}</span><strong>{target}</strong><span>{frequency ? frequencyToNote(frequency * 2) : '—'}</span></div>
  </div>;
}
