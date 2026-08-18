import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/png', 
    'image/webp', 
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/flac',
    'audio/mp4',
    'audio/x-m4a'
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only JPEG, PNG, WebP, PDF, DOCX, PPTX, and Audio (MP3, WAV, FLAC, M4A) are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    // 200 MB global limit. We set this artificially high so Multer fully consumes the upload stream 
    // and doesn't abort the TCP connection (which causes 'Failed to fetch' in the browser).
    // The actual strict file size limits (e.g., 30MB for PPTX) are enforced gracefully inside 
    // the specific processors (like validatePptx.js) so they can return proper SSE error messages.
    fileSize: 200 * 1024 * 1024 
  }
});

export default upload;
