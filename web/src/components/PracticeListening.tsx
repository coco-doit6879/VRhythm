import { Play, Square, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PhysicalFluteEngine } from '../audio/PhysicalFluteEngine';
import { buildScoreTimeline, type SheetScore, type TimelineNote } from '../audio/fluteScore';
import { FluteFingering } from './FluteFingering';

export function PracticeListening({ notes, tempo, target, disabled, sourceScore }: {
  notes: Array<{ id: string; pitch: string; duration: string }>;
  tempo: number; target?: string; disabled: boolean; sourceScore?: SheetScore;
}) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<TimelineNote | null>(null);
  const resources = useRef<{ engine?: PhysicalFluteEngine; timer?: ReturnType<typeof setTimeout>; frame?: number }>({});
  const generation = useRef(0);
  const stop = () => {
    generation.current++;
    clearTimeout(resources.current.timer);
    if (resources.current.frame != null) cancelAnimationFrame(resources.current.frame);
    const engine = resources.current.engine;
    resources.current = {};
    void engine?.dispose().catch(() => {});
    setPlaying(false);
    setPreview(null);
  };
  useEffect(() => {
    const hidden = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', hidden);
    return () => { stop(); document.removeEventListener('visibilitychange', hidden); };
  }, []);
  useEffect(() => { if (disabled) stop(); }, [disabled]);
  const play = async (single: boolean) => {
    stop(); setError(''); setPlaying(true);
    const run = generation.current;
    try {
      const { PhysicalFluteEngine } = await import('../audio/PhysicalFluteEngine');
      if (run !== generation.current) return;
      const timeline = buildScoreTimeline(single && target ? { metadata: { title: 'Nốt mẫu', tempo }, notes: [{ id: 'target', pitch: target, duration: 'h' }] } : sourceScore ?? { metadata: { title: 'Bài thực hành', tempo }, notes });
      const engine = new PhysicalFluteEngine();
      resources.current.engine = engine;
      const playback = await engine.playSequence(timeline.sequence, timeline.sequenceOptions);
      if (run !== generation.current) { void engine.dispose().catch(() => {}); return; }
      let previous = -2;
      const tick = () => {
        if (run !== generation.current) return;
        const position = Math.max(0, engine.currentTime - playback.startTime);
        const index = timeline.events.findIndex(event => position >= event.start && position < event.start + event.duration);
        if (index !== previous) { previous = index; setPreview(timeline.events[index] ?? null); }
        resources.current.frame = requestAnimationFrame(tick);
      };
      tick();
      resources.current.timer = setTimeout(stop, (playback.duration + .1) * 1000);
    } catch {
      if (run === generation.current) { stop(); setError('Không phát được tiếng sáo. Hãy thử lại.'); }
    }
  };
  return <div className="practice-listening">
    <div className="practice-listening-actions">
      <button disabled={disabled} onClick={() => playing ? stop() : void play(false)}>{playing ? <Square size={18} /> : <Play size={18} />}{playing ? 'Dừng nghe mẫu' : 'Nghe mẫu'}</button>
      <button disabled={disabled || !target || playing} onClick={() => void play(true)}><Volume2 size={18} />Nghe nốt {target}</button>
    </div>
    {error && <p role="alert">{error}</p>}
    <FluteFingering pitch={playing ? preview?.pitch : target} rest={playing && preview?.rest} complete={!playing && !target}
      label={playing ? 'Thế bấm đang nghe' : 'Thế bấm nốt đang luyện'} />
  </div>;
}
