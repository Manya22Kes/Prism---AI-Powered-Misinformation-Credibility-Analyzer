import { PDF_CONFIG } from '../../config/pdf.config.js';


const normalizePdfText = (rawText) => {
  if (!rawText) return '';

  // Clean up excessive whitespace
  let cleanText = rawText
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanText.length > PDF_CONFIG.MAX_TEXT_LENGTH) {
    cleanText = cleanText.substring(0, PDF_CONFIG.MAX_TEXT_LENGTH) + '... [TRUNCATED DUE TO LENGTH LIMIT]';
  }

  return cleanText;
};

export default normalizePdfText;
