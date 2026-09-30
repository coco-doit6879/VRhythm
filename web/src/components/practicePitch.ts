const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function pitchToFrequency(pitch: string): number | null {
  const match = /^([A-G])(#|s|b)?(-?\d)$/.exec(pitch.trim());
  if (!match) return null;
  const base = NOTE_NAMES.indexOf(match[1]);
  const accidental = match[2] === '#' || match[2] === 's' ? 1 : match[2] === 'b' ? -1 : 0;
  const midi = (Number(match[3]) + 1) * 12 + base + accidental;
  return 440 * 2 ** ((midi - 69) / 12);
}

export function frequencyToNote(frequency: number): string | null {
  if (!Number.isFinite(frequency) || frequency <= 0) return null;
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  return `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

// YIN's cumulative-mean normalized difference rejects many harmonic octave errors.
export function detectPitchHz(buffer: Float32Array, sampleRate: number): number | null {
  if (!Number.isFinite(sampleRate) || sampleRate <= 0 || buffer.length < 1024) return null;
  let energy = 0;
  for (const sample of buffer) energy += sample * sample;
  if (Math.sqrt(energy / buffer.length) < 0.012) return null;

  const minLag = Math.max(2, Math.floor(sampleRate / 2200));
  const maxLag = Math.min(Math.floor(sampleRate / 110), Math.floor(buffer.length / 2) - 1);
  const windowLength = buffer.length - maxLag;
  const difference = new Float32Array(maxLag + 1);
  for (let lag = 1; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < windowLength; i++) {
      const delta = buffer[i] - buffer[i + lag];
      sum += delta * delta;
    }
    difference[lag] = sum;
  }

  let cumulative = 0;
  let bestLag = 0;
  let bestValue = 1;
  for (let lag = 1; lag <= maxLag; lag++) {
    cumulative += difference[lag];
    difference[lag] = cumulative ? difference[lag] * lag / cumulative : 1;
    if (lag >= minLag && difference[lag] < bestValue) {
      bestValue = difference[lag];
      bestLag = lag;
    }
  }

  let lag = 0;
  for (let i = minLag; i < maxLag; i++) {
    if (difference[i] < 0.12 && difference[i] <= difference[i + 1]) { lag = i; break; }
  }
  if (!lag && bestValue < 0.18) lag = bestLag;
  if (!lag) return null;

  const before = difference[lag - 1] ?? difference[lag];
  const after = difference[lag + 1] ?? difference[lag];
  const denominator = before - 2 * difference[lag] + after;
  const correction = denominator ? Math.max(-1, Math.min(1, (before - after) / (2 * denominator))) : 0;
  return sampleRate / (lag + correction);
}

export type PracticePhase = 'waiting' | 'tuning' | 'separate' | 'wrong' | 'advanced' | 'complete';
export type PracticeObservation = { index: number; phase: PracticePhase; cents: number | null; direction: 'higher' | 'lower' | null };

export class PracticeNoteTracker {
  readonly accepted: string[] = [];
  private indexValue = 0;
  private matchingSince: number | null = null;
  private wrongSince: number | null = null;
  private silentSince: number | null = null;
  private needsBreath = false;
  private errored = false;

  constructor(private readonly expected: string[]) {}

  observe(frequency: number | null, now: number): PracticeObservation {
    if (this.indexValue >= this.expected.length) return { index: this.indexValue, phase: 'complete', cents: null, direction: null };
    if (frequency == null || !Number.isFinite(frequency) || frequency <= 0) {
      this.matchingSince = null;
      this.wrongSince = null;
      if (this.silentSince == null) this.silentSince = now;
      if (this.needsBreath && now - this.silentSince >= 120) this.needsBreath = false;
      return { index: this.indexValue, phase: this.errored ? 'wrong' : 'waiting', cents: null, direction: null };
    }
    this.silentSince = null;
    const target = pitchToFrequency(this.expected[this.indexValue]);
    if (!target) return { index: this.indexValue, phase: 'wrong', cents: null, direction: null };
    const cents = 1200 * Math.log2(frequency / target);
    const direction = cents > 0 ? 'lower' : 'higher';
    if (this.needsBreath) return { index: this.indexValue, phase: 'separate', cents, direction: null };
    if (Math.abs(cents) <= 45) {
      this.wrongSince = null;
      this.errored = false;
      if (this.matchingSince == null) this.matchingSince = now;
      if (now - this.matchingSince >= 250) {
        const acceptedPitch = this.expected[this.indexValue];
        this.accepted.push(acceptedPitch);
        this.indexValue++;
        this.matchingSince = null;
        this.needsBreath = this.indexValue < this.expected.length && this.expected[this.indexValue] === acceptedPitch;
        return { index: this.indexValue, phase: this.indexValue === this.expected.length ? 'complete' : 'advanced', cents, direction: null };
      }
      return { index: this.indexValue, phase: 'tuning', cents, direction: null };
    }
    this.matchingSince = null;
    if (this.wrongSince == null) this.wrongSince = now;
    const grace = Math.abs(cents) >= 200 ? 650 : 1100;
    if (now - this.wrongSince >= grace) this.errored = true;
    return { index: this.indexValue, phase: this.errored ? 'wrong' : 'tuning', cents, direction };
  }
}
