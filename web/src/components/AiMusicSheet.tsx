import { useEffect, useMemo, useState } from 'react';
import type { SheetEntry, SheetScore } from '../audio/fluteScore';
import type { LibraryScore } from '../data/musicLibrary';
import { LibraryNotation } from './LibraryNotation';
import { PracticalLesson } from './PracticalLesson';
import './lesson-player.css';
import './ai-music-sheet.css';

const pitches = Array.from({ length: 36 }, (_, i) => `${['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][i % 12]}${4 + Math.floor(i / 12)}`);
const lengths = [['w', 'Tròn'], ['h', 'Trắng'], ['q', 'Đen'], ['8', 'Móc đơn'], ['16', 'Móc kép']];

export function AiMusicSheet({ score, valid, onChange, disabled = false, onPractice }: {
  score: SheetScore; valid: boolean; onChange?: (score: SheetScore) => void; disabled?: boolean; onPractice: () => void;
}) {
  const [selected, setSelected] = useState(0);
  const [practice, setPractice] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { if (disabled) setPractice(false); }, [disabled]);
  const index = Math.min(selected, score.notes.length - 1);
  const entry = score.notes[index];
  const notation = useMemo<LibraryScore>(() => {
    const supplied = (score.metadata as LibraryScore['metadata']).timeSignature;
    const timeSignature = supplied && Number.isInteger(supplied.beats) && supplied.beats > 0 && supplied.beats <= 12 && [2, 4, 8, 16].includes(supplied.beatType) ? supplied : { beats: 4, beatType: 4 };
    return { ...score, metadata: { ...score.metadata, timeSignature }, notes: score.notes.map(n => ({ ...n, duration: n.duration.toLowerCase().replace(/^e/, '8').replace(/^s/, '16') })) };
  }, [score]);
  const playable = useMemo(() => score.notes.flatMap((note, sourceIndex) => !note.rest && note.tie !== 'continue' && note.tie !== 'stop' ? [{ note, sourceIndex }] : []), [score]);
  const practical = useMemo(() => ({ title: score.metadata.title,
    sheetMusicJson: JSON.stringify({ metadata: score.metadata, notes: playable.map(p => p.note) }),
    expectedNotes: playable.map(({ note }, sortOrder) => ({ note: note.pitch!, sortOrder })),
  }), [score, playable]);
  const arrangement = score.arrangement;
  const adjustedCount = arrangement?.octaveAdjustedNotes;
  const octaveChanges = typeof adjustedCount === 'number' && Number.isInteger(adjustedCount) && adjustedCount > 0 && adjustedCount <= 2048 ? adjustedCount : 0;
  const arranged = arrangement?.melodyExtracted === true || octaveChanges > 0;
  const update = (note: SheetEntry) => onChange?.({ ...score, notes: score.notes.map((n, i) => i === index ? note : n) });

  return <div className="ai-sheet-workbench">
    {arranged && <div className="ai-sheet-arrangement" role="note" aria-label="Bản chuyển soạn cho sáo">
      <strong>Bản giai điệu gợi ý cho sáo</strong>
      <p>{arrangement?.melodyExtracted === true && 'Đã lược phần đệm và hợp âm để giữ một giai điệu. '}{octaveChanges > 0 && `Đã chuyển quãng 8 cho ${octaveChanges} nốt. `}{onChange ? 'Đối chiếu với ảnh gốc và kiểm tra lại nốt, nhịp, tempo trước khi tạo âm thanh.' : 'Bản chuyển soạn có thể khác bản nhạc gốc.'}</p>
    </div>}
    <div className="ai-sheet-toolbar" aria-label="Chế độ bản nhạc">
      <button aria-pressed={!practice} onClick={() => setPractice(false)}>Bản nhạc</button>
      <button aria-pressed={practice} disabled={!valid || disabled || !playable.length || playable.length > 512} onClick={() => { onPractice(); setPractice(true); }}>Luyện thổi sáo</button>
      <span>Sáo trúc · {score.metadata.tempo} BPM · {notation.metadata.timeSignature.beats}/{notation.metadata.timeSignature.beatType}{!(score.metadata as LibraryScore['metadata']).timeSignature && ' (tạm)'}</span>
    </div>
    {practice ? <>
      <p className="ai-sheet-help">Luyện cao độ từng nốt, chưa chấm nhịp. Dấu lặng được giữ trên sheet; nốt nối chỉ cần một lần thổi. Kết quả không tính vào tiến độ khóa học.</p>
      {completed && <div className="ai-sheet-result" role="status"><p>Bạn đã thổi đúng toàn bộ nốt!</p><button onClick={() => { setCompleted(false); setAttempt(n => n + 1); }}>Tập lại</button></div>}
      <div className="course-player practical-page ai-sheet-practice">
        <PracticalLesson key={attempt} practical={practical} busy={false} completed={completed} listeningScore={score} localPractice
          onSubmit={async () => { setCompleted(true); }}
          renderNotation={active => <LibraryNotation score={notation} activeIndex={playable[active]?.sourceIndex ?? -1} />} />
      </div>
    </> : <>
      {valid ? <div className="ai-sheet-paper" tabIndex={0} aria-label="Sheet nhạc"><LibraryNotation score={notation} activeIndex={onChange ? index : -1} /></div> : <p role="status">Sửa thông tin bên dưới để hiển thị lại bản nhạc.</p>}
      {onChange && entry && <fieldset className="ai-sheet-editor" disabled={disabled}>
        <legend>Kiểm tra và sửa nốt</legend>
        <label>Tempo<input type="number" min={1} max={300} value={score.metadata.tempo || ''} onChange={e => onChange({ ...score, metadata: { ...score.metadata, tempo: Number(e.target.value) } })} /></label>
        <label>Nhịp<select aria-label="Nhịp" value={`${notation.metadata.timeSignature.beats}/${notation.metadata.timeSignature.beatType}`} onChange={e => {
          const [beats, beatType] = e.target.value.split('/').map(Number);
          const next: LibraryScore = { ...score, metadata: { ...score.metadata, timeSignature: { beats, beatType } } };
          onChange(next);
        }}>{!['2/4', '3/4', '4/4', '6/8'].includes(`${notation.metadata.timeSignature.beats}/${notation.metadata.timeSignature.beatType}`) && <option>{notation.metadata.timeSignature.beats}/{notation.metadata.timeSignature.beatType}</option>}{['2/4', '3/4', '4/4', '6/8'].map(meter => <option key={meter}>{meter}</option>)}</select></label>
        <label>Nốt cần sửa<input type="number" min={1} max={score.notes.length} value={index + 1} onChange={e => setSelected(Math.max(0, Math.min(score.notes.length - 1, (Math.trunc(Number(e.target.value)) || 1) - 1)))} /></label>
        <label>Cao độ<select aria-label="Cao độ" value={entry.rest ? 'rest' : entry.pitch} onChange={e => update(e.target.value === 'rest'
          ? { id: entry.id, duration: entry.duration, rest: true, tempo: entry.tempo, tuplet: entry.tuplet, dynamic: entry.dynamic }
          : entry.rest ? { ...entry, rest: false, pitch: e.target.value } : { ...entry, pitch: e.target.value })}>
          <option value="rest">Dấu lặng</option>{!entry.rest && !pitches.includes(entry.pitch) && <option value={entry.pitch}>{entry.pitch}</option>}{pitches.map(p => <option key={p}>{p}</option>)}
        </select></label>
        <label>Trường độ<select aria-label="Trường độ" value={entry.duration.toLowerCase().replace(/^e/, '8').replace(/^s/, '16')} onChange={e => update({ ...entry, duration: e.target.value })}>
          {lengths.flatMap(([value, label]) => ['', '.', '..'].map(dots => <option key={value + dots} value={value + dots}>{label}{dots ? dots.length === 1 ? ' chấm dôi' : ' hai chấm dôi' : ''}</option>))}
        </select></label>
        <div className="ai-sheet-editor-actions">
          <button disabled={score.notes.length >= 2048} onClick={() => { const notes = [...score.notes]; notes.splice(index + 1, 0, { id: crypto.randomUUID(), pitch: 'C5', duration: 'q' }); onChange({ ...score, notes }); setSelected(index + 1); }}>Thêm nốt</button>
          <button disabled={score.notes.length <= 1} onClick={() => { onChange({ ...score, notes: score.notes.filter((_, i) => i !== index) }); setSelected(Math.max(0, index - 1)); }}>Xóa nốt</button>
        </div>
      </fieldset>}
      {playable.length > 512 && <p>Luyện microphone hỗ trợ tối đa 512 nốt. Bạn vẫn có thể xem sheet và nghe bản nhạc này.</p>}
    </>}
  </div>;
}
