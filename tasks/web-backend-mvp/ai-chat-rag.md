# AI Chat + RAG — 09/10/2026

Nhánh `feature/ai-chat-rag` nối tiếp auth và catalog/payment mẫu. Nút “Hỏi về sáo” trên Học tập/bài học đóng mặc định. Theo phản hồi ngày 09/10, panel chat dùng nền trắng, tin nhắn người dùng bên phải màu xanh, AI bên trái màu nhạt; giữ Playfair Display và Be Vietnam Pro. Câu hỏi hiện ngay khi gửi, có trạng thái đang trả lời. Không thêm trang hay khối giới thiệu dài. Giữ nguyên giao diện phần còn lại và các file hệ thống thiết kế hiện có.

Người học đăng nhập để hỏi. Câu trả lời hiển thị text và link tài liệu; thiếu nguồn báo rõ. Câu hỏi được giữ khi gửi lỗi để thử lại; có loading, timeout, đóng bằng Escape và trả focus về nút mở. Tối đa 600 ký tự/câu hỏi, 8 lượt trong phiên trang, không gửi lịch sử/model/user ID tới API. Logout đổi phiên và hủy request cũ. Client không có OpenRouter key.

Backend dùng tài liệu sáo Approved và Theory người dùng được xem; loại Quiz, đáp án, khóa nháp và bài trả phí chưa mở. Bổ sung đoạn tổng quan/cấu tạo từ bài Khám phá công khai, link `/explore/sao`. Sửa lỗi stop-word xóa hết câu “Sáo trúc là gì”; kiểm thử cả có/không dấu và câu ngoài phạm vi. Truy hồi tối đa 5 đoạn/2.400 ký tự; cache DB 24 giờ theo user/quyền/corpus/model. Giới hạn lượt/token lưu DB; không có nguồn thì không gọi AI. OpenRouter miễn phí, không fallback trả phí.

Chat đang là demo Development. Production chờ quyền Plus từ thanh toán đã xác minh; thanh toán mẫu không mở Chat Plus. Chi tiết hợp đồng, cấu hình, migration và lệnh kiểm tra ở `Vrythm-Backend/docs/web-backend-mvp/ai-chat-rag.md`.

Kiểm tra sau sửa chat nền trắng: affected UI 15 đạt tại desktop 1440×900, tablet 768×1024, mobile 390×844. Đã xem ảnh và kiểm tra nền trắng, tin nhắn hai bên, font, bounds, overflow, nút/link ≥44px, câu hỏi đang chờ và link giới thiệu công khai. Impeccable finish review: ship, không có material fixes; detector không có findings. Build web đạt, còn cảnh báo bundle >500KB có từ trước. Những thay đổi audio/calibration riêng vẫn ở checkout, không thuộc feature này.

Bản staged được xuất ra thư mục riêng để kiểm tra đúng mã sẽ commit: build đạt; full Chromium 81 đạt, 6 opt-in bỏ qua. Không chứa các thay đổi audio/calibration riêng. Backend 32 test đạt, 6 opt-in bỏ qua; HTTP test xác nhận câu định nghĩa trả nguồn `/explore/sao`. Web–API bridge 3 test đạt ở bản triển khai đầu (SQLite/model fixture), không chạy lại trong lượt sửa. Không gọi lại OpenRouter thật trong lượt này.

Full UI phát hiện auth mobile tràn ngang 4px; tái hiện ở bản trước sửa chat. Sửa riêng cột grid bằng `minmax(0,1fr)` để vừa viewport, không đổi thiết kế. Affected auth 3 viewport và full UI đều đạt sau sửa.

OpenRouter thật đã trả lời tài liệu tổng hợp: 502 prompt +135 completion token, khoảng 3 giây. Lần so baseline tiếp theo gặp429; chưa đo mức tiết kiệm token so toàn corpus. Provider miễn phí có thể hết hạn mức; không cam kết độ trễ. Chưa áp dụng migration/seed vào PostgreSQL người dùng; restart API hiện tại để nạp feature sau khi chuẩn bị DB local.
