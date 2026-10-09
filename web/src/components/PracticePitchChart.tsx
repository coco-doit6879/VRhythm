import { frequencyToNote } from './practicePitch';
import { frequencyToMidi, TRACE_WINDOW_MS, tracePath, type PitchSample } from './practiceTrace';
import './practice-pitch-chart.css';

export function PracticePitchChart({ samples, level, recording, target }: { samples: PitchSample[]; level: number; recording: boolean; target: number | null }) {
  const frequencies = samples.flatMap(sample => [sample.frequency, sample.target]).filter((value): value is number => !!value && Number.isFinite(value));
  if (target) frequencies.push(target);
  const pitches = frequencies.map(frequencyToMidi);
  const low = Math.floor(Math.min(60, ...pitches) / 12) * 12 - 2;
  const high = Math.ceil(Math.max(72, ...pitches) / 12) * 12 + 2;
  const end = samples.at(-1)?.time ?? 0;
  const x = (time: number) => (time - end + TRACE_WINDOW_MS) / TRACE_WINDOW_MS * 540;
  const y = (frequency: number) => (high - frequencyToMidi(frequency)) / (high - low) * 120;
  const ticks = Array.from({ length: Math.floor((high - low) / 12) + 1 }, (_, index) => Math.ceil(low / 12) * 12 + index * 12).filter(midi => midi <= high);
  return <figure className="practice-pitch-chart">
    <figcaption><span>Cao độ theo thời gian</span><span className="pitch-chart-legend"><i /> Bạn thổi <i /> Mục tiêu</span></figcaption>
    <div className="pitch-chart-plot">
    <div className="pitch-chart-labels" aria-hidden="true">{ticks.map(midi => <span key={midi} style={{ top: `${(high - midi) / (high - low) * 100}%` }}>{frequencyToNote(440 * 2 ** ((midi - 69) / 12))}</span>)}</div>
    <svg viewBox="0 0 540 120" preserveAspectRatio="none" role="img" aria-label="Biểu đồ cao độ trong 10 giây gần nhất; nét liền là nốt bạn thổi, nét đứt là mục tiêu">
      {ticks.map(midi => {
        const frequency = 440 * 2 ** ((midi - 69) / 12);
        return <line key={midi} className="pitch-chart-grid" x1="0" x2="540" y1={y(frequency)} y2={y(frequency)} />;
      })}
      <path className="pitch-chart-target" d={tracePath(samples, 'target', x, y)} />
      <path className="pitch-chart-heard" d={tracePath(samples, 'frequency', x, y)} />
    </svg>
    </div>
    <div className="pitch-chart-time" aria-hidden="true"><span>−10 giây</span><span>Hiện tại</span></div>
    {!samples.length && <p className="pitch-chart-empty">Bắt đầu nghe để xem cao độ.</p>}
    <div className="pitch-microphone-level"><span>Mức micro</span><meter min={0} max={1} value={recording ? level : 0} aria-label="Mức âm thanh microphone" /><span>{recording ? 'Đang nghe' : 'Đã dừng'}</span></div>
  </figure>;
}
