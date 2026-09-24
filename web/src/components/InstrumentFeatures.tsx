import { ArrowUpRight, ArrowRight } from 'lucide-react';

const features = [
  { id: 'sao', name: 'Sáo trúc', title: 'Gửi giai điệu vào một hơi thở.', description: 'Một ống trúc mộc mạc, một thế giới thanh âm. Làm quen với hơi thổi, cách đặt tay và những giai điệu đầu tiên.', image: 'sao-truc-editorial.png', tag: 'Bộ hơi · Mộc mạc & trong trẻo' },
  { id: 'nguyet', name: 'Đàn nguyệt', title: 'Chạm dây đàn, ngân nét Việt.', description: 'Từ dáng đàn tròn đến tiếng ngân sáng rõ, tìm hiểu đàn nguyệt và khám phá lộ trình học dành cho bạn.', image: 'dan-nguyet-editorial.png', tag: 'Bộ dây · Vang sáng & giàu biểu cảm' },
  { id: 'tranh', name: 'Đàn tranh', title: 'Từng dây đàn, một sắc thái.', description: 'Khám phá tiếng đàn thanh thoát cùng nghệ thuật nhấn, rung và luyến. Bắt đầu từ những chuyển động nhỏ của đôi tay.', image: 'dan-tranh-editorial.png', tag: 'Bộ dây · Mềm mại & tinh tế' },
];

export function InstrumentFeatures() {
  return <section className="instrument-features" aria-label="Tìm nhạc cụ dành cho bạn">
    <header><span className="section-kicker">Tìm thanh âm của bạn</span><h2>Mỗi nhạc cụ, một khởi đầu.</h2></header>
    {features.map((item, index) => <article key={item.id} className={`instrument-feature feature-${index}`}>
      <figure><img src={`/images/generated/${item.image}`} alt={`Minh họa ${item.name} trong ánh sáng ấm`} width="1536" height="1024" loading="lazy"/><figcaption>Ảnh minh họa</figcaption></figure>
      <div className="feature-copy"><p className="feature-name">{item.name}</p><h3>{item.title}</h3><p className="feature-caption">{item.tag.split(' · ')[1]}</p><div className="feature-actions"><a className="primary" href={`/learn/${item.id}`}>Bắt đầu học <ArrowUpRight size={17} aria-hidden="true" /></a><a className="feature-detail" href={`/explore/${item.id}`}>Câu chuyện nhạc cụ <ArrowRight size={15} aria-hidden="true" /></a></div></div>
    </article>)}
  </section>;
}
