import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { InstrumentArt } from './instruments';

export function Hero({ playNote }: { playNote: (id: string, note: string) => void }) {
  return <section className="lp-hero lp-wrap" aria-labelledby="lp-title">
    <div className="lp-hero-copy">
      <p className="lp-label"><span className="lp-rule" /> Di sản Việt · Thanh âm của bạn</p>
      <h1 id="lp-title">Việt Nam<br />trong từng<br /><em>thanh âm.</em></h1>
      <p className="lp-intro">Bắt đầu học sáo trúc cùng VRhythm — tìm hiểu lộ trình và thực hành từng bước.</p>
      <div className="lp-actions"><a className="lp-button" href="/learn">Bắt đầu học <ArrowUpRight size={18} /></a><a className="lp-link" href="/explore">Tìm hiểu nhạc cụ <ArrowUpRight size={16} /></a></div>
    </div>
    <div className="lp-hero-art">
      <div className="lp-art-heading"><span className="lp-label">Một chạm, một thanh âm</span><span className="lp-seal" aria-hidden="true">ÂM<br />VIỆT</span></div>
      <div className="lp-string-stage lp-flute-stage"><InstrumentArt id="sao" /><button className="lp-link" onClick={() => playNote('sao', 'C5')}>Nghe thử tiếng sáo</button></div>
      <div className="lp-art-caption"><span>Sáo trúc<small>Hơi thở · Thanh âm Việt</small></span><p>Bắt đầu từ một hơi thở.<br />Luyện từng nốt cùng bạn.</p></div>
    </div>
    <div className="lp-hero-bottom"><a href="#nhac-cu"><ArrowDown size={16} /> Lật mở những thanh âm</a><span>DI SẢN · NHỊP ĐIỆU · CÔNG NGHỆ</span></div>
  </section>;
}
