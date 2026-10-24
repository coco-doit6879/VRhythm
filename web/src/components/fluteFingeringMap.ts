// Hole 1 is nearest the embouchure. C4 is the teaching chart's lowest register.
// Natural notes follow Mobile; F#/Gb uses half-holing the third hole from F.
// Half-hole technique: vnam.edu.vn/rs/Document/161011-NguyenThiTrang-LVThS.pdf, p. 9.
// Third-register positions vary by instrument: do not extrapolate them by octave.
const closedHoles: Record<string, number> = { C: 6, D: 5, E: 4, F: 3, G: 2, A: 1, B: 0 };
const names: Record<string, string> = { C: 'Đô', D: 'Rê', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };

export type FluteHole = boolean | 'half';

export function readFluteNote(value: unknown) {
  if (typeof value !== 'string' || value.length > 3) return null;
  const match = /^([A-G])([#b♯♭]?)([0-8])$/.exec(value);
  if (!match || match[0] !== value) return null;
  const [, letter, accidental, octave] = match;
  const modifier = accidental === '♯' ? '#' : accidental === '♭' ? 'b' : accidental;
  return {
    pitch: `${letter}${modifier}${octave}`,
    name: `${names[letter]}${modifier === '#' ? ' thăng' : modifier === 'b' ? ' giáng' : ''}`,
    letter, accidental: modifier, octave: Number(octave),
  };
}

export function fluteFingering(pitch: unknown) {
  const note = readFluteNote(pitch);
  if (!note || (note.octave !== 4 && note.octave !== 5)) return null;
  const halfHole = (note.letter === 'F' && note.accidental === '#') || (note.letter === 'G' && note.accidental === 'b');
  if (note.accidental && !halfHole) return null;
  const holes: FluteHole[] = halfHole
    ? [true, true, 'half', false, false, false]
    : Array.from({ length: 6 }, (_, index) => index < closedHoles[note.letter]);
  return {
    name: note.name,
    upper: note.octave === 5,
    holes,
  };
}
