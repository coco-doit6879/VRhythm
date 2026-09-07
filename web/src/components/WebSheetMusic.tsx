import { useMemo } from 'react';

type Note = { id: string; pitch: string; duration: string };
type Score = { metadata: { tempo?: number; timeSignature?: { beats: number; beatType: number } }; notes: Note[] };

const positions: Record<string, number> = { C4: -2, D4: -1, E4: 0, F4: 1, G4: 2, A4: 3, B4: 4, C5: 5, D5: 6, E5: 7, F5: 8, G5: 9, A5: 10, B5: 11, C6: 12, D6: 13, E6: 14, F6: 15, G6: 16, A6: 17, B6: 18, C7: 19 };
const units: Record<string, number> = { w: 16, h: 8, q: 4, '8': 2, e: 2, '16': 1, s: 1 };
const beats: Record<string, number> = { w: 4, h: 2, q: 1, '8': .5, e: .5, '16': .25, s: .25 };
const lineSpacing = 16;

export function WebSheetMusic({ score, currentIndex = -1 }: { score: Score; currentIndex?: number }) {
  const layout = useMemo(() => {
    const highest = Math.max(8, ...score.notes.map(note => positions[note.pitch] ?? 0));
    const staffTop = 48 + Math.max(0, highest - 8) * 8;
    const bottom = staffTop + 4 * lineSpacing;
    const startX = 150;
    let x = startX;
    let measureBeat = 0;
    let measureStart = startX;
    const rendered = score.notes.map((note, index) => {
      const position = positions[note.pitch] ?? 0;
      const y = bottom - position * 8;
      const width = (units[note.duration] ?? 4) * 14;
      const item = { ...note, index, x, y, width, position, measureStart };
      x += width;
      measureBeat += beats[note.duration] ?? 1;
      if (measureBeat >= (score.metadata.timeSignature?.beats ?? 4)) { measureBeat = 0; measureStart = x + 20; x += 20; }
      return item;
    });
    const bars = rendered.reduce<number[]>((all, note, index) => index === 0 || note.measureStart !== rendered[index - 1].measureStart ? [...all, note.measureStart] : all, []).concat(x);
    return { staffTop, bottom, width: Math.max(620, x + 35), notes: rendered, bars };
  }, [score]);

  return <div className="sheet-svg-wrap"><svg className="sheet-svg" viewBox={`0 0 ${layout.width} ${layout.bottom + 62}`} role="img" aria-label="Bản nhạc"><g className="sheet-lines">{[0, 1, 2, 3, 4].map(line => <line key={line} x1="34" x2={layout.width - 20} y1={layout.staffTop + line * lineSpacing} y2={layout.staffTop + line * lineSpacing} />)}</g><text className="sheet-clef" x="51" y={layout.staffTop + 54}>𝄞</text><text className="sheet-time" x="106" y={layout.staffTop + 18}>4</text><text className="sheet-time" x="106" y={layout.staffTop + 39}>4</text>{layout.bars.map((bar, index) => <line className={index === layout.bars.length - 1 ? 'sheet-bar final' : 'sheet-bar'} key={`${bar}-${index}`} x1={bar} x2={bar} y1={layout.staffTop} y2={layout.bottom} />)}{layout.notes.map(note => <NoteGlyph key={note.id} note={note} active={note.index === currentIndex} staffTop={layout.staffTop} bottom={layout.bottom} />)}{currentIndex >= 0 && layout.notes[currentIndex] && <line className="sheet-cursor" x1={layout.notes[currentIndex].x} x2={layout.notes[currentIndex].x} y1={layout.staffTop - 16} y2={layout.bottom + 16} />}</svg></div>;
}

function NoteGlyph({ note, active, bottom }: { note: { x: number; y: number; width: number; duration: string; position: number }; active: boolean; staffTop: number; bottom: number }) {
  const filled = !['w', 'h'].includes(note.duration);
  const stemDown = note.position >= 4;
  const stemX = stemDown ? note.x - 8 : note.x + 8;
  const stemY = stemDown ? note.y + 3 : note.y - 3;
  const stemEnd = stemDown ? note.y + 42 : note.y - 42;
  const ledger: number[] = [];
  if (note.position < 0) for (let p = note.position; p < 0; p += 2) ledger.push(bottom - p * 8);
  if (note.position > 8) for (let p = 10; p <= note.position; p += 2) ledger.push(bottom - p * 8);
  return <g className={active ? 'sheet-note active' : 'sheet-note'}>{ledger.map((y, index) => <line className="sheet-ledger" key={index} x1={note.x - 13} x2={note.x + 13} y1={y} y2={y} />)}<ellipse className={filled ? 'note-head filled' : 'note-head'} cx={note.x} cy={note.y} rx="10" ry="7" transform={`rotate(-20 ${note.x} ${note.y})`} />{note.duration !== 'w' && <line className="note-stem" x1={stemX} x2={stemX} y1={stemY} y2={stemEnd} />}{(note.duration === '8' || note.duration === 'e' || note.duration === '16' || note.duration === 's') && <path className="note-flag" d={stemDown ? `M ${stemX} ${stemEnd} q 18 8 12 21` : `M ${stemX} ${stemEnd} q 18 -8 12 -21`} />}</g>;
}
