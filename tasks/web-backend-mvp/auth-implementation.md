# Nền đăng nhập — feature/auth-google

Giữ nguyên bố cục, màu sắc, typography và thẻ đăng nhập hiện tại. Nút Google mẫu đã được thay bằng Google Identity Services; web gửi duy nhất credential để backend xác minh. Đăng ký gửi confirmPassword đúng hợp đồng API, yêu cầu tối thiểu 8 ký tự. Lỗi giữ nguyên dữ liệu form; phiên hết hạn hoặc lỗi định dạng bị xóa khỏi storage. Sau Google login, chỉ quay lại các route học nội bộ được cho phép.

Backend có endpoint công khai `/api/auth/providers` trả Google Client ID. Client secret và OpenRouter key chỉ nằm trong cấu hình backend bị Git ignore. Không cần thêm secret vào web.

Kiểm tra: web build đạt; 9 test đăng nhập riêng và tổng 60 test Chromium đạt ở 1440×900, 768×1024, 390×844. Đã xem screenshot desktop/mobile và kiểm tra geometry. Test GIS dùng fixture, không chứng minh đăng nhập Google thật. Backend kiểm tra chữ ký token và luồng HTTP; PostgreSQL persistence, tài khoản Google thật và trang admin còn cần kiểm tra riêng.

Giá mẫu Plus đã chốt **59.000 VND/tháng**; payOS sẽ tích hợp sau. Analytics, gói/nội dung sáo trúc, realtime Practical và AI/RAG tiếp tục ở nhánh riêng theo todo. Chưa hợp nhất vào main hay triển khai website.
