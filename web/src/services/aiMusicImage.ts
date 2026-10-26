const maxBytes = 5 * 1024 * 1024;
const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];

/** File names and browser MIME hints do not establish the actual image format. */
export async function prepareAiMusicImage(file: File): Promise<File> {
  if (file.size < 24 || file.size > maxBytes) throw new Error('Chọn ảnh PNG, JPEG hoặc WebP từ 24 byte đến 5 MB.');
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const png = pngSignature.every((byte, i) => head[i] === byte);
  const jpeg = head[0] === 255 && head[1] === 216 && head[2] === 255;
  const name = file.name.replace(/\.[^.]+$/, '') || 'sheet';
  if (png || jpeg) {
    return new File([file], `${name}.${png ? 'png' : 'jpg'}`, { type: png ? 'image/png' : 'image/jpeg', lastModified: file.lastModified });
  }
  const ascii = new TextDecoder('ascii').decode(head);
  if (!ascii.startsWith('RIFF') || ascii.slice(8) !== 'WEBP') throw new Error('Nội dung file không phải ảnh PNG, JPEG hoặc WebP hợp lệ. Hãy xuất lại ảnh rồi thử lại.');

  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(new Blob([file], { type: 'image/webp' })); }
  catch { throw new Error('Không đọc được ảnh WebP. Hãy xuất ảnh thành PNG hoặc JPEG rồi thử lại.'); }
  const canvas = document.createElement('canvas');
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 20_000_000) throw new Error('Ảnh tối đa 20 triệu điểm ảnh. Hãy giảm kích thước ảnh rồi thử lại.');
    canvas.width = bitmap.width; canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Trình duyệt không chuyển được ảnh. Hãy xuất thành PNG hoặc JPEG rồi thử lại.');
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob || blob.size > maxBytes) throw new Error('Ảnh sau khi chuyển sang PNG vượt quá 5 MB hoặc chưa chuyển được. Hãy giảm kích thước ảnh rồi thử lại.');
    return new File([blob], `${name}.png`, { type: 'image/png', lastModified: file.lastModified });
  } finally {
    bitmap.close(); canvas.width = 0; canvas.height = 0;
  }
}
