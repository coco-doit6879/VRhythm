import { useEffect, useMemo, useRef, useState } from 'react';
import { buildScoreTimeline, type SheetScore } from '../audio/fluteScore';
import { PhysicalFluteEngine, SAO_TRUC_SAMPLE_RATE } from '../audio/PhysicalFluteEngine';
import sao from '../../../app/components/lesson/saotruck_holes.json';
import lyCayXanh from '../../../app/components/lesson/lycayxanh.json';
import senbonzakura from '../../../app/components/lesson/senbonzakura.json';
import lacTroi from '../../../app/components/lesson/lactroi.json';
import beoDatMayTroi from '../audio/sheets/beoDatMayTroi.json';
import thienLyOi from '../audio/sheets/thienLyOi_anh_o_vung_que.json';
import fluteDiagnose from '../audio/sheets/flute_full_diagnostic_test.json';
import notationDiagnose from '../audio/sheets/flute_notation_diagnostic.json';
import aTownWithOceanView from '../audio/sheets/a_town_with_an_ocean_view_part1.json';
import tossACoinToYourWitcher from '../audio/sheets/toss_a_coin_to_your_witcher_notation.json';
import './flute-lab.css';

const scores = [fluteDiagnose, notationDiagnose, tossACoinToYourWitcher, aTownWithOceanView, beoDatMayTroi, thienLyOi, sao, lyCayXanh, senbonzakura, lacTroi] as SheetScore[];
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function FluteLabPage() {
  const [scoreIndex, setScoreIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const synth = useRef<PhysicalFluteEngine | null>(null);
  const frame = useRef<number | null>(null);
  const run = useRef(0);
  const score = scores[scoreIndex];
  const timeline = useMemo(() => buildScoreTimeline(score), [score]);

  const stop = () => {
    run.current++;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    synth.current?.stop();
    setPlaying(false);
    setActiveIndex(-1);
    setElapsed(0);
  };

  useEffect(() => () => {
    run.current++;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    void synth.current?.dispose();
  }, []);

  const play = async () => {
    stop();
    setError('');
    const thisRun = ++run.current;
    try {
      synth.current ??= new PhysicalFluteEngine();
      const { startTime: audioStart } = await synth.current.playSequence(timeline.sequence, timeline.sequenceOptions);
      if (thisRun !== run.current) { synth.current.stop(); return; }
      setPlaying(true);
      const tick = () => {
        if (thisRun !== run.current || !synth.current) return;
        const time = Math.max(0, synth.current.currentTime - audioStart);
        if (time >= timeline.totalDuration + .05) { stop(); return; }
        const index = timeline.events.findIndex(event => time >= event.start && time < event.start + event.duration);
        setElapsed(Math.min(time, timeline.totalDuration));
        setActiveIndex(index);
        frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    } catch {
      stop();
      setError('Không mở được âm thanh trên trình duyệt này. Hãy kiểm tra âm lượng và thử lại.');
    }
  };

  const download = () => {
    setError('');
    try {
      const url = URL.createObjectURL((synth.current ??= new PhysicalFluteEngine())
        .renderToWav(timeline.sequence, SAO_TRUC_SAMPLE_RATE, timeline.sequenceOptions));
      const link = document.createElement('a');
      link.href = url;
      link.download = `sao-truc-${scoreIndex + 1}.wav`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không xuất được WAV.'); }
  };

  return <main className="flute-lab">
    <div className="flute-lab-inner">
      <p className="flute-lab-kicker">VRhythm / phòng thử âm</p>
      <h1>Thử tiếng sáo theo sheet JSON</h1>
      <p>Âm sáo được tạo bằng mô hình air-jet và waveguide, không dùng bản thu, SoundFont hay màng dimo. Đây là bản thử để bạn nghe và đánh giá âm sắc, nốt, nhịp; chưa phải âm thanh sáo trúc đã được nghệ nhân xác thực.</p>
      <div className="flute-lab-controls">
        <label htmlFor="flute-lab-score">Bản nhạc để thử
          <select id="flute-lab-score" value={scoreIndex} onChange={event => { stop(); setScoreIndex(Number(event.target.value)); }}>
            {scores.map((item, index) => <option value={index} key={item.metadata.title}>{item.metadata.title}</option>)}
          </select>
        </label>
        <div className="flute-lab-actions">
          <button type="button" onClick={() => void play()}>{playing ? 'Phát lại từ đầu' : 'Phát bản nhạc'}</button>
          <button type="button" className="flute-lab-stop" disabled={!playing} onClick={stop}>Dừng</button>
          <button type="button" className="flute-lab-stop" onClick={download}>Xuất WAV</button>
        </div>
      </div>
      {error && <p role="alert" className="flute-lab-error">{error}</p>}
      <div className="flute-lab-meta"><span>Tempo: <strong>{activeIndex >= 0 ? timeline.events[activeIndex].tempo : score.metadata.tempo} BPM</strong></span><span>{timeline.events.filter(event => !event.rest).length} nốt</span><span>{formatTime(elapsed)} / {formatTime(timeline.totalDuration)}</span></div>
      <progress max={timeline.totalDuration} value={elapsed} aria-label="Tiến độ bản nhạc" />
      <p className="flute-lab-now" aria-live="off">{activeIndex >= 0 ? timeline.events[activeIndex].rest
        ? `Đang nghỉ · ${timeline.events[activeIndex].notation}`
        : `Đang phát: ${timeline.events[activeIndex].pitch} · ${timeline.events[activeIndex].notation}`
        : 'Chọn bản nhạc rồi nhấn phát để nghe.'}</p>
      <ol className="flute-lab-notes" aria-label="Các nốt trong sheet">
        {timeline.events.map(event => <li key={event.id} aria-current={activeIndex === event.index ? 'true' : undefined}>
          <span>{event.index + 1}</span><strong>{event.pitch ?? 'Nghỉ'}</strong><small>{event.notation} · {event.start.toFixed(2)}s{event.tie ? ` · tie ${event.tie}` : ''}{event.slur ? ` · slur ${event.slur}` : ''}{event.articulation ? ` · ${event.articulation}` : ''}{event.dynamic ? ` · ${event.dynamic}` : ''}</small>
        </li>)}
      </ol>
    </div>
  </main>;
}
