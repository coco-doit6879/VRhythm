import type { FluteNoteOptions, FluteSequenceNote, FluteSequenceOptions } from './PhysicalFluteEngine.ts';

export type SheetDynamic = 'ppp' | 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff' | 'fff';
export type SheetArticulation = 'staccato' | 'tenuto' | 'accent' | 'marcato';
export type SheetTuplet = { actual: number; normal: number };
type SheetEntryBase = {
  id: string;
  duration: string;
  /** A tempo change takes effect at this entry, including a rest. */
  tempo?: number;
  tuplet?: SheetTuplet;
  dynamic?: SheetDynamic;
};
export type SheetNote = SheetEntryBase & {
  pitch: string;
  rest?: false;
  tie?: 'start' | 'continue' | 'stop';
  slur?: 'start' | 'continue' | 'stop';
  articulation?: SheetArticulation;
  breathMark?: boolean;
};
export type SheetRest = SheetEntryBase & { rest: true; pitch?: never };
export type SheetEntry = SheetNote | SheetRest;
export type SheetScore = {
  metadata: { title: string; composer?: string; tempo: number; startOffsetBeats?: number };
  notes: SheetEntry[];
};
export type TimelineNote = {
  id: string;
  pitch: string | null;
  notation: string;
  index: number;
  start: number;
  duration: number;
  frequency: number | null;
  rest: boolean;
  tempo: number;
  tie?: SheetNote['tie'];
  slur?: SheetNote['slur'];
  articulation?: SheetArticulation;
  dynamic?: SheetDynamic;
};
export type ScoreTimeline = {
  events: TimelineNote[];
  sequence: FluteSequenceNote[];
  sequenceOptions: FluteSequenceOptions;
  totalDuration: number;
};

const beatLengths: Record<string, number> = { w: 4, h: 2, q: 1, '8': .5, e: .5, '16': .25, s: .25 };
const semitones: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const dynamicPressure: Record<SheetDynamic, number> = {
  ppp: .27, pp: .32, p: .37, mp: .42, mf: .48, f: .54, ff: .60, fff: .68,
};
const articulations: SheetArticulation[] = ['staccato', 'tenuto', 'accent', 'marcato'];
const markers = ['start', 'continue', 'stop'];

export function pitchFrequency(pitch: string): number {
  const match = /^([A-G])([#b]?)([0-8])$/.exec(pitch);
  if (!match) throw new Error(`Cao độ không hợp lệ: ${pitch}`);
  const midi = (Number(match[3]) + 1) * 12 + semitones[match[1]] + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0);
  return 440 * 2 ** ((midi - 69) / 12);
}

function validTempo(value: number): boolean {
  return Number.isFinite(value) && value > 0 && value <= 300;
}

function durationBeats(entry: SheetEntry, index: number): number {
  const notation = entry.duration?.toLowerCase();
  const match = /^(w|h|q|8|e|16|s)(\.{0,2})$/.exec(notation);
  if (!entry.id || !match) throw new Error(`Trường độ không hợp lệ ở nốt ${index + 1}.`);
  const dots = match[2].length;
  const base = beatLengths[match[1]] * (dots === 0 ? 1 : dots === 1 ? 1.5 : 1.75);
  if (!entry.tuplet) return base;
  const { actual, normal } = entry.tuplet;
  if (!Number.isInteger(actual) || !Number.isInteger(normal) || actual < 2 || actual > 9 || normal < 1 || normal > 8) {
    throw new Error(`Tuplet không hợp lệ ở nốt ${index + 1}.`);
  }
  return base * normal / actual;
}

/** Keeps notation entries intact while producing a separate monophonic performance. */
export function buildScoreTimeline(score: SheetScore): ScoreTimeline {
  const initialTempo = score?.metadata?.tempo;
  if (!validTempo(initialTempo) || !Array.isArray(score.notes) || score.notes.length === 0) {
    throw new Error('Sheet cần tempo hợp lệ và ít nhất một nốt.');
  }
  const startOffsetBeats = score.metadata.startOffsetBeats ?? 0;
  if (!Number.isFinite(startOffsetBeats) || startOffsetBeats < 0 || startOffsetBeats > 16) {
    throw new Error('Khoảng nghỉ đầu bản nhạc không hợp lệ.');
  }
  let tempo = initialTempo;
  let start = startOffsetBeats * 60 / tempo;
  let currentDynamic: number | undefined;
  let pendingTie: { pitch: string; sequenceIndex: number } | null = null;
  let openSlur: number | null = null;
  const events: TimelineNote[] = [];
  const sequence: FluteSequenceNote[] = [];
  const phraseDynamics: NonNullable<FluteSequenceOptions['phraseDynamics']> = [];

  score.notes.forEach((entry, index) => {
    if (entry.tempo !== undefined) {
      if (!validTempo(entry.tempo)) throw new Error(`Tempo không hợp lệ ở nốt ${index + 1}.`);
      tempo = entry.tempo;
    }
    if (entry.dynamic !== undefined) {
      if (!(entry.dynamic in dynamicPressure)) throw new Error(`Dynamic không hợp lệ ở nốt ${index + 1}.`);
      currentDynamic = dynamicPressure[entry.dynamic];
    }
    const duration = durationBeats(entry, index) * 60 / tempo;
    if (entry.rest === true) {
      if (pendingTie) throw new Error('Tie không được đi qua dấu lặng.');
      if (openSlur !== null) throw new Error('Slur không được đi qua dấu lặng trong bản sáo đơn âm.');
      if ('tie' in entry || 'slur' in entry || 'articulation' in entry) {
        throw new Error('Dấu lặng không thể mang tie, slur hoặc articulation.');
      }
      events.push({ id: entry.id, pitch: null, notation: entry.duration, index, start, duration,
        frequency: null, rest: true, tempo, dynamic: entry.dynamic });
      start += duration;
      return;
    }

    const note = entry as SheetNote;
    if (note.tie !== undefined && !markers.includes(note.tie)) throw new Error(`Tie không hợp lệ ở nốt ${index + 1}.`);
    if (note.slur !== undefined && !markers.includes(note.slur)) throw new Error(`Slur không hợp lệ ở nốt ${index + 1}.`);
    if (note.articulation !== undefined && !articulations.includes(note.articulation)) {
      throw new Error(`Articulation không hợp lệ ở nốt ${index + 1}.`);
    }
    if (note.breathMark !== undefined && typeof note.breathMark !== 'boolean') {
      throw new Error(`Dấu lấy hơi không hợp lệ ở nốt ${index + 1}.`);
    }
    const frequency = pitchFrequency(note.pitch);
    events.push({ id: note.id, pitch: note.pitch, notation: note.duration, index, start, duration,
      frequency, rest: false, tempo, tie: note.tie, slur: note.slur,
      articulation: note.articulation, dynamic: note.dynamic });

    let sequenceIndex: number;
    if (pendingTie) {
      if ((note.tie !== 'continue' && note.tie !== 'stop') || note.pitch !== pendingTie.pitch) {
        throw new Error(`Tie phải nối ngay sang cùng cao độ ở nốt ${index + 1}.`);
      }
      if (note.dynamic || note.articulation) throw new Error('Không đặt dynamic/articulation giữa một tie.');
      sequenceIndex = pendingTie.sequenceIndex;
      sequence[sequenceIndex].duration += duration;
      if (note.tie === 'stop') pendingTie = null;
    } else {
      if (note.tie === 'continue' || note.tie === 'stop') throw new Error(`Tie thiếu điểm bắt đầu ở nốt ${index + 1}.`);
      const options: FluteNoteOptions = {};
      if (currentDynamic !== undefined) options.breathPressure = currentDynamic;
      if (note.articulation === 'accent' || note.articulation === 'marcato') options.articulation = 'accent';
      if (note.articulation === 'tenuto') options.articulation = 'legato';
      if (note.articulation === 'staccato') {
        options.articulation = 'tongued';
        options.detached = true;
        options.release = .03;
      }
      if (note.articulation === 'marcato') options.breathPressure = Math.min(1, (options.breathPressure ?? .45) * 1.08);
      sequenceIndex = sequence.length;
      sequence.push({ note: note.pitch, start, duration,
        ...(Object.keys(options).length ? { options } : {}) });
      if (note.tie === 'start') pendingTie = { pitch: note.pitch, sequenceIndex };
    }

    if (note.slur === 'start') {
      if (openSlur !== null) throw new Error('Slur lồng nhau chưa được hỗ trợ.');
      openSlur = sequenceIndex;
    } else if (note.slur === 'continue' && openSlur === null) {
      throw new Error(`Slur thiếu điểm bắt đầu ở nốt ${index + 1}.`);
    } else if (note.slur === 'stop' && openSlur === null) {
      throw new Error(`Slur thiếu điểm bắt đầu ở nốt ${index + 1}.`);
    }
    if (openSlur !== null && sequenceIndex > openSlur && note.articulation === undefined) {
      sequence[sequenceIndex].options = { ...sequence[sequenceIndex].options, articulation: 'legato' };
    }
    if (note.slur === 'stop' && openSlur !== null) {
      if (sequenceIndex > openSlur) phraseDynamics.push({
        fromNote: openSlur, toNote: sequenceIndex, pressure: [1, 1, 1, 1],
      });
      openSlur = null;
    }
    if (note.articulation === 'staccato' || note.breathMark) {
      if (pendingTie) throw new Error('Không cắt ngắn một tie đang mở.');
      const sounded = sequence[sequenceIndex];
      if (note.articulation === 'staccato') sounded.duration *= .55;
      if (note.breathMark) sounded.duration -= Math.min(.12, sounded.duration * .2);
    }
    start += duration;
  });
  if (pendingTie) throw new Error('Tie chưa có điểm kết thúc.');
  if (openSlur !== null) throw new Error('Slur chưa có điểm kết thúc.');
  if (sequence.length === 0) throw new Error('Sheet cần ít nhất một nốt có âm thanh.');
  return { events, sequence, sequenceOptions: { phraseDynamics }, totalDuration: start };
}
