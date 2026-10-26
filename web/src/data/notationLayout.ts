import type { SheetEntry, SheetScore, SheetTuplet } from '../audio/fluteScore';

type Meter = { beats: number; beatType: number };
type NotationScore = SheetScore & { metadata: SheetScore['metadata'] & { timeSignature: Meter } };
export type NotationEntry = SheetEntry & { sourceIndex: number };
export type NotationMeasure = { notes: NotationEntry[]; startIndex: number; offset: number };

// Exact for supported input durations, dots and ratios with actual=2..9, normal=1..8.
const ticksPerBeat = 40320;
const lengths: Record<string, number> = { w: 4, h: 2, q: 1, '8': .5, e: .5, '16': .25, s: .25, '32': .125, '64': .0625, '128': .03125 };

export function entryBeats(entry: Pick<SheetEntry, 'duration' | 'tuplet'>): number {
  const match = /^(w|h|q|8|e|16|s|32|64|128)(\.{0,2})$/.exec(entry.duration.toLowerCase());
  if (!match) throw new Error('Trường độ chưa được hỗ trợ khi vẽ sheet.');
  const ratio = entry.tuplet;
  if (ratio && (!Number.isInteger(ratio.actual) || !Number.isInteger(ratio.normal) || ratio.actual < 1 || ratio.normal < 1)) {
    throw new Error('Tỷ lệ tuplet chưa hợp lệ.');
  }
  return lengths[match[1]] * (2 - 2 ** -match[2].length) * (ratio ? ratio.normal / ratio.actual : 1);
}

const spellings = ['w', 'h', 'q', '8', '16', '32', '64', '128'].flatMap(duration =>
  [0, 1, 2].map(dots => ({ duration: duration + '.'.repeat(dots), beats: lengths[duration] * (2 - 2 ** -dots) })),
).sort((a, b) => b.beats - a.beats);

function gcd(a: number, b: number): number { while (b) [a, b] = [b, a % b]; return a; }

function spell(ticks: number, tuplet?: SheetTuplet): { duration: string; tuplet?: SheetTuplet }[] {
  let remaining = ticks;
  const result: { duration: string; tuplet?: SheetTuplet }[] = [];
  const ratio = tuplet ? tuplet.normal / tuplet.actual : 1;
  for (const candidate of spellings) {
    const exact = candidate.beats * ratio * ticksPerBeat;
    const size = Math.round(exact);
    if (size < 1 || Math.abs(size - exact) > 1e-6) continue;
    while (size <= remaining) { result.push({ duration: candidate.duration, tuplet }); remaining -= size; }
  }
  if (!remaining) return result;
  // Different tuplet grids can meet at a barline. An explicit ratio preserves
  // the exact remaining duration instead of rounding, dropping or speeding it up.
  const divisor = gcd(ticks, ticksPerBeat);
  return [{ duration: 'q', tuplet: { actual: ticksPerBeat / divisor, normal: ticks / divisor } }];
}

/** Engraving fragments only: source notes and the playback timeline stay intact. */
export function scoreMeasures(score: NotationScore): NotationMeasure[] {
  const meter = score.metadata.timeSignature;
  if (!Number.isInteger(meter.beats) || meter.beats < 1 || meter.beats > 12 || ![2, 4, 8, 16].includes(meter.beatType)) {
    throw new Error('Nhịp chưa hợp lệ để vẽ sheet.');
  }
  const capacity = meter.beats * 4 / meter.beatType * ticksPerBeat;
  const offset = score.metadata.startOffsetBeats ?? 0;
  if (!Number.isFinite(offset) || offset < 0 || offset > 16) throw new Error('Phách lấy đà chưa hợp lệ.');
  let used = Math.round(offset * ticksPerBeat) % capacity;
  const result: NotationMeasure[] = [];
  let measure: NotationMeasure | undefined;
  score.notes.forEach((note, sourceIndex) => {
    const exact = entryBeats(note) * ticksPerBeat;
    let remaining = Math.round(exact);
    if (remaining < 1 || Math.abs(exact - remaining) > 1e-6) throw new Error(`Trường độ nốt ${sourceIndex + 1} cần được kiểm tra lại.`);
    const fragments: NotationEntry[] = [];
    while (remaining > 0) {
      if (used === capacity) { used = 0; measure = undefined; }
      if (!measure) { measure = { notes: [], startIndex: sourceIndex, offset: used / ticksPerBeat }; result.push(measure); }
      const amount = Math.min(remaining, capacity - used);
      const parts = amount === remaining && fragments.length === 0
        ? [{ duration: note.duration.toLowerCase(), tuplet: note.tuplet }]
        : spell(amount, note.tuplet);
      for (const part of parts) {
        const fragment: NotationEntry = { ...note, ...part, sourceIndex };
        fragments.push(fragment); measure.notes.push(fragment);
      }
      used += amount; remaining -= amount;
    }
    fragments.forEach((fragment, index) => {
      if (fragment.rest) return;
      const first = index === 0, last = index === fragments.length - 1;
      const from = !first || (!note.rest && (note.tie === 'continue' || note.tie === 'stop'));
      const to = !last || (!note.rest && (note.tie === 'start' || note.tie === 'continue'));
      fragment.tie = from && to ? 'continue' : from ? 'stop' : to ? 'start' : undefined;
      if (!first) fragment.articulation = undefined;
      if (!last) fragment.breathMark = undefined;
      if (!note.rest && note.slur === 'start' && !first) fragment.slur = undefined;
      if (!note.rest && note.slur === 'stop' && !last) fragment.slur = undefined;
    });
  });
  return result;
}
