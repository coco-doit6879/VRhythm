# Sáo trúc và thanh toán mẫu

Nhánh: `feature/payments-flute-catalog` trong cả hai repo; kế thừa identity từ `feature/auth-google`. Giữ thiết kế hiện tại, chỉ hiển thị khóa sáo trúc ở phần Học tập. Trang chủ/Khám phá và các trang giới thiệu giữ đủ nhạc cụ; chỉ liên kết học nhạc cụ chưa có nội dung mới báo chưa mở.

## Phạm vi đã làm

- `/packages`: Miễn phí và Plus **59.000đ / 30 ngày**, không tự gia hạn; hiển thị các bài thuộc từng gói từ API.
- Đăng nhập trước khi tạo lượt thử. Tạo đơn, thử thành công/thất bại/hủy, tải lại theo URL vẫn xem được kết quả.
- Giá và thời hạn do server quyết định; requestId chống tạo trùng; chỉ chủ đơn được xem/cập nhật.
- Trạng thái: Pending → DemoSucceeded / Failed / Cancelled / Expired. Hết hạn sau 30 phút. Gửi lại cùng kết quả không xử lý lại; đơn kết thúc không đổi kết quả.
- **Thanh toán mẫu không thu tiền, không cấp quyền Plus.** Endpoint mock mở khóa cũ đã bị vô hiệu hóa. Không có trạng thái Paid hoặc webhook giả.
- Seed bổ sung 3 khóa sáo: Luyện nốt đầu tiên (miễn phí), Hơi đều và chuyển nốt, Luyện câu nhạc (Plus). Seed lại không nhân đôi. Theory/Quiz/Practical có dữ liệu khớp nốt và đáp án; Video chỉ gắn khi thư viện hiện có video sáo trúc đã duyệt để tái sử dụng, giữ đúng loại media.

## API

| Method | Route | Quyền |
|---|---|---|
| GET | `/api/billing/packages` | Công khai |
| POST | `/api/billing/orders` | Đăng nhập; packageCode, requestId |
| GET | `/api/billing/orders/{id}` | Chủ đơn |
| POST | `/api/billing/orders/{id}/demo` | Chủ đơn; outcome: success / failed / cancelled |

Tạo/cập nhật đơn chỉ mở khi môi trường Development và `Billing:DemoEnabled=true`; production trả 503 dù bật cấu hình. Cấu hình mẫu mặc định false. Web gọi `VITE_API_BASE_URL`; không chứa khóa của cổng thanh toán.

## Database và việc còn lại

Migration `20261009091330_AddDemoCheckoutOrders` đã tạo, model không còn thay đổi chưa có migration. **Chưa áp dụng migration/seed vào PostgreSQL thực tế trên máy** vì PostgreSQL/Docker đang dừng. Khi database local sẵn sàng, áp dụng migration rồi chạy seed trên local; không seed remote/live. Seeder cần Instructor và Admin đang hoạt động; dữ liệu thư viện hiện có được giữ nguyên.

payOS sẽ bổ sung sau khi có tài khoản: tạo payment link, xác minh webhook/amount, chống lặp, cấp quyền trong transaction và kiểm tra quyền theo thời hạn. Không coi redirect success là bằng chứng thanh toán. Chưa triển khai thu tiền, quyền Plus, tự gia hạn, AI/RAG hoặc dashboard ở nhánh này.

## Kiểm tra

- Backend build đạt; 22 test đạt, 4 bỏ qua (3 PostgreSQL opt-in, 1 host kiểm tra trình duyệt opt-in).
- API HTTP với SQLite quan hệ kiểm tra giá giả, quyền chủ đơn, chống trùng, hết hạn, kết quả lặp, production gate và seed idempotent.
- Web: 45 affected UI test đạt. Sau chỉnh màu liên kết, 15 affected UI test đạt. Toàn bộ Chromium: 72 đạt, 3 bỏ qua (API thật chạy riêng và đã đạt 3/3). Đã xem screenshot desktop/mobile và kiểm tra geometry cả ba kích thước.
- Web → API thật: 3 test đạt ở 1440×900, 768×1024, 390×844; đăng nhập, tạo đơn, hoàn tất demo, tải lại và xác nhận bài Plus vẫn khóa. Host chỉ chạy 110 giây trên loopback với SQLite riêng, không mock response. Đây chưa phải kiểm tra PostgreSQL hoặc payOS.

- Bản export từ staged Git tree (không chứa thay đổi âm thanh/calibration chưa commit): web build đạt, full Chromium 66 đạt/3 bỏ qua. Lượt đầu có một lỗi mạng trình duyệt net::ERR_NO_BUFFER_SPACE; trace xác định lỗi tải styles.css, lượt full chạy lại đạt toàn bộ. Workspace có thêm 6 test âm thanh local nên tổng trước đó là 72; chúng không được gộp vào nhánh này.
