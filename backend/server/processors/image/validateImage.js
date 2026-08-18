import path from 'path';
import ApiError from '../../utils/ApiError.js';

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB


const validateImage = (file) => {
  if (!file) {
    throw new ApiError(400, 'No image file provided.');
  }

  if (!SUPPORTED_MIME_TYPES.includes(file.mimetype)) {
    throw new ApiError(400, `Unsupported file type: ${file.mimetype}. Supported types: ${SUPPORTED_MIME_TYPES.join(', ')}`);
  }

  const ext = path.extname(file.originalname).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new ApiError(400, `Unsupported file extension: ${ext}. Supported extensions: ${SUPPORTED_EXTENSIONS.join(', ')}`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ApiError(400, `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
  }

  return true;
};

export default validateImage;
