export type PitchSample = { time: number; frequency: number | null; target: number | null };
export const TRACE_WINDOW_MS = 10000;

export function microphoneLevel(buffer: Float32Array): number {
  if (!buffer.length) return 0;
  let sum = 0;
  for (const value of buffer) sum += value * value;
  return Math.min(1, Math.sqrt(sum / buffer.length));
}

export function appendPitchSample(samples: PitchSample[], sample: PitchSample): PitchSample[] {
  return [...samples.filter(item => item.time >= sample.time - TRACE_WINDOW_MS), sample].slice(-110);
}

export function frequencyToMidi(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / 440);
}

// Move instead of drawing across silence or a suspended recording frame.
export function tracePath(samples: PitchSample[], field: 'frequency' | 'target', x: (time: number) => number, y: (frequency: number) => number): string {
  let connected = false;
  let previousTime: number | undefined;
  return samples.map(sample => {
    const value = sample[field];
    if (!value || !Number.isFinite(value)) { connected = false; previousTime = sample.time; return ''; }
    const command = connected && previousTime !== undefined && sample.time - previousTime <= 300 ? 'L' : 'M';
    connected = true; previousTime = sample.time;
    return `${command}${x(sample.time).toFixed(1)},${y(value).toFixed(1)}`;
  }).join(' ');
}
