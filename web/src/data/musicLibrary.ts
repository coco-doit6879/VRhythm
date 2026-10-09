import lyCayXanh from '../../../app/components/lesson/lycayxanh.json';
import beoDatMayTroi from '../audio/sheets/beoDatMayTroi.json';
import bacKimThang from './scores/bac-kim-thang.json';
import type { SheetEntry, SheetScore } from '../audio/fluteScore';

export type LibraryScore = SheetScore & { metadata: SheetScore['metadata'] & { timeSignature: { beats: number; beatType: number } } };
export const musicLibrary = [
  { id: 'ly-cay-xanh', title: 'Lý cây xanh', region: 'Dân ca Nam Bộ', level: 'Dễ', score: lyCayXanh as LibraryScore },
  { id: 'bac-kim-thang', title: 'Bắc kim thang', region: 'Dân ca Nam Bộ', level: 'Dễ', score: bacKimThang as LibraryScore },
  { id: 'beo-dat-may-troi', title: 'Bèo dạt mây trôi', region: 'Dân ca Bắc Bộ', level: 'Vừa', score: beoDatMayTroi as LibraryScore },
];

export function entryBeats(entry: SheetEntry): number {
  const base = { w: 4, h: 2, q: 1, '8': .5, e: .5, '16': .25, s: .25 }[entry.duration.replace(/\./g, '')] ?? 1;
  const dots = entry.duration.split('.').length - 1;
  return base * (dots === 0 ? 1 : dots === 1 ? 1.5 : 1.75) * (entry.tuplet ? entry.tuplet.normal / entry.tuplet.actual : 1);
}

/** Keep complete measures together; an initial pickup retains its own bar. */
export function scoreMeasures(score: LibraryScore) {
  const result: { notes: SheetEntry[]; startIndex: number; offset: number }[] = [];
  const length = score.metadata.timeSignature.beats * 4 / score.metadata.timeSignature.beatType;
  let beat = score.metadata.startOffsetBeats ?? 0;
  score.notes.forEach((note, index) => {
    if (!result.length || beat < .0001) result.push({ notes: [], startIndex: index, offset: beat });
    result[result.length - 1].notes.push(note);
    beat += entryBeats(note);
    if (beat >= length - .0001) beat %= length;
  });
  return result;
}
