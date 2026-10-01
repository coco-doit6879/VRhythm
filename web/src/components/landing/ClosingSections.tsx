import { ArrowUpRight } from 'lucide-react';
import { InstrumentArt } from './instruments';

export function Ornament() {
  return <svg className="lp-ornament" viewBox="0 0 800 24" fill="none" aria-hidden="true"><path d="M0 12H330m140 0h330M342 12l12-8 12 8-12 8-12-8Zm30 0 12-8 12 8-12 8-12-8Zm30 0 12-8 12 8-12 8-12-8Zm30 0 12-8 12 8-12 8-12-8Z" stroke="currentColor" /><path d="M0 18h300m200 0h300" stroke="currentColor" opacity=".4" /></svg>;
}
export function QuoteSection() {
  return <section className="lp-quote lp-wrap" aria-labelledby="lp-quote-title"><Ornament /><p className="lp-label">Di sản không chỉ để ngắm nhìn</p><h2 id="lp-quote-title"><span>Di sản chỉ sống</span><span>khi được <i>tiếp tục.</i></span></h2><div className="lp-quote-body"><p>Mỗi lần bạn tập một nốt nhạc, giai điệu truyền thống sẽ có thêm một người tiếp nối.</p><p>Chọn nhạc cụ mình yêu thích và bắt đầu từ bài học đầu tiên.<br />VRhythm đồng hành cùng bạn trên hành trình này.</p></div><span className="lp-seal" aria-hidden="true">TIẾP<br />NỐI</span><Ornament /></section>;
}
export function FinalCTA() {
  return <><section className="lp-final"><div className="lp-final-art lp-final-left" aria-hidden="true"><InstrumentArt id="sao" /></div><div className="lp-final-art lp-final-right" aria-hidden="true"><InstrumentArt id="nguyet" /></div><div className="lp-final-copy"><p className="lp-label">Học theo nhịp của bạn</p><h2>Một nốt nhạc hôm nay.<br /><i>Một giai điệu ngày mai.</i></h2><a className="lp-button" href="/learn">Bắt đầu học <ArrowUpRight size={20} /></a><p>Bắt đầu từ một nốt nhạc, theo nhịp của riêng bạn.</p></div></section><footer className="lp-footer lp-wrap"><a href="/" className="lp-footer-brand">VRhythm<span>Di sản · Nhịp điệu · Công nghệ</span></a><span>Thanh âm Việt, tiếp nối từ bạn.</span><a href="#lp-title">Về đầu trang ↑</a></footer></>;
}
