# Thư viện âm nhạc — feature/music-library

Trang web `/library` và `/library/:songId`: danh sách tìm theo tên không dấu, sheet nền trắng, nghe mẫu, dừng/về đầu và tốc độ 0,75×–1,25×. Giữ màu xanh/vàng, typography và điều hướng hiện tại. Không cần đăng nhập để đọc các bản luyện công khai.

Tái sử dụng `WebSheetMusic` của Practical; bổ sung số chỉ nhịp theo metadata, chấm dôi, dấu thăng/giáng, dấu lặng, hai móc cho nốt 16 và đường luyến. Sheet chia theo ô nhịp, con trỏ đồng bộ với AudioContext; cuộn trong vùng sheet. Engine phát là `PhysicalFluteEngine` production trên Git, dùng `buildScoreTimeline`; không thêm engine calibration/experimental và không đổi engine hiện có. Chưa thêm microphone/chấm điểm trong thư viện.

Nội dung khởi đầu:

- Lý cây xanh: tái sử dụng JSON mobile `app/components/lesson/lycayxanh.json`.
- Bèo dạt mây trôi: tái sử dụng JSON production `web/src/audio/sheets/beoDatMayTroi.json`.
- Bắc kim thang: bản luyện đơn âm mới, chuyển giai điệu lên một quãng tám và giản lược nhịp. Tham khảo bản phổ dân ca Nam Bộ ở [Hợp Âm Việt](https://hopamviet.vn/sheet/song/bac-kim-thang/W8IUWUZZ.html). Không sao chép ảnh bản phổ/lời bài hát vào ứng dụng. Đây là bản luyện, chưa có xác nhận của giảng viên âm nhạc.

Đây là catalog tĩnh công khai trên web. Không seed dữ liệu vào database hoặc thay đổi quyền khóa học. Các bản nhạc pop/nhạc quốc tế trong lab chưa được đưa vào thư viện.

Kiểm tra: build, kiểm tra PCM từng bản nhạc và Playwright desktop/tablet/mobile cho tìm kiếm, route trực tiếp, sheet, phát thật qua AudioContext, tốc độ và dừng khi chuyển trang. Kiểm tra ảnh chụp, tràn ngang, vùng chạm và trạng thái không tìm thấy.

Kết quả kiểm tra bản thay đổi đã chọn, dùng engine production đã commit: build thành công; 12 kiểm tra UI liên quan đạt; full Chromium 1440×900, 768×1024, 390×844: 90 đạt, 6 bài real API opt-in bỏ qua; audio: 9 đạt. Đã xem ảnh desktop/tablet/mobile và kiểm tra không tràn ngang, sheet trắng, nút ≥44px. Fixture audio cũ đã được cập nhật theo PCM waveguide production (copyToChannel và không dùng oscillator cho sáo). Không thay đổi engine, calibration hoặc preset đang làm dở.
