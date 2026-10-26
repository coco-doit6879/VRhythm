import lyCayXanh from '../../../app/components/lesson/lycayxanh.json';
import beoDatMayTroi from '../audio/sheets/beoDatMayTroi.json';
import bacKimThang from './scores/bac-kim-thang.json';
import type { SheetScore } from '../audio/fluteScore';
export { entryBeats, scoreMeasures } from './notationLayout';

export type LibraryScore = SheetScore & { metadata: SheetScore['metadata'] & { timeSignature: { beats: number; beatType: number } } };
export const musicLibrary = [
  { id: 'ly-cay-xanh', title: 'Lý cây xanh', region: 'Dân ca Nam Bộ', level: 'Dễ', score: lyCayXanh as LibraryScore },
  { id: 'bac-kim-thang', title: 'Bắc kim thang', region: 'Dân ca Nam Bộ', level: 'Dễ', score: bacKimThang as LibraryScore },
  { id: 'beo-dat-may-troi', title: 'Bèo dạt mây trôi', region: 'Dân ca Bắc Bộ', level: 'Vừa', score: beoDatMayTroi as LibraryScore },
];
