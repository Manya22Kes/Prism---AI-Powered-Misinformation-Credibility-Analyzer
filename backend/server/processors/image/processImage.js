import validateImage from './validateImage.js';
import preprocessImage from './preprocessImage.js';
import extractText from './extractText.js';
import normalizeOcrText from './normalizeOcrText.js';


const processImagePipeline = async (file) => {
  // 1. Validate
  validateImage(file);

  // 2. Preprocess
  const imageBuffer = await preprocessImage(file);

  // 3. Extract Text
  const ocrResult = await extractText(imageBuffer);

  // 4. Normalize Text
  const normalizedText = normalizeOcrText(ocrResult.text);

  return {
    sourceType: 'image',
    originalInput: file.originalname,
    processedContent: normalizedText,
    metadata: {
      file: {
        originalname: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
      ocr: {
        provider: 'google-vision',
        language: ocrResult.language,
        confidence: ocrResult.confidence
      }
    }
  };
};

export default processImagePipeline;
