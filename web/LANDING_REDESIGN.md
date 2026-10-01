# VRhythm — landing page giấy dó

## Chạy và kiểm tra

```sh
cd web
npm install
npm run dev
npm run build
npm run test:audio
```

Kiểm thử âm thanh dùng Node >= 22.6 (type stripping); môi trường thực hiện dùng Node 24.15.

## Phạm vi

Trang chủ ở `src/components/landing/LandingPage.tsx`. Giữ routing và dữ liệu trong `App.tsx`, `data/mock.ts`, các trang học, khám phá, đăng nhập và phần Expo/native. Header có trạng thái khi cuộn chỉ trên home; styles mới được giới hạn trong `.landing-shell` / `.lp`.

Các section: `Hero`, `StringCanvas` (lazy), `InstrumentIndex`, `InstrumentChapter`, `QuoteSection`, `FinalCTA`. Màu, font và spacing trong `components/landing/landing.css`.

- Nền xanh rêu đen `#182b24`, chữ kem `#efe5ce`, chữ phụ `#bdbaa9`, vàng đồng `#c6a16a`. Các chương dùng olive/nâu/xanh trầm; đoạn trích giữ nền kem với chữ xanh mực.
- Playfair Display cho heading, Be Vietnam Pro cho UI; Bachelorette sẵn trong repo chỉ dùng ở “thanh âm”. Google Fonts dùng `display=swap` và font dự phòng. Có thể tự host font về sau.
- Texture SVG rất nhẹ; ảnh WebP được lấy trực tiếp từ dữ liệu trang Khám phá (`transparentImage`), đồng bộ ở mục lục, hover, accordion, các chương và CTA cuối. Không dùng ảnh editorial giả lập hoặc nhãn “Ảnh minh họa” trên home.
- Canvas 2D là phác thảo tương tác tám dây ngũ cung, không phải sơ đồ cấu tạo hay mô phỏng chính xác đàn tranh.
- Desktop: Lenis + GSAP ScrollTrigger; mỗi chương ghim thêm nửa chiều cao viewport. Dưới 900px hoặc `prefers-reduced-motion: reduce`: không Lenis, không pin/scrub/parallax. Nội dung vẫn hiển thị.
- Dưới 621px: mục lục có accordion. Link tên nhạc cụ vẫn vào câu chuyện, nút dấu cộng mở ảnh và mô tả.
- Hover reveal theo con trỏ, xem ảnh bằng focus bàn phím, phím gảy nốt bằng Enter/Space, nút âm thanh có `aria-pressed`, focus ring và ảnh có alt.

Thư viện thêm: `gsap`, `@gsap/react`, `lenis`. Không thêm Tone.js hoặc thư viện 3D.

## Dữ liệu và tài nguyên còn thiếu

**Repo hiện có sáu bản ghi nhạc cụ**, dù tiêu đề carousel cũ ghi bảy: `nguyet`, `tyba`, `nhi`, `bau`, `sao`, `tranh`. Mục lục và số điểm tiến độ lấy trực tiếp sáu bản ghi này. Không tạo bản ghi hoặc đường dẫn giả cho nhạc cụ thứ bảy.

Ảnh đàn đáy `public/images/Dan_Day_Transparent.png` có sẵn nhưng **thiếu bản ghi đàn đáy và thông tin được xác nhận trong `data/mock.ts`**. Khi dữ liệu và route của nhạc cụ thứ bảy sẵn sàng, thêm bản ghi vào nguồn chung, thêm kích thước ảnh vào `landing/instruments.tsx` và đặt `transparentImage` của bản ghi trỏ tới ảnh dùng chung với trang Khám phá.

Không thiếu ảnh để chạy sáu nhạc cụ hiện tại. Trang chủ dùng chung `transparentImage` trong dữ liệu với trang Khám phá. Các đường dẫn ảnh hiện tại:

| ID | Ảnh | Route câu chuyện | Route học |
|---|---|---|---|
| nguyet | `public/images/generated/carousel-nguyet.webp` | `/explore/nguyet` | `/learn/nguyet` |
| tyba | `public/images/generated/carousel-tyba.webp` | `/explore/tyba` | `/learn/tyba` |
| nhi | `public/images/generated/carousel-nhi.webp` | `/explore/nhi` | `/learn/nhi` |
| bau | `public/images/generated/carousel-bau.webp` | `/explore/bau` | `/learn/bau` |
| sao | `public/images/generated/carousel-sao.webp` | `/explore/sao` | `/learn/sao` |
| tranh | `public/images/generated/carousel-tranh.webp` | `/explore/tranh` | `/learn/tranh` |

**Thiếu bản thu nốt riêng cho từng nhạc cụ.** Đặt MP3 ở:

```text
web/public/audio/{instrumentId}/{note}.mp3
# Ví dụ:
web/public/audio/tranh/C4.mp3
web/public/audio/sao/A4.mp3
web/public/audio/nguyet/C4.mp3
```

Hero dùng `tranh`: C4, D4, E4, G4, A4, C5, D5, E5. Mục lục hiện dùng lần lượt nguyet/C4, tyba/D4, nhi/E4, bau/G4, sao/A4, tranh/C5. Có thể cung cấp toàn bộ tám nốt cho mỗi ID để mở rộng. Các file OGG chung có sẵn chưa được xác nhận là bản thu đúng nhạc cụ nên không tự dùng thay cho chúng.

## Âm thanh và vòng đời

`src/audio/instrumentSynth.ts` cung cấp `playNote(instrumentId, note)`. Mặc định tắt; chỉ tạo/resume AudioContext từ nút bật tiếng. Dây gảy dùng oscillator + envelope giảm nhanh + lọc low-pass. Sáo dùng sine, vibrato và noise band-pass. Đây là âm tổng hợp gợi âm sắc, không thay thế bản thu nhạc cụ.

Lần đầu gặp một cặp nhạc cụ/nốt, phát synth ngay để dây rung đồng bộ và tìm MP3 ở nền. Khi tải/giải mã xong, những lần gảy tiếp theo dùng bản thu. File thiếu, lỗi hoặc máy chủ trả HTML đều fallback; kết quả được cache trong phiên. Tối đa tám giọng, hủy giọng cũ khi vượt giới hạn; ngắt node khi kết thúc, tắt tiếng hoặc rời trang; hủy fetch và đóng context khi unmount. Canvas hủy RAF/ResizeObserver; useGSAP và matchMedia thu hồi pin/timeline/ticker/Lenis, tương thích StrictMode.

## Xác nhận

- Production build TypeScript + Vite đạt.
- Sáu test âm thanh đạt: opt-in/mute, giới hạn giọng, cleanup, sample fallback/cache, ưu tiên bản thu đã tải, abort/dispose và parse nốt.
- Kiểm tra trình duyệt ở viewport 1440px, 768px, 375px; không tràn ngang ở tablet/mobile.
- Đã thử nút tiếng, gảy bằng click/Enter, accordion mobile, menu, CTA `/learn`, `/login`, và liên kết chương.
- Reduced motion có nhánh CSS/GSAP tĩnh; chưa giả lập được tùy chọn hệ điều hành trong trình duyệt kiểm thử. Chưa đánh giá âm sắc bằng bản thu tham chiếu hoặc đo Lighthouse trên thiết bị thật.

Có thể mở rộng bằng bản thu thật, ảnh chụp độ phân giải cao, dữ liệu nhạc cụ thứ bảy; chỉ cân nhắc 3D khi có model phù hợp.
