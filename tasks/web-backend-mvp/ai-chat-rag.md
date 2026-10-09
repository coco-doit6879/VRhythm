# AI Chat + RAG — 09/10/2026

Nhánh `feature/ai-chat-rag` nối tiếp auth và catalog/payment mẫu. Nút “Hỏi về sáo” trên Học tập/bài học đóng mặc định; mở một panel nhỏ dùng màu xanh đậm/vàng, Playfair Display và Be Vietnam Pro hiện có. Không thêm trang hay khối giới thiệu dài. Impeccable finish review: ship cho phần mở rộng này, không có material fixes; detector không có findings. Giữ nguyên các file hệ thống thiết kế hiện có.

Người học đăng nhập để hỏi. Câu trả lời hiển thị text và link tài liệu; thiếu nguồn báo rõ. Câu hỏi được giữ khi gửi lỗi để thử lại; có loading, timeout, đóng bằng Escape và trả focus về nút mở. Tối đa 600 ký tự/câu hỏi, 8 lượt trong phiên trang, không gửi lịch sử/model/user ID tới API. Logout đổi phiên và hủy request cũ. Client không có OpenRouter key.

Backend dùng tài liệu sáo Approved và Theory người dùng được xem; loại Quiz, đáp án, khóa nháp và bài trả phí chưa mở. Truy hồi từ khóa tiếng Việt có/không dấu, tối đa 5 đoạn/2.400 ký tự; cache DB 24 giờ theo user/quyền/corpus/model. Giới hạn lượt/token lưu DB; không có nguồn thì không gọi AI. OpenRouter miễn phí, không fallback trả phí.

Chat đang là demo Development. Production chờ quyền Plus từ thanh toán đã xác minh; thanh toán mẫu không mở Chat Plus. Chi tiết hợp đồng, cấu hình, migration và lệnh kiểm tra ở `Vrythm-Backend/docs/web-backend-mvp/ai-chat-rag.md`.

Kiểm tra: affected UI 12 đạt; web ↔ API thật/SQLite/model fixture 3 đạt; full Chromium checkout 84 đạt, 6 opt-in bỏ qua tại desktop 1440×900, tablet 768×1024, mobile 390×844. Đã xem ảnh và kiểm tra vị trí, font, overflow, nút/link ≥44px. Build web đạt, còn cảnh báo bundle >500KB có từ trước. Những thay đổi audio/calibration riêng vẫn ở checkout, không thuộc feature này.

Bản staged được xuất ra thư mục riêng để kiểm tra đúng mã sẽ commit: build đạt; full Chromium 78 đạt, 6 opt-in bỏ qua. Không chứa các thay đổi audio/calibration riêng. Backend 28 test đạt, 6 opt-in bỏ qua.

OpenRouter thật đã trả lời tài liệu tổng hợp: 502 prompt +135 completion token, khoảng 3 giây. Lần so baseline tiếp theo gặp429; chưa đo mức tiết kiệm token so toàn corpus. Provider miễn phí có thể hết hạn mức; không cam kết độ trễ. Chưa áp dụng migration/seed vào PostgreSQL người dùng; restart API hiện tại để nạp feature sau khi chuẩn bị DB local.
