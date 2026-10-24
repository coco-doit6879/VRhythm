// Same basic six-hole teaching convention as Mobile's PracticalMock.
// Hole 1 is nearest the embouchure. Do not infer chromatic/upper-register fingerings.
const closedHoles: Record<string, number> = { C: 6, D: 5, E: 4, F: 3, G: 2, A: 1, B: 0 };
const names: Record<string, string> = { C: 'Đô', D: 'Rê', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };

export function fluteFingering(pitch?: string | null) {
  const match = pitch?.length === 2 ? /^([A-G])([45])$/.exec(pitch) : null;
  if (!match) return null;
  const [, letter, octave] = match;
  return {
    name: names[letter],
    upper: octave === '5',
    holes: Array.from({ length: 6 }, (_, index) => index < closedHoles[letter]),
  };
}
