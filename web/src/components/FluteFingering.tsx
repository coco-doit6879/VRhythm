import { memo } from 'react';
import { fluteFingering, readFluteNote } from './fluteFingeringMap';
import './flute-fingering.css';

export const FluteFingering = memo(function FluteFingering({ pitch, rest = false, complete = false, label = 'Thế bấm sáo' }: {
  pitch?: string | null; rest?: boolean; complete?: boolean; label?: string;
}) {
  const note = readFluteNote(pitch);
  const state = complete ? 'complete' : rest ? 'rest' : pitch == null || pitch === '' ? 'idle' : !note ? 'invalid' : 'note';
  const fingering = state === 'note' ? fluteFingering(pitch) : null;
  const hasHalfHole = fingering?.holes.includes('half');
  const title = state === 'complete' ? 'Hoàn tất' : state === 'rest' ? 'Nghỉ hơi' : state === 'idle' ? 'Sẵn sàng'
    : state === 'invalid' ? 'Nốt không hợp lệ' : `${note!.name} ${note!.pitch}`;
  let hint = 'Thế bấm xuất hiện khi đến nốt nhạc.';
  if (state === 'complete') hint = 'Đã đi hết các nốt trong lượt này.';
  else if (state === 'rest') hint = 'Tạm ngắt hơi theo dấu lặng.';
  else if (state === 'invalid') hint = 'Không đọc được cao độ. Hãy kiểm tra lại bản nhạc.';
  else if (state === 'note' && !fingering) hint = 'Chưa xác nhận thế bấm này. Theo sheet và hướng dẫn của giảng viên.';
  else if (hasHalfHole) hint = 'Bịt nửa lỗ 3, chỉnh hơi để đúng cao độ.';
  else if (fingering) hint = fingering.upper ? 'Quãng cao · điều chỉnh luồng hơi.' : 'Bấm theo các lỗ được tô kín.';
  const description = fingering
    ? `${title}. ${fingering.holes.map((hole, index) => `Lỗ ${index + 1}: ${hole === 'half' ? 'bịt nửa lỗ' : hole ? 'bịt' : 'mở'}`).join('; ')}. ${hint}`
    : `${title}. ${hint}`;

  return <figure className="flute-fingering" data-pitch={state === 'rest' ? 'rest' : state === 'note' ? note!.pitch : ''} data-state={state} data-supported={!!fingering}>
    <figcaption className="flute-fingering-heading"><span>{label}<small>Sáo 6 lỗ · sơ đồ cơ bản</small></span><strong>{title}</strong></figcaption>
    <div className="ff-diagram"><span className="ff-mouth-label" aria-hidden="true">Lỗ thổi</span>
    <svg viewBox="0 0 640 110" role="img" aria-label={description}>
      <rect className="ff-body" x="20" y="48" width="600" height="52" rx="20" />
      <path className="ff-joint" d="M44 49v50 M129 49v50 M565 49v50 M597 49v50" />
      <ellipse className="ff-mouth" cx="80" cy="74" rx="16" ry="11" />
      <path className="ff-guide" d="M80 48V28" />
      {Array.from({ length: 6 }, (_, index) => {
        const x = 218 + index * 60;
        const holeState = !fingering ? 'unknown' : fingering.holes[index] === 'half' ? 'half' : fingering.holes[index] ? 'closed' : 'open';
        return <g key={index} data-hole={index + 1} data-state={holeState}>
          <circle className={`ff-hole ff-${holeState}`} cx={x} cy="74" r="15" />
          {holeState === 'half' && <path className="ff-half-fill" d={`M${x} 59a15 15 0 0 0 0 30Z`} />}
          {holeState === 'closed' && <path className="ff-mark" d={`M${x - 5} 74l4 4 7-8`} />}
        </g>;
      })}
    </svg>
    <div className="ff-hole-numbers" aria-hidden="true">{[1,2,3,4,5,6].map(number => <span key={number}>{number}</span>)}</div>
    <div className="ff-hands" aria-hidden="true"><span>Tay trái</span><span>Tay phải</span></div></div>
    <div className="flute-fingering-footer"><span className="ff-legend"><span><i className="ff-dot ff-dot-closed" />Bịt</span><span><i className="ff-dot" />Mở</span>{hasHalfHole && <span><i className="ff-dot ff-dot-half" />Nửa lỗ</span>}</span><p>{hint}</p></div>
  </figure>;
});
