import { memo } from 'react';
import { fluteFingering } from './fluteFingeringMap';
import './flute-fingering.css';

export const FluteFingering = memo(function FluteFingering({ pitch, rest = false, label = 'Thế bấm sáo' }: {
  pitch?: string | null; rest?: boolean; label?: string;
}) {
  const fingering = rest ? null : fluteFingering(pitch);
  const title = rest ? 'Nghỉ hơi' : pitch ? `${fingering?.name ?? ''} ${pitch}`.trim() : 'Sẵn sàng';
  const hint = rest ? 'Tạm ngắt hơi theo dấu lặng.' : !pitch ? 'Thế bấm xuất hiện khi đến nốt nhạc.'
    : !fingering ? 'Chưa có sơ đồ cho nốt này.' : fingering.upper ? 'Quãng cao · điều chỉnh luồng hơi.' : 'Bấm theo các lỗ được tô kín.';
  const description = fingering
    ? `${title}. ${fingering.holes.map((closed, index) => `Lỗ ${index + 1}: ${closed ? 'bịt' : 'mở'}`).join('; ')}.`
    : `${title}. ${hint}`;

  return <figure className="flute-fingering" data-pitch={rest ? 'rest' : pitch ?? ''} data-supported={!!fingering}>
    <figcaption className="flute-fingering-heading"><span>{label}<small>Sáo 6 lỗ · sơ đồ cơ bản</small></span><strong>{title}</strong></figcaption>
    <svg viewBox="0 0 640 182" role="img" aria-label={description}>
      <rect className="ff-body" x="20" y="48" width="600" height="52" rx="20" />
      <path className="ff-joint" d="M44 49v50 M129 49v50 M565 49v50 M597 49v50" />
      <ellipse className="ff-mouth" cx="80" cy="74" rx="16" ry="11" />
      <path className="ff-guide" d="M80 48V28" />
      <text x="80" y="26" textAnchor="middle">Lỗ thổi</text>
      {Array.from({ length: 6 }, (_, index) => {
        const x = 218 + index * 60;
        const state = !fingering ? 'unknown' : fingering.holes[index] ? 'closed' : 'open';
        return <g key={index} data-hole={index + 1} data-state={state}>
          <circle className={`ff-hole ff-${state}`} cx={x} cy="74" r="15" />
          {state === 'closed' && <path className="ff-mark" d={`M${x - 5} 74l4 4 7-8`} />}
          <text x={x} y="130" textAnchor="middle">{index + 1}</text>
        </g>;
      })}
      <path className="ff-hand" d="M203 144h150 M383 144h150" />
      <text x="278" y="175" textAnchor="middle">Tay trái</text>
      <text x="458" y="175" textAnchor="middle">Tay phải</text>
    </svg>
    <div className="flute-fingering-footer"><span className="ff-legend"><span><i className="ff-dot ff-dot-closed" />Bịt</span><span><i className="ff-dot" />Mở</span></span><p>{hint}</p></div>
  </figure>;
});
