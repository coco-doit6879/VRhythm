# Todo mới: Web + backend, ưu tiên sáo trúc

Kế hoạch âm thanh cũ trong `tasks/plan.md` và `tasks/todo.md` được giữ nguyên. Các mục dưới đây thuộc backlog mới; mỗi nhóm dùng nhánh riêng trong `capability-map.md`.

## 0. Chuẩn bị repo và baseline

- [x] Kiểm kê auth, khóa học, mock unlock và Practical hiện có.
- [x] Gom nguyên backend vào `Cultural_Appreciation/Vrythm-Backend`, giữ cấu hình local.
- [x] Build/test backend sau di chuyển; kiểm tra các file source khớp bản trước di chuyển.
- [x] Tạo commit backend baseline, loại trừ bí mật/build output.
- [x] Tạo 5 nhánh feature tương ứng trong web và backend.
- [x] Tạo GitHub repo Vrythm-Backend và push main/nhánh khi kết nối khả dụng.
- [x] Chốt baseline web trước khi làm tính năng, giữ nguyên work chưa commit của các luồng khác.

## 1. Identity — feature/auth-google

- [x] Hoàn thiện đăng ký/đăng nhập email: validation, phản hồi lỗi, hết hạn phiên, đăng xuất, rate limit API. Verify: API test đăng ký → login → profile, email trùng/sai mật khẩu và client giữ dữ liệu form khi lỗi.
- [x] Thay nút Google mẫu bằng Google Identity Services; backend xác minh chữ ký/audience/issuer/expiry và lấy identity từ token đã xác minh. Verify: token giả/hết hạn/audience sai bị từ chối; không gộp tài khoản dựa vào email client tự gửi.
- [ ] Kiểm tra role Learner/Admin trên API và trang web. Verify: learner không truy cập dashboard/API admin; local test với token fixture, Google thật kiểm tra riêng khi có client ID.

## 2. Tracking + dashboard — feature/admin-analytics

- [ ] Tạo schema/API nhận batch event có giới hạn kích thước/tốc độ, server gắn userId từ auth và chống trùng eventId. Verify: gửi lại batch không tăng số đếm; client không mạo danh user khác.
- [ ] Gắn page_view và các event rõ nghĩa: course_view, enrollment, lesson_start/complete, practice_start/result, checkout_start/result, chat_request. Verify: điều hướng bằng menu/back/deep link được ghi một lần; không ghi query có bí mật.
- [ ] Dashboard `/admin`: người dùng mới/hoạt động, lượt xem, bài học hoàn thành, funnel khám phá → học → thanh toán và timeline tương tác theo user/session. Verify: filter ngày/nhạc cụ, pagination, dữ liệu rỗng, phân quyền. Đơn hàng/doanh thu chỉ hiển thị khi billing đã có dữ liệu xác minh.

## 3. Gói bài tập + nội dung sáo — feature/payments-flute-catalog

- [x] Lọc catalog Học tập về sáo trúc; route học nhạc cụ khác báo chưa mở, giữ đủ nhạc cụ ở Trang chủ/Khám phá và dữ liệu admin. Seed idempotent nội dung nhập môn, tạo âm, nốt/giai điệu, Theory/Video/Quiz/Practical và gói có mapping bài rõ ràng. Verify: seed lại không nhân đôi; JSON nốt/đáp án khớp dữ liệu chấm server.
- [x] Trang `/packages`, đơn hàng và checkout mẫu: Plus 59.000đ/30 ngày, giá từ server, trạng thái Pending/DemoSucceeded/Failed/Cancelled/Expired và chỉ cho chủ đơn xem; không thu tiền hoặc cấp quyền. Verify: client sửa giá bị bỏ qua; người dùng khác không đọc được đơn.
- [ ] Tích hợp cổng sau khi chốt: server xác minh webhook, chống xử lý trùng, grant entitlement trong transaction và khóa mock unlock ngoài dev. Verify: redirect success không tự mở bài; webhook giả/sai tiền bị từ chối; webhook gửi lại không cấp quyền hai lần.

## 4. Practical realtime — feature/practical-realtime

- [x] Lấy sample cao độ/target/time và mức RMS từ pipeline micro hiện có; buffer giới hạn, cập nhật chart vừa đủ, không lưu âm thanh. Verify: C4/C5 đúng trục; im lặng không tạo đường nốt, sai octave được nhìn thấy.
- [x] Thêm LineChart và meter micro nhỏ; hiển thị nốt mục tiêu/đo được và hướng cao/thấp bằng chữ. Verify: desktop/tablet/mobile không tràn, reduced motion, người không đọc biểu đồ vẫn dùng được readout hiện có.
- [x] Dừng giải phóng stream/context/frame khi stop, chuyển bài, ẩn tab hoặc unmount; reset lịch sử khi thu mới. Verify: fake microphone Playwright + test pitch detector/tracker; không thay kết quả chấm hay submit do chart.

## 5. AI Chat + RAG — feature/ai-chat-rag

- [x] Truy hồi mô tả khóa sáo Approved và bài Theory theo quyền, sourceId và hash corpus; chuẩn hóa tiếng Việt có/không dấu. Test loại nguồn khóa/nháp/Quiz và vô hiệu cache khi quyền/nội dung đổi.
- [x] Adapter OpenRouter miễn phí, API JWT, quota DB theo ngày Việt Nam, giới hạn input/context/output, timeout và usage. HTTP tests đạt; không fallback trả phí.
- [x] Chat gọn mở khi cần, link nguồn, trạng thái thiếu tài liệu/lỗi, cache DB 24h. UI 3 viewport và web–API/SQLite/model fixture đạt; OpenRouter live smoke một lần đạt.
- [ ] Đo tổng token so baseline nguyên corpus và đánh giá retrieval/prompt injection với bộ câu hỏi thực tế. Lần so token gặp free-provider429; chưa kết luận mức tiết kiệm.
- [ ] Bật production sau quyền Plus có thời hạn từ payOS/webhook thật. Chưa áp dụng migration trên PostgreSQL người dùng. Chi tiết: `ai-chat-rag.md`.

## Nghiệm thu mỗi nhánh

- Backend: `dotnet build VRhythmBackend.sln`, `dotnet test VRhythmBackend.sln`; integration chỉ chạy với database local riêng, không seed live DB.
- Web: `npm run build`, affected Playwright rồi `npm run test:ui`; kiểm tra screenshot và geometry tại 1440×900, 768×1024, 390×844.
- Kiểm tra integration web ↔ API thật cho luồng thay đổi. Mock UI tests không chứng minh Google/thanh toán/OpenRouter đã chạy thật.
- PR mô tả phần hoàn thành, checks, cấu hình còn thiếu. Không tuyên bố một module xong chỉ vì tạo nhánh hoặc dựng UI.

## Kết quả chuẩn bị (09/10/2026)

- Backend main có commit baseline `510b204`, nhập nguyên mã nguồn hiện có. 124 file C#/project khớp snapshot trước di chuyển.
- Build đạt với 7 warning nullable có sẵn; 6 unit test đạt, 3 integration test chưa chạy do không bật local DB.
- Cả hai repo có đủ 5 nhánh feature. Auth đã có implementation riêng; Practical realtime có implementation phía web. Dashboard chưa triển khai; catalog/payment mẫu và AI/RAG Development đã có implementation trên nhánh riêng.
- Các thay đổi thiết kế/âm thanh chưa commit được giữ nguyên, không gộp vào commit tính năng mới.
- GitHub backend đã được người dùng publish tại https://github.com/Tecookie/Vrythm-Backend. Đã xác minh main khớp local và push đủ 5 nhánh feature qua Git; không còn phụ thuộc plugin/trình duyệt cho thao tác Git.

## Kiểm tra sau implementation

- Auth: backend build đạt, 17 test đạt/3 DB integration bỏ qua; web build và 60 UI test đạt (nhánh auth). HTTP pipeline đã kiểm tra với repository bộ nhớ; Google thật/PostgreSQL end-to-end còn chờ kiểm tra riêng.
- Practical: unit trace và affected UI đạt; giữ API chấm cũ. Không đánh dấu các module dashboard/payment/RAG xong.

- Catalog/payment mẫu: xem payments-flute-catalog.md. PostgreSQL migration/seed thực tế và payOS còn chờ; demo không cấp quyền.
