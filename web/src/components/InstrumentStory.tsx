import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { Instrument } from '../data/mock';

export function InstrumentStory({ instrument: item }: { instrument: Instrument }) {
  return <main className="story-page">
    <a className="story-back" href="/explore"><ArrowLeft size={16} /> Bộ sưu tập nhạc cụ</a>
    <header className="story-hero">
      <div className="story-intro"><p className="story-label">Hồ sơ di sản / {item.family}</p><h1>{item.name}</h1><p className="story-tone">{item.tone}</p><p className="story-lead">{item.description}</p><a className="story-button" href={`/learn/${item.id}`}>Bắt đầu học <ArrowUpRight size={18} /></a><span className="story-latin">{item.latinName}</span></div>
      <figure className="story-art"><img src={item.transparentImage ?? item.image} alt={item.name} width={['bau','tranh'].includes(item.id) ? 1536 : 1024} height={['bau','tranh'].includes(item.id) ? 1024 : 1536} fetchPriority="high" /><figcaption>{item.name} · {item.family}</figcaption></figure>
    </header>
    <dl className="story-facts">{[['Họ nhạc cụ', item.family],['Không gian văn hóa', item.origin],['Chất liệu chính', item.materials],['Cách tạo âm', item.playingStyle]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <div className="story-reading"><aside><span className="story-label">Đọc câu chuyện</span><nav aria-label="Mục lục nhạc cụ"><a href="#lich-su">01 · Lịch sử & hành trình</a><a href="#van-hoa">02 · Trong đời sống văn hóa</a><a href="#nhan-biet">03 · Dấu hiệu nhận biết</a></nav></aside><article>
      <section id="lich-su"><p className="story-label">01 / Nguồn gốc</p><h2>Lịch sử & hành trình</h2><p>{item.history}</p></section>
      <section id="van-hoa"><p className="story-label">02 / Không gian diễn xướng</p><h2>Trong đời sống văn hóa</h2><p>{item.culturalContext}</p></section>
      <section id="nhan-biet"><p className="story-label">03 / Nhìn gần hơn</p><h2>Dấu hiệu nhận biết</h2><ul>{item.facts.map(fact => <li key={fact}>{fact}</li>)}</ul></section>
      <div className="story-value"><p className="story-label">Giá trị văn hóa</p><p>{item.culturalValue}</p></div>
    </article></div>
    <section className="story-closing"><p className="story-label">Tiếp nối câu chuyện bằng tiếng đàn của bạn</p><h2>Học {item.name.toLocaleLowerCase('vi')}</h2><p>Xem nội dung khóa học, lộ trình và đăng ký học.</p><a className="story-button" href={`/learn/${item.id}`}>Bắt đầu học <ArrowUpRight size={18} /></a></section>
  </main>;
}
