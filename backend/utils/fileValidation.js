// Simple file validation helper for chat uploads
export function validateMessageFile(file) {
  // Allow common image types and audio (webm/mp3/wav)
  const allowedMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/webm', 'audio/mpeg', 'audio/wav', 'audio/x-wav'];
  const maxSize = 8 * 1024 * 1024; // 8MB per file

  const errors = [];
  const size = file.size || file.buffer?.length || 0;
  if (size === 0) errors.push('Empty file');
  if (size > maxSize) errors.push(`File too large: ${Math.round(size/1024/1024)}MB (max ${maxSize/1024/1024}MB)`);

  const mime = file.mimetype || '';
  if (!allowedMime.includes(mime)) {
    errors.push(`Invalid file type: ${mime}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
