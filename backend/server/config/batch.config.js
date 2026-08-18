export const BATCH_CONFIG = {
  MAX_FILES: 10,
  MAX_TOTAL_SIZE: 50 * 1024 * 1024, // 50 MB total across all files
  MAX_TOTAL_TEXT: 500000,           // Characters (~100k tokens)
  SUPPORTED_TYPES: [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/webp',
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/flac',
    'audio/mp4',
    'audio/x-m4a'
  ]
};
