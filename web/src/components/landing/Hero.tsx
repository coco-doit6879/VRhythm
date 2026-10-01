import { lazy, Suspense } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
const StringCanvas = lazy(() => import('./StringCanvas'));

export function Hero({ playNote }: { playNote: (id: string, note: string) => void }) {
  return <section className="lp-hero lp-wrap" aria-labelledby="lp-title">
    <div className="lp-hero-copy">
      <p className="lp-label"><span className="lp-rule" /> Di sản Việt · Thanh âm của bạn</p>
      <h1 id="lp-title">Việt Nam<br />trong từng<br /><em>thanh âm.</em></h1>
      <p className="lp-intro">Bắt đầu học nhạc cụ truyền thống cùng VRhythm — chọn nhạc cụ bạn yêu thích, tìm hiểu lộ trình và thực hành từng bước.</p>
      <div className="lp-actions"><a className="lp-button" href="/learn">Bắt đầu học <ArrowUpRight size={18} /></a><a className="lp-link" href="/explore">Tìm hiểu nhạc cụ <ArrowUpRight size={16} /></a></div>
    </div>
    <div className="lp-hero-art">
      <div className="lp-art-heading"><span className="lp-label">Một chạm, một thanh âm</span><span className="lp-seal" aria-hidden="true">ÂM<br />VIỆT</span></div>
      <div className="lp-string-stage"><Suspense fallback={<div aria-label="Đàn tranh tương tác đang tải"><div className="lp-canvas-placeholder" /><div className="lp-note-placeholder" /></div>}><StringCanvas playNote={playNote} /></Suspense></div>
      <div className="lp-art-caption"><span>Đàn tranh<small>Dây gảy · Ngũ cung</small></span><p>Chạm vào dây đàn.<br />Để giai điệu bắt đầu từ bạn.</p></div>
    </div>
    <div className="lp-hero-bottom"><a href="#nhac-cu"><ArrowDown size={16} /> Lật mở những thanh âm</a><span>DI SẢN · NHỊP ĐIỆU · CÔNG NGHỆ</span></div>
  </section>;
}
