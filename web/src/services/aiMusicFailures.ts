type FailureCopy = { title: string; detail: string; action: string };
const reasons: Record<string, readonly [string, string, string]> = {
  INVALID_IMAGE: ['Không đọc được ảnh', 'Ảnh bị hỏng hoặc chưa đúng định dạng.', 'Chọn lại ảnh PNG, JPEG hoặc WebP rõ nét.'],
  IMAGE_TOO_LARGE: ['Ảnh quá lớn', 'Ảnh hiện quá lớn để xử lý.', 'Giảm kích thước hoặc dung lượng ảnh rồi thử lại.'],
  POLYPHONIC_SHEET: ['Sheet có nhiều nốt cùng lúc', 'Hiện chỉ hỗ trợ một giai điệu, mỗi thời điểm một nốt.', 'Chọn bản đơn âm dành cho sáo rồi thử lại.'],
  NO_MELODY: ['Chưa nhận ra giai điệu', 'Chưa đọc được nốt nhạc trong ảnh.', 'Chọn ảnh rõ khuông và nốt nhạc, tránh cắt mất đầu hoặc cuối khuông.'],
  SHEET_UNSUPPORTED: ['Bản nhạc chưa được hỗ trợ', 'Hiện chưa thể tạo âm thanh cho bản nhạc này.', 'Thử một đoạn giai điệu ngắn hơn hoặc chọn bản nhạc khác.'],
  SCAN_FAILED: ['Chưa đọc được bản nhạc', 'Lần nhận dạng này chưa thành công.', 'Thử ảnh rõ hơn hoặc chọn một đoạn nhạc ngắn hơn.'],
  SHEET_TOO_COMPLEX: ['Bản nhạc quá nhiều nốt', 'Chưa thể xử lý toàn bộ bản nhạc trong một lần.', 'Chia bản nhạc thành các đoạn ngắn rồi quét lại.'],
  SCORE_TOO_LONG: ['Bản nhạc quá dài', 'Mỗi bản nhạc được hỗ trợ tối đa 120 giây.', 'Chọn một đoạn ngắn hơn hoặc kiểm tra lại tempo.'],
  PITCH_OUT_OF_RANGE: ['Cao độ ngoài phạm vi hỗ trợ', 'Bản nhạc có nốt nằm ngoài C4–B6.', 'Chọn đoạn nhạc nằm trong phạm vi này.'],
  PROCESSING_TIMEOUT: ['Xử lý mất quá nhiều thời gian', 'Bản nhạc chưa thể hoàn tất trong lần này.', 'Thử một đoạn nhạc ngắn hơn.'],
  REQUEST_EXPIRED: ['Yêu cầu đã hết hạn', 'Bản nhạc chưa hoàn tất trong thời gian cho phép.', 'Quét lại ảnh và xác nhận bản nhạc trước thời hạn hiển thị.'],
  UPLOAD_FAILED: ['Chưa gửi được ảnh', 'Ảnh chưa được tiếp nhận để tạo bản nhạc.', 'Quét lại ảnh. Nếu vẫn gặp lỗi, vui lòng thử lại sau.'],
  SERVICE_BUSY: ['Dịch vụ đang bận', 'Hiện có nhiều yêu cầu tạo nhạc.', 'Đợi một lúc rồi thử lại.'],
  SERVICE_UNAVAILABLE: ['Dịch vụ tạm thời gián đoạn', 'Hiện chưa thể xử lý yêu cầu của bạn.', 'Vui lòng thử lại sau.'],
  REQUEST_DELAYED: ['Chưa cập nhật được trạng thái', 'Yêu cầu của bạn có thể vẫn đang được xử lý.', 'Tải lại trạng thái trước khi gửi một bản mới.'],
  AUDIO_UNAVAILABLE: ['Chưa tải được âm thanh', 'Âm thanh chưa sẵn sàng để phát.', 'Vui lòng thử lại sau.'],
};
// Compatibility with older API deployments. These diagnostics are never rendered.
const legacyReasons: Record<string, string> = {
  IMAGE_DIMENSIONS_EXCEEDED: 'IMAGE_TOO_LARGE',
  UNSUPPORTED_NOTATION: 'SHEET_UNSUPPORTED', RENDER_RANGE_UNSUPPORTED: 'SHEET_UNSUPPORTED',
  INVALID_SCAN_RESULT: 'SCAN_FAILED', SCORE_TOO_LARGE: 'SHEET_TOO_COMPLEX',
  UNSUPPORTED_PITCH_RANGE: 'PITCH_OUT_OF_RANGE',
  SCAN_TIMEOUT: 'PROCESSING_TIMEOUT', RENDER_TIMEOUT: 'PROCESSING_TIMEOUT',
  RESERVATION_EXPIRED: 'REQUEST_EXPIRED', SCAN_NOT_ACCEPTED: 'UPLOAD_FAILED',
  WORKER_BUSY: 'SERVICE_BUSY', WORKER_TIMEOUT: 'REQUEST_DELAYED', WORKER_UNAVAILABLE: 'REQUEST_DELAYED',
  INVALID_AUDIO: 'AUDIO_UNAVAILABLE', WORKER_AUTH_FAILED: 'SERVICE_UNAVAILABLE',
  WORKER_ENDPOINT_NOT_FOUND: 'SERVICE_UNAVAILABLE', WORKER_PROTOCOL_ERROR: 'SERVICE_UNAVAILABLE',
  WORKER_INPUT_REJECTED: 'SERVICE_UNAVAILABLE', WORKER_OUT_OF_MEMORY: 'SERVICE_UNAVAILABLE',
  PROCESS_KILLED: 'SERVICE_UNAVAILABLE', GENERATION_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
};
function customerReason(code: unknown) {
  if (typeof code !== 'string') return null;
  if (Object.hasOwn(reasons, code)) return reasons[code];
  return Object.hasOwn(legacyReasons, code) ? reasons[legacyReasons[code]] : null;
}
export function musicFailure(code: unknown): FailureCopy {
  const reason = customerReason(code);
  if (reason) return { title: reason[0], detail: reason[1], action: reason[2] };
  return { title: 'Chưa tạo được bản nhạc', detail: 'Yêu cầu chưa hoàn tất.', action: 'Vui lòng thử lại. Nếu vẫn gặp lỗi, hãy liên hệ hỗ trợ.' };
}
export function knownMusicFailure(code: unknown): boolean {
  return customerReason(code) !== null || code === 'CREATION_FAILED';
}
