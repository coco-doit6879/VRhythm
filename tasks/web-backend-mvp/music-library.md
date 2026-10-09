# Thư viện âm nhạc — feature/music-library

Trang web `/library` và `/library/:songId`: danh sách tìm theo tên không dấu, sheet nền trắng, nghe mẫu, dừng/về đầu và tốc độ 0,75×–1,25×. Giữ màu xanh/vàng, typography và điều hướng hiện tại. Không cần đăng nhập để đọc các bản luyện công khai.

Thư viện dùng VexFlow 5.0.0 để khắc nhạc SVG với font Bravura tích hợp: các ô nhịp nối thành hệ thống (tối đa 4 ô/dòng, tự giảm theo chiều rộng và mật độ nốt), khóa Sol ở đầu dòng, số chỉ nhịp ở đầu bài, số ô đầu dòng, nốt móc nối nhóm theo phách, dấu lặng, chấm dôi, dấu hóa, dấu lấy hơi, luyến và vạch kết thúc. Font được đóng gói cùng thư viện, không phụ thuộc ký tự nhạc hệ điều hành. Đây là một bè giai điệu sáo; ảnh tham chiếu Swan Lake có hai khuông piano, không thêm bè đệm giả vào bản sáo.

VexFlow nằm trong chunk Thư viện tải theo route. Âm thanh vẫn dùng `PhysicalFluteEngine` production và `buildScoreTimeline`; không thay đổi cao độ/trường độ trong JSON, engine calibration/experimental hoặc quyền khóa học. Note SVG giữ index nguồn cho con trỏ và tô sáng đồng bộ AudioContext, không khắc lại sheet từng frame. Practical hiện có vẫn dùng renderer riêng.

Nội dung khởi đầu:

- Lý cây xanh: tái sử dụng JSON mobile `app/components/lesson/lycayxanh.json`.
- Bèo dạt mây trôi: tái sử dụng JSON production `web/src/audio/sheets/beoDatMayTroi.json`.
- Bắc kim thang: bản luyện đơn âm mới, chuyển giai điệu lên một quãng tám và giản lược nhịp. Tham khảo bản phổ dân ca Nam Bộ ở [Hợp Âm Việt](https://hopamviet.vn/sheet/song/bac-kim-thang/W8IUWUZZ.html). Không sao chép ảnh bản phổ/lời bài hát vào ứng dụng. Đây là bản luyện, chưa có xác nhận của giảng viên âm nhạc.

Đây là catalog tĩnh công khai trên web. Không seed dữ liệu vào database hoặc thay đổi quyền khóa học. Các bản nhạc pop/nhạc quốc tế trong lab chưa được đưa vào thư viện.

Kiểm tra: build, kiểm tra PCM từng bản nhạc và Playwright desktop/tablet/mobile cho tìm kiếm, route trực tiếp, sheet, phát thật qua AudioContext, tốc độ và dừng khi chuyển trang. Kiểm tra ảnh chụp, tràn ngang, vùng chạm và trạng thái không tìm thấy.

Kết quả kiểm tra bản thay đổi đã chọn, dùng engine production đã commit: build thành công; 9 kiểm tra UI Thư viện liên quan đạt sau khi thay renderer; full Chromium 1440×900, 768×1024, 390×844: 90 đạt, 6 bài real API opt-in bỏ qua; audio: 9 đạt. Đã xem ảnh desktop/tablet/mobile và kiểm tra không tràn ngang, sheet trắng, nút ≥44px. Fixture audio cũ đã được cập nhật theo PCM waveguide production (copyToChannel và không dùng oscillator cho sáo). Không thay đổi engine, calibration hoặc preset đang làm dở.

Nguồn API renderer: [VexFlow 5 entry và font](https://vexflow.github.io/vexflow-examples/demos/entry/vexflow/), [Beam](https://vexflow.github.io/vexflow-docs/api/5.0.0/classes/Beam.html), [Curve](https://vexflow.github.io/vexflow-docs/api/5.0.0/classes/Curve.html). Kiểm tra regression thêm: Đô giữa C4 dưới dòng Mi4 một khoảng dòng kẻ phụ (10px trong hệ tọa độ VexFlow), chỉ một số chỉ nhịp, dấu thăng, nhóm móc, nhiều ô/dòng và audio có tín hiệu thực. Dữ liệu bài hát giữ nguyên; kiểm tra rendering không xác nhận độ chính xác ký âm của các JSON nguồn.
