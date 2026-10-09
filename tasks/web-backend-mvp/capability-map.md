# Web + backend MVP — 09/10/2026

Phạm vi: web người học và backend hiện có, ưu tiên sáo trúc. Giữ thiết kế giản đơn đã thống nhất. Không triển khai mobile trong đợt này.

## Các module và nhánh

| Module | Nhánh trong cả hai repo | Trách nhiệm | Phụ thuộc |
|---|---|---|---|
| identity | `feature/auth-google` | Email/password, Google thật, phiên đăng nhập và phân quyền | — |
| admin-analytics | `feature/admin-analytics` | Ghi nhận lượt xem/tương tác và dashboard admin | identity |
| billing-flute-catalog | `feature/payments-flute-catalog` | Gói bài tập, thanh toán, quyền truy cập, seed sáo và ẩn nhạc cụ khác | identity |
| practice-feedback | `feature/practical-realtime` | Biểu đồ cao độ realtime, mức micro, giữ chấm nốt hiện có | — |
| rag-chat | `feature/ai-chat-rag` | Chat theo tài liệu sáo trúc, trích nguồn, OpenRouter tùy chọn | identity, billing-flute-catalog |

Ưu tiên hiện tại: identity → billing-flute-catalog; admin-analytics và rag-chat làm sau. Practical có thể nghiệm thu độc lập vì phân tích micro chạy trong trình duyệt.

## Quyết định

- Practical dùng **LineChart cao độ theo thời gian**: đường cao độ đo được và đường cao độ mục tiêu. Dùng thang nốt/semitone để dễ so sánh; hiển thị sai lệch cents khi có tín hiệu ổn định. Khoảng im lặng là khoảng trống, không nối thành nốt giả. Mức âm lượng chỉ là chỉ báo micro nhỏ, không thay thế biểu đồ cao độ.
- Không gửi âm thanh micro lên backend. Biểu đồ là phản hồi luyện tập, không thay đổi tiêu chí chấm hiện có. Backend tiếp tục xác thực quyền học và lưu kết quả.
- Chỉ đưa sáo trúc lên các trang người học; ẩn entry/danh sách các nhạc cụ khác, không xóa dữ liệu. Quyết định route cũ hiển thị thông báo chưa mở để tránh liên kết hỏng; admin vẫn quản lý được dữ liệu.
- Plus đã chốt 59.000đ cho 30 ngày, không tự gia hạn. Hiện triển khai thanh toán mẫu không thu tiền/cấp quyền; payOS sẽ nối sau khi có tài khoản. Danh sách bài do API trả về.
- RAG giúp chọn ngữ cảnh liên quan, **không tự bảo đảm giảm token**. Ngân sách prompt/history/output, cache theo quyền truy cập và đo usage mới là tiêu chí kiểm soát chi phí. Khởi đầu tìm kiếm tài liệu trong PostgreSQL hiện có; chỉ thêm vector/embedding sau khi đánh giá chất lượng truy hồi tiếng Việt.
- OpenRouter là provider cấu hình ở server. Chỉ dùng model miễn phí đã kiểm tra khả dụng và hạn mức tại lúc triển khai; không tự chuyển sang model trả phí. Có trạng thái hết hạn mức và timeout rõ ràng. Không nhúng API key vào web.
- Analytics ghi event định danh: route chuẩn hóa, session, user đã xác thực (server xác định), eventId và thời gian. Không ghi phím bấm, password, token, nội dung chat hoặc âm thanh. Admin xem số liệu và đường đi theo sự kiện, không làm session replay.
- Giữ Google là social provider đầu tiên; các provider khác để sau khi có yêu cầu cụ thể. Backend xác minh ID token, không tin Subject/Email do client gửi.

## Repo và baseline

- Frontend: `D:/Github/Cultural_Appreciation/VRhythm`, repo Git hiện có.
- Backend: `D:/Github/Cultural_Appreciation/Vrythm-Backend`, gom nguyên backend .NET đang có; không tạo lại API. Tên repo GitHub được yêu cầu: **Vrythm-Backend**.
- Nhánh web tạo từ HEAD hiện tại. Các thay đổi giao diện/âm thanh chưa commit vẫn ở checkout đang làm việc; cần chốt baseline trước khi triển khai trên checkout riêng. Không stash/reset/commit chung những thay đổi này.
- Nhánh backend tạo từ commit baseline mã nguồn đã gom. `.gitignore` loại trừ cấu hình local và bí mật. Các cấu hình thật vẫn ở máy người dùng, không nằm trong commit.
- Tách PR theo module và repo; ghép hợp đồng API trước khi merge, không merge tự động các nhánh feature.

## Hiện trạng cần sửa

1. Web có email/password thật, nhưng nút Google hiện gửi tài khoản mẫu. Backend Google nhận `Credential` nhưng chưa xác minh, dùng Subject/Email client cung cấp.
2. Backend có `MockPurchaseAsync` mở quyền trực tiếp; chưa có đơn hàng, xác minh thanh toán hay webhook.
3. Đã có detector/tracker cao độ và chấm Practical; thiếu biểu đồ lịch sử realtime.
4. Chưa thấy dịch vụ chat/RAG hoặc event analytics trong backend.

## Cần chốt

- payOS đã được chọn; chờ đăng ký tài khoản rồi mới tích hợp.
- Plus 59.000đ/30 ngày đã chốt; quyền trả phí còn chờ cổng thanh toán.
- Google client ID/domain được phép, OpenRouter key; cấu hình riêng ngoài Git.
- Repo backend đã publish và có đủ nhánh: https://github.com/Tecookie/Vrythm-Backend. Git remote đã xác minh; dùng Git cho push/fetch.

## Tài liệu chính thức

- [Google: xác minh ID token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)
- [OpenRouter: FAQ/model miễn phí](https://openrouter.ai/docs/faq)
- [OpenRouter: giới hạn và lỗi 429](https://openrouter.ai/docs/api_reference/limits)

Xem `todo.md` để theo dõi từng lát và nghiệm thu. Đây là backlog và ranh giới module, chưa phải xác nhận các tính năng đã triển khai.
