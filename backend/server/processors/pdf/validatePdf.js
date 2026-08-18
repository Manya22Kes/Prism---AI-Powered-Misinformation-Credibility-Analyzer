import path from 'path';
import ApiError from '../../utils/ApiError.js';
import { PDF_CONFIG } from '../../config/pdf.config.js';

const SUPPORTED_MIME_TYPES = ['application/pdf'];
const SUPPORTED_EXTENSIONS = ['.pdf'];


const validatePdf = (file) => {
  if (!file) {
    throw new ApiError(400, 'No PDF file provided.');
  }

  if (!SUPPORTED_MIME_TYPES.includes(file.mimetype)) {
    throw new ApiError(400, `Unsupported file type: ${file.mimetype}. Only PDFs are allowed.`);
  }

  const ext = path.extname(file.originalname).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new ApiError(400, `Unsupported file extension: ${ext}. Only .pdf is allowed.`);
  }

  if (file.size > PDF_CONFIG.MAX_FILE_SIZE) {
    throw new ApiError(400, `File size exceeds the limit of ${PDF_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB.`);
  }

  return true;
};

export default validatePdf;
