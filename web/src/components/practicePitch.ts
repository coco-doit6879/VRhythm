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

export type PracticeMode = 'single-take' | 'try';
export type PracticePhase = 'waiting' | 'tuning' | 'separate' | 'wrong' | 'retry' | 'reset' | 'advanced' | 'complete';
export type PracticeMatch = 'accurate' | 'near' | 'octave';
export type PracticeObservation = { index: number; phase: PracticePhase; cents: number | null; direction: 'higher' | 'lower' | null; match: PracticeMatch | null };

export function practiceToleranceCents(mode: PracticeMode): number {
  return mode === 'try' ? 120 : 60;
}

export function practiceMeterCents(cents: number, mode: PracticeMode): number {
  const normalized = matchPitch(cents, mode) === 'octave' ? cents - Math.sign(cents) * 1200 : cents;
  return Math.max(-1200, Math.min(1200, normalized));
}

function matchPitch(cents: number, mode: PracticeMode): PracticeMatch | null {
  const distance = Math.abs(cents);
  if (distance <= 35) return 'accurate';
  if (distance <= practiceToleranceCents(mode)) return 'near';
  // Allow one octave, but never combine octave folding with a neighbouring note.
  if (Math.abs(distance - 1200) <= 60) return 'octave';
  return null;
}

// One breath is one attempt. A short dropout is tolerated; release commits it.
export class PracticeNoteTracker {
  readonly accepted: string[] = [];
  private indexValue = 0;
  private matchingSince: number | null = null;
  private wrongSince: number | null = null;
  private silentSince: number | null = null;
  private hasSound = false;
  private ready = false;
  private errored = false;
  private breathMatch: PracticeMatch | null = null;

  constructor(private readonly expected: string[], private readonly mode: PracticeMode = 'single-take') {}

  observe(frequency: number | null, now: number): PracticeObservation {
    const result = (phase: PracticePhase, cents: number | null = null, match: PracticeMatch | null = null): PracticeObservation => ({
      index: this.indexValue, phase, cents, match, direction: match || cents == null ? null : cents > 0 ? 'lower' : 'higher',
    });
    if (this.indexValue >= this.expected.length) return result('complete');
    if (frequency == null || !Number.isFinite(frequency) || frequency <= 0) {
      this.silentSince ??= now;
      this.matchingSince = null;
      if (!this.hasSound || now - this.silentSince < 180) return result(this.errored ? 'wrong' : 'waiting');
      const passed = this.ready && !this.errored;
      const acceptedMatch = this.breathMatch;
      this.breathMatch = null;
      this.hasSound = false; this.ready = false; this.errored = false;
      this.matchingSince = null; this.wrongSince = null;
      if (!passed) {
        if (this.mode === 'try') return result('retry');
        this.accepted.length = 0; this.indexValue = 0;
        return result('reset');
      }
      this.accepted.push(this.expected[this.indexValue++]);
      return result(this.indexValue === this.expected.length ? 'complete' : 'advanced', null, acceptedMatch);
    }
    this.silentSince = null;
    this.hasSound = true;
    const target = pitchToFrequency(this.expected[this.indexValue]);
    if (!target) { this.errored = true; return result('wrong'); }
    const cents = 1200 * Math.log2(frequency / target);
    if (this.errored && this.mode === 'single-take') return result('wrong', cents);
    const match = matchPitch(cents, this.mode);
    if (match) {
      const rank = { accurate: 0, near: 1, octave: 2 };
      if (!this.breathMatch || rank[match] > rank[this.breathMatch]) this.breathMatch = match;
      this.errored = false;
      this.wrongSince = null;
      this.matchingSince ??= now;
      if (now - this.matchingSince >= 200) this.ready = true;
      return result(this.ready ? 'separate' : 'tuning', cents, this.breathMatch);
    }
    this.matchingSince = null;
    this.breathMatch = null;
    this.ready = false;
    this.wrongSince ??= now;
    // Reject a different note after 120ms, retaining a little onset tolerance.
    if (now - this.wrongSince >= (Math.abs(cents) >= 60 ? 120 : 350)) this.errored = true;
    return result(this.errored ? 'wrong' : 'tuning', cents);
  }
}
