import { ArrowLeft, Sparkles } from 'lucide-react';
import './bamboo-flute-article.css';

const sources = [
  { title: 'Truc flute – Airophone', publisher: 'Viện Âm nhạc Việt Nam', url: 'https://vienamnhac.vn/vietnamese-music-space/museum/musical-instruments/truc-flute-%E2%80%93-airophone', note: 'Cấu tạo, cách diễn tấu và cải tiến sáo mười lỗ.' },
  { title: 'Cây sáo trúc trong dàn nhạc Chèo', publisher: 'Phạm Hữu Dực · Tạp chí Nghiên cứu Sân khấu – Điện ảnh, số 47 (2025)', url: 'https://tapchiskda.vn/skda/article/download/211/89', note: 'Vai trò của sáo trong sân khấu Chèo · PDF.' },
  { title: 'Đưa làn điệu Dọc và Xá trong Chầu Văn vào giảng dạy Sáo Trúc tại Học viện Âm nhạc Quốc gia Việt Nam', publisher: 'Nguyễn Ngọc Xuân · Học viện Âm nhạc Quốc gia Việt Nam', url: 'https://www.vnam.edu.vn/NewsDetail.aspx?ItemID=1309&lang=VN', note: 'Nghiên cứu về chất liệu truyền thống trong đào tạo sáo trúc.' },
  { title: 'Giảng dạy 10 tác phẩm mới cho sinh viên bậc đại học Sáo trúc tại Học viện Âm nhạc Quốc gia Việt Nam', publisher: 'Dương Ngọc Tú · Luận văn thạc sĩ, 2019', url: 'https://www.vnam.edu.vn/Categories.aspx?CatID=12', note: 'Tra cứu trong danh mục nghiên cứu chính thức của Học viện.' },
  { title: 'Dizi (笛子), cuối thế kỷ XIX', publisher: 'The Metropolitan Museum of Art · Hiện vật 89.4.62', url: 'https://www.metmuseum.org/art/collection/search/500635', note: 'Thông tin hiện vật và vai trò của màng rung dimo.' },
];

function Cite({ n }: { n: number }) {
  const source = sources[n - 1];
  return <sup className="flute-cite"><a href={`#nguon-${n}`} aria-label={`Xem tài liệu tham khảo ${n}: ${source.publisher}`} title={source.title}>[{n}]</a></sup>;
}

const sections = [
  ['tong-quan', 'Tổng quan'], ['cau-tao', 'Cấu tạo'], ['van-hoa', 'Trong âm nhạc Việt'],
  ['doi-chieu', 'Sáo trúc & Dizi'], ['hanh-trinh', 'Hành trình tiếp nối'], ['nguon', 'Tài liệu tham khảo'],
];

function FluteDiagram({ comparison = false }: { comparison?: boolean }) {
  return <figure className="flute-diagram">
    <div className="flute-responsive-diagram">
      {(comparison ? ['Sáo trúc Việt Nam', 'Dizi Trung Quốc'] : ['Sáo ngang sáu lỗ']).map((name, row) => <div key={name}>
        <h4>{name}</h4>
        <svg viewBox="0 0 320 90" role="img" aria-label={row === 1 ? 'Dizi có thêm màng dimo ở vị trí số 4.' : 'Sáo với lỗ thổi số 1, sáu lỗ bấm số 2 và lỗ định âm số 3.'}>
          <rect x="8" y="38" width="304" height="22" rx="8" fill="#e9d9a2" stroke="#81734f"/>
          <ellipse cx="45" cy="49" rx="7" ry="5" fill="#4c493a"/>
          {[155,177,199,221,243,265].map(x => <circle key={x} cx={x} cy="49" r="4" fill="#4c493a"/>)}
          <circle cx="293" cy="49" r="3" fill="#4c493a"/>
          {row === 1 && <circle cx="100" cy="49" r="7" fill="#f2cab4" stroke="#955738" strokeWidth="2"/>}
          {[[45,1],[210,2],[293,3],...(row === 1 ? [[100,4]] : [])].map(([x,n]) => <g key={n}><path d={`M${x} 35 V23`} stroke="#596b61"/><text x={x} y="18" textAnchor="middle">{n}</text></g>)}
        </svg>
      </div>)}
      <ol><li>Lỗ thổi</li><li>Sáu lỗ bấm</li><li>Lỗ định âm</li>{comparison && <li>Màng dimo — điểm khác biệt của dizi</li>}</ol>
      {!comparison && <p>Nút chặn nằm trong ống, gần đầu sáo. Luồng hơi hướng vào cạnh lỗ thổi.</p>}
    </div>
    <figcaption>Sơ đồ minh họa giản lược, không theo tỷ lệ; vị trí và số lỗ phụ có thể khác giữa các mẫu sáo. <Cite n={1}/>{comparison && <Cite n={5}/>}</figcaption>
  </figure>;
}

export function BambooFluteArticle() {
  return <main className="flute-article">
    <div className="flute-wrap">
      <a className="flute-back" href="/explore"><ArrowLeft size={16} /> Tất cả nhạc cụ</a>
      <header className="flute-heading">
        <p className="flute-eyebrow"><Sparkles size={14} /> Nhạc cụ Việt Nam / Bộ hơi</p>
        <h1 className="flute-script-title">
          <span className="script-title-green">Sáo trúc</span>
          <span className="script-title-orange">Một hơi thở, một nền văn hóa</span>
        </h1>
        <p className="flute-subtitle">Từ ống trúc mộc mạc đến sân khấu biểu diễn, tiếng sáo giữ một vị trí đặc biệt trong di sản âm nhạc Việt Nam.</p>
      </header>
      <div className="flute-layout">
        <aside className="flute-toc">
          <h3>Nội dung chính</h3>
          <ol>{sections.map(([id, title]) => <li key={id}><a href={`#${id}`}>{title}</a></li>)}</ol>
        </aside>
        <article className="flute-content">
          <section id="tong-quan">
            <p className="flute-eyebrow"><Sparkles size={14} /> 01 / Tổng quan</p><h2>Ống trúc nhỏ, tiếng ngân xa</h2>
            <p>Sáo trúc là nhạc cụ hơi thuộc nhóm sáo ngang, thường được chế tác từ tre, trúc hoặc nứa. Dạng sáu lỗ bấm truyền thống hiện diện trong sinh hoạt dân gian, sân khấu truyền thống và biểu diễn chuyên nghiệp.<Cite n={1}/></p>
            <figure className="flute-photo"><img src="/images/girl_playing_flute.jpg" alt="Một người chơi sáo ngang trong không gian ngoài trời" width="1200" height="800" fetchPriority="high"/><figcaption>Sáo được đặt ngang khi diễn tấu. Ảnh minh họa do nhóm cung cấp.</figcaption></figure>
            <p>Theo Viện Âm nhạc Việt Nam, mẫu sáo truyền thống được mô tả có chiều dài khoảng 40–55 cm, đường kính 1,5–2 cm. Đây là kích thước tham khảo của một dạng sáo, không phải quy chuẩn chung cho mọi cây sáo trúc.<Cite n={1}/></p>
            <p className="flute-note"><strong>Một tên gọi, nhiều biến thể.</strong> Bên cạnh sáo sáu lỗ còn có sáo cải tiến mười lỗ. Số lỗ, kích thước và cao độ có thể thay đổi theo nhu cầu biểu diễn.<Cite n={1}/></p>
          </section>
          <section id="cau-tao">
            <p className="flute-eyebrow"><Sparkles size={14} /> 02 / Cấu tạo</p><h2>Cấu tạo của sáo ngang sáu lỗ</h2>
            <FluteDiagram/>
            <dl className="flute-parts">
              <div><dt><span>01</span>Lỗ thổi</dt><dd>Nằm bên thân ống. Luồng hơi đi qua cạnh lỗ thổi làm cột không khí bên trong dao động.<Cite n={1}/></dd></div>
              <div><dt><span>02</span>Sáu lỗ bấm</dt><dd>Đóng, mở các lỗ bằng ngón tay để thay đổi cao độ khi diễn tấu.<Cite n={1}/></dd></div>
              <div><dt><span>03</span>Lỗ định âm</dt><dd>Ở gần cuối thân sáo, không dùng như lỗ bấm; liên quan đến âm cơ bản của cây sáo.<Cite n={2}/></dd></div>
              <div><dt><span>04</span>Nút chặn / điều chỉnh</dt><dd>Nằm trong ống, gần lỗ thổi; có thể làm bằng bấc hoặc gỗ mềm và dùng để điều chỉnh cao độ.<Cite n={1}/></dd></div>
            </dl>
          </section>
          <section id="van-hoa">
            <p className="flute-eyebrow"><Sparkles size={14} /> 03 / Trong âm nhạc Việt</p><h2>Không chỉ là tiếng sáo độc tấu</h2>
            <div className="flute-culture"><div><p>Trong Chèo, sáo có thể gợi hơi, lấy giọng cho diễn viên, đệm theo giai điệu hát và hòa tấu cùng dàn nhạc. Tiếng sáo còn góp phần diễn tả tâm trạng nhân vật, kết nối phần hát với diễn biến trên sân khấu.<Cite n={2}/></p><p>Người nhạc công không chỉ chơi đúng nốt: họ cần lắng nghe, theo sát giọng hát và xử lý âm sắc phù hợp với từng tình huống biểu diễn.<Cite n={2}/></p></div><figure className="flute-photo"><img src="/images/sao_truc_dan_nhac_cheo.jpg" alt="Nghệ sĩ thổi sáo trên sân khấu, bên cạnh người chơi đàn tranh" width="888" height="555" loading="lazy"/><figcaption>Biểu diễn sáo cùng nhạc cụ dân tộc. Ảnh do nhóm cung cấp; không dùng ảnh để xác định một tiết mục Chèo cụ thể.</figcaption></figure></div>
            <p>Sáo cũng xuất hiện trong hát Văn và dàn nhạc cung đình. Nghiên cứu được Học viện Âm nhạc Quốc gia Việt Nam công bố cho thấy các làn điệu Chầu Văn tiếp tục được khai thác trong giảng dạy sáo trúc.<Cite n={1}/><Cite n={3}/></p>
          </section>
          <section id="doi-chieu">
            <p className="flute-eyebrow"><Sparkles size={14} /> 04 / Sáo trúc & Dizi</p><h2>Sáo trúc Việt Nam & Dizi Trung Quốc</h2>
            <p>Cùng thuộc nhóm sáo ngang và thường làm từ tre, hai nhạc cụ có nét tương đồng về hình dáng. Tuy vậy, cấu tạo và cách xử lý âm thanh tạo nên những bản sắc riêng.<Cite n={1}/><Cite n={5}/></p>
            <div className="flute-paper"><p className="flute-paper-title">Ghi chép bên tiếng sáo</p><div className="flute-table-scroll" role="region" aria-label="Bảng so sánh sáo trúc và dizi"><table><caption>Những điểm nhận biết chính <Cite n={1}/><Cite n={5}/></caption><thead><tr><th scope="col">Đặc điểm</th><th scope="col">Sáo trúc Việt Nam</th><th scope="col">Dizi Trung Quốc</th></tr></thead><tbody>
              <tr><th scope="row">Họ nhạc cụ</th><td><span className="flute-mobile-label">Sáo trúc Việt Nam</span>Sáo ngang</td><td><span className="flute-mobile-label">Dizi Trung Quốc</span>Sáo ngang</td></tr>
              <tr><th scope="row">Chất liệu</th><td><span className="flute-mobile-label">Sáo trúc Việt Nam</span>Tre, trúc, nứa</td><td><span className="flute-mobile-label">Dizi Trung Quốc</span>Thường là tre</td></tr>
              <tr><th scope="row">Lỗ thổi & lỗ bấm</th><td><span className="flute-mobile-label">Sáo trúc Việt Nam</span>Một lỗ thổi; sáu lỗ bấm ở dạng truyền thống, có dạng cải tiến</td><td><span className="flute-mobile-label">Dizi Trung Quốc</span>Có lỗ thổi và hệ thống lỗ bấm</td></tr>
              <tr><th scope="row">Màng rung</th><td><span className="flute-mobile-label">Sáo trúc Việt Nam</span>Không phải đặc điểm tiêu biểu của dạng sáo đang giới thiệu</td><td><span className="flute-mobile-label">Dizi Trung Quốc</span>Có lỗ phủ màng dimo</td></tr>
              <tr><th scope="row">Âm sắc</th><td><span className="flute-mobile-label">Sáo trúc Việt Nam</span>Được định hình qua hơi thổi và kỹ thuật diễn tấu</td><td><span className="flute-mobile-label">Dizi Trung Quốc</span>Màng dimo góp phần tạo tiếng rung đặc trưng</td></tr>
              <tr><th scope="row">Không gian âm nhạc</th><td><span className="flute-mobile-label">Sáo trúc Việt Nam</span>Dân gian, Chèo, hát Văn, cung đình và sân khấu chuyên nghiệp</td><td><span className="flute-mobile-label">Dizi Trung Quốc</span>Trong đó có sân khấu Kunqu (Côn khúc)</td></tr>
            </tbody></table></div></div>
            <FluteDiagram comparison/>
            <h3>Màng dimo — một khác biệt đáng nghe</h3>
            <p>Hiện vật dizi cuối thế kỷ XIX tại The Metropolitan Museum of Art có thêm một lỗ phủ màng mỏng lấy từ phía trong thân tre. Theo bảo tàng, màng này tạo tiếng rung đặc trưng và giúp tăng âm lượng. Dizi loại này từng được sử dụng trong sân khấu Kunqu.<Cite n={5}/></p>
            <p>Vì vậy, hình dáng gần nhau không đồng nghĩa với cùng một thẩm mỹ âm thanh. So sánh cấu tạo là cách để hiểu sự đa dạng, không phải để xếp hạng hai truyền thống.</p>
          </section>
          <section id="hanh-trinh">
            <p className="flute-eyebrow"><Sparkles size={14} /> 05 / Hành trình tiếp nối</p><h2>Một hành trình vẫn tiếp diễn</h2>
            <p>Sáo trúc không dừng lại ở một hình mẫu bất biến. Sự phát triển của nhạc cụ gắn với công việc biểu diễn, sáng tác, cải tiến và truyền dạy qua nhiều thế hệ.</p>
            <div className="flute-timeline"><div><span>Cải tiến nhạc cụ</span><h3>Từ sáu đến mười lỗ</h3><p>Viện Âm nhạc Việt Nam ghi nhận vào cuối thập niên 1970, Đinh Thìn và Ngô Nam cải tiến sáo sáu lỗ thành mười lỗ để mở rộng âm vực, tạo thuận lợi khi diễn tấu tác phẩm mới.<Cite n={1}/></p></div><div><span>Tác phẩm & nghệ sĩ</span><h3>Mở rộng ngôn ngữ biểu diễn</h3><p><em>Tiếng gọi mùa xuân</em> của Đinh Thìn và <em>Tình quê</em> của Hoàng Đạm được Viện Âm nhạc nhắc đến khi giới thiệu khả năng của sáo cải tiến.<Cite n={1}/></p></div><div><span>Nghiên cứu & truyền dạy</span><h3>Tiếp nối trong đào tạo</h3><p>Danh mục nghiên cứu của Học viện Âm nhạc Quốc gia Việt Nam ghi nhận luận văn năm 2019 của Dương Ngọc Tú về giảng dạy mười tác phẩm mới cho sinh viên đại học sáo trúc. Bên cạnh bài bản cổ truyền, tác phẩm mới tiếp tục là một hướng nghiên cứu và đào tạo.<Cite n={4}/></p></div></div>
          </section>
          <section id="nguon" className="flute-sources"><p className="flute-eyebrow"><Sparkles size={14} /> 06 / Đọc thêm từ nguồn gốc</p><h2>Tài liệu tham khảo</h2><p>Bấm số trích dẫn để đến tài liệu tương ứng tại đây; bấm tên tài liệu để mở nguồn ở thẻ mới. Nội dung được biên tập từ tài liệu nhóm cung cấp và đối chiếu với các nguồn dưới đây.</p><ol>{sources.map((source, index) => <li key={source.url} id={`nguon-${index + 1}`} tabIndex={-1}><span className="flute-source-number">[{index + 1}]</span><div><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <span aria-hidden="true">↗</span><span className="flute-sr-only"> (mở thẻ mới)</span></a><p>{source.publisher}</p><small>{source.note}</small></div></li>)}</ol><p className="flute-image-credit">Ảnh: tư liệu do nhóm cung cấp. Chưa có thông tin tác giả hoặc giấy phép kèm theo; cần bổ sung ghi công và xác nhận quyền sử dụng trước khi xuất bản chính thức.</p></section>
          <section className="flute-learn"><p className="flute-eyebrow"><Sparkles size={14} /> Từ tìm hiểu đến thực hành</p><h2>Để tiếng sáo bắt đầu từ bạn.</h2><p>Xem nội dung và lộ trình học sáo trúc trước khi bắt đầu.</p><a href="/learn/sao">Bắt đầu học sáo trúc <span aria-hidden="true">↗</span></a></section>
        </article>
      </div>
    </div>
  </main>;
}
