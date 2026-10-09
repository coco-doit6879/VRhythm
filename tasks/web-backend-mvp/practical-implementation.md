# Practical realtime — feature/practical-realtime

Thêm biểu đồ đường 10 giây gần nhất ngay dưới phần đọc nốt, giữ màu/bố cục bài học hiện tại. Nét liền là cao độ đo được; nét đứt là nốt mục tiêu tại thời điểm đó. Trục theo cao độ âm nhạc để C4 và C5 cách nhau đúng một octave. Nhãn dùng kích thước chữ cố định để đọc được trên mobile. Giữ readout và lời nhắc cao/thấp hiện có; người học không cần đọc biểu đồ để luyện tập.

Thêm meter RMS nhỏ; biểu đồ cập nhật tối đa 10 lần/giây và giữ tối đa 110 sample. Khoảng im lặng hoặc frame bị gián đoạn ngắt đường đo được. Khi thu lại/xóa lượt, lịch sử được reset. Khi dừng/ẩn tab/chuyển bài, stream, context và frame được giải phóng. Không lưu âm thanh hoặc thay thuật toán theo dõi/chấm nốt.

Backend không cần sửa hợp đồng: nốt mục tiêu lấy từ expectedNotes có sẵn, submit và chấm vẫn dùng endpoint Practical hiện tại. Không thêm endpoint tải âm thanh, schema hoặc dependency chart.

Kiểm tra: 3 unit test đạt (octave, RMS, silence/frame gap, bounded history); fake microphone Playwright tại 1440×900, 768×1024, 390×844 kiểm tra chuyển C4→C5, dừng, reset, ẩn tab, unmount và geometry. Build và tổng 54 UI test đạt. Đã xem screenshot mobile sau chỉnh nhãn. Cần thử riêng microphone và sáo thật trên thiết bị người học; tín hiệu sine tự động không đại diện cho môi trường thực tế.
