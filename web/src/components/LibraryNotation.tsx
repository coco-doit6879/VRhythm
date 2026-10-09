import { useEffect, useRef, useState } from 'react';
import { scoreMeasures, type LibraryScore } from '../data/musicLibrary';
import { Accidental, Articulation, Barline, Beam, Curve, Dot, Formatter, Modifier, Renderer, Stave, StaveNote, Voice } from 'vexflow/bravura';

const ink = '#263630';
const activeInk = '#9b541b';
type Measure = ReturnType<typeof scoreMeasures>[number];
const measureWidth = (measure: Measure) => Math.max(88, measure.notes.length * 20 + 20 + measure.notes.filter(note => /^(16|s)/.test(note.duration)).length * 12);
const curveOptions = { xShift: -3, yShift: 7, thickness: 1, cps: [{ x: 0, y: 6 }, { x: 0, y: 6 }] };
type Position = { x: number; y: number; element?: SVGElement };

/** Engraving is separate from PCM playback. SVG note indices retain the source score order. */
export function LibraryNotation({ score, activeIndex }: { score: LibraryScore; activeIndex: number }) {
  const root = useRef<HTMLDivElement>(null);
  const positions = useRef<Position[]>([]);
  const cursor = useRef<SVGLineElement | null>(null);
  const previous = useRef(-1);
  const [width, setWidth] = useState(0);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!root.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element || width < 100) return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      element.replaceChildren();
      try {
        const measures = scoreMeasures(score);
        const systems: typeof measures[] = [];
        let used = 65;
        for (const measure of measures) {
          const required = measureWidth(measure);
          const current = systems[systems.length - 1];
          if (!current || current.length >= 4 || used + required > width - 16) {
            systems.push([measure]); used = 65 + required;
          } else { current.push(measure); used += required; }
        }
        const renderer = new Renderer(element, Renderer.Backends.SVG);
        const rowHeight = 140;
        renderer.resize(width, systems.length * rowHeight);
        const context = renderer.getContext();
        context.setFillStyle(ink).setStrokeStyle(ink);
        const renderedNotes: StaveNote[] = [];
        const rows: number[] = [];
        const signature = `${score.metadata.timeSignature.beats}/${score.metadata.timeSignature.beatType}`;
        let measureIndex = 0;
        systems.forEach((system, row) => {
          const weights = system.map((measure, index) => measureWidth(measure) + (index === 0 ? 65 : 0));
          const total = weights.reduce((sum, value) => sum + value, 0);
          let x = 8;
          system.forEach((measure, column) => {
            const staveWidth = (width - 16) * weights[column] / total;
            const stave = new Stave(x, row * rowHeight + 40, staveWidth);
            if (column === 0) {
              stave.addClef('treble');
              context.setFont('Arial', 9).fillText(String(measureIndex + 1), x + 3, row * rowHeight + 24);
            }
            if (row === 0 && column === 0) stave.addTimeSignature(signature);
            const final = measureIndex === measures.length - 1;
            stave.setBegBarType(column === 0 ? Barline.type.SINGLE : Barline.type.NONE);
            stave.setEndBarType(final ? Barline.type.END : Barline.type.SINGLE);
            stave.setContext(context).draw();
            stave.getSVGElement()?.setAttribute('data-measure', String(++measureIndex));
            const notes = measure.notes.map(entry => {
              const duration = entry.duration.replace(/\./g, '').replace(/^e$/, '8').replace(/^s$/, '16');
              const dots = entry.duration.split('.').length - 1;
              const key = entry.rest ? 'b/4' : entry.pitch.replace(/^([A-G])([#b]?)(\d)$/, (_, letter: string, accidental: string, octave: string) => `${letter.toLowerCase()}${accidental}/${octave}`);
              const note = new StaveNote({ keys: [key], duration: `${duration}${'d'.repeat(dots)}${entry.rest ? 'r' : ''}`, autoStem: true });
              for (let dot = 0; dot < dots; dot++) Dot.buildAndAttach([note], { all: true });
              if (!entry.rest && entry.breathMark) note.addModifier(new Articulation('\uE4CE').setPosition(Modifier.Position.ABOVE).setXShift(8), 0);
              note.setStyle({ fillStyle: ink, strokeStyle: ink });
              renderedNotes.push(note); rows.push(row);
              return note;
            });
            const voice = new Voice({ numBeats: score.metadata.timeSignature.beats, beatValue: score.metadata.timeSignature.beatType });
            // Pickup bars may be shorter, but never invent rests or alter source note timing.
            voice.setMode(Voice.Mode.FULL).addTickables(notes);
            Accidental.applyAccidentals([voice], 'C');
            const beams = Beam.generateBeams(notes, { groups: Beam.getDefaultBeamGroups(signature) });
            new Formatter().joinVoices([voice]).formatToStave([voice], stave);
            voice.draw(context, stave);
            beams.forEach(beam => beam.setContext(context).draw());
            x += staveWidth;
          });
        });
        let slurStart = -1;
        score.notes.forEach((entry, index) => {
          if (entry.rest) return;
          if (entry.slur === 'start') slurStart = index;
          if (entry.slur === 'stop' && slurStart >= 0) {
            if (rows[slurStart] === rows[index]) new Curve(renderedNotes[slurStart], renderedNotes[index], curveOptions).setContext(context).draw();
            else {
              let start = slurStart;
              for (let row = rows[slurStart]; row <= rows[index]; row++) {
                let end = start;
                while (end < index && rows[end + 1] === row) end++;
                new Curve(row === rows[slurStart] ? renderedNotes[start] : undefined, row === rows[index] ? renderedNotes[end] : undefined, curveOptions).setContext(context).draw();
                start = end + 1;
              }
            }
            slurStart = -1;
          }
        });
        positions.current = renderedNotes.map((note, index) => {
          const node = note.getSVGElement();
          node?.classList.add('sheet-note');
          node?.setAttribute('data-note-index', String(index));
          node?.setAttribute('data-pitch', score.notes[index].pitch ?? 'rest');
          node?.setAttribute('data-head-y', String(note.getYs()[0]));
          node?.setAttribute('data-staff-bottom', String(note.getStave()!.getYForLine(4)));
          return { x: note.getAbsoluteX(), y: rows[index] * rowHeight + 70, element: node };
        });
        const svg = element.querySelector('svg')!;
        svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', `Bản nhạc ${score.metadata.title}`);
        svg.setAttribute('data-systems', String(systems.length));
        svg.setAttribute('data-measures', String(measures.length));
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.classList.add('sheet-cursor'); line.setAttribute('stroke', activeInk); line.setAttribute('stroke-width', '2');
        line.style.display = 'none'; svg.appendChild(line); cursor.current = line;
        previous.current = -1; setError(''); setRevision(value => value + 1);
      } catch (cause) {
        element.replaceChildren(); positions.current = []; cursor.current = null;
        setError(cause instanceof Error ? `Không vẽ được sheet: ${cause.message}` : 'Không vẽ được sheet.');
      }
    });
    return () => { cancelled = true; };
  }, [score, width]);

  useEffect(() => {
    const old = positions.current[previous.current]?.element;
    old?.classList.remove('active');
    if (old) old.querySelectorAll('[fill],[stroke]').forEach(node => { if (node.hasAttribute('fill') && node.getAttribute('fill') !== 'none') node.setAttribute('fill', ink); if (node.hasAttribute('stroke') && node.getAttribute('stroke') !== 'none') node.setAttribute('stroke', ink); });
    const position = positions.current[activeIndex];
    if (cursor.current) cursor.current.style.display = position ? '' : 'none';
    if (position && cursor.current) {
      position.element?.classList.add('active');
      position.element?.querySelectorAll('[fill],[stroke]').forEach(node => { if (node.hasAttribute('fill') && node.getAttribute('fill') !== 'none') node.setAttribute('fill', activeInk); if (node.hasAttribute('stroke') && node.getAttribute('stroke') !== 'none') node.setAttribute('stroke', activeInk); });
      cursor.current.setAttribute('x1', String(position.x)); cursor.current.setAttribute('x2', String(position.x));
      cursor.current.setAttribute('y1', String(position.y - 12)); cursor.current.setAttribute('y2', String(position.y + 62));
      const panel = root.current?.parentElement;
      if (panel && (position.y < panel.scrollTop || position.y + 80 > panel.scrollTop + panel.clientHeight)) panel.scrollTop = Math.max(0, position.y - 40);
    }
    previous.current = activeIndex;
  }, [activeIndex, revision]);
  return <><div className="library-notation" ref={root} />{error && <p role="alert">{error}</p>}</>;
}
