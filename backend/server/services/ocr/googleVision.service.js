import visionClient from '../../config/googleVision.js';
import Tesseract from 'tesseract.js';

const parseVisionResult = (fullTextAnnotation) => {
  if (!fullTextAnnotation) {
    return { text: '', confidence: null, language: 'unknown' };
  }

  const text = fullTextAnnotation.text || '';
  let language = 'unknown';
  
  const pages = fullTextAnnotation.pages || [];
  if (pages.length > 0 && pages[0].property && pages[0].property.detectedLanguages && pages[0].property.detectedLanguages.length > 0) {
    language = pages[0].property.detectedLanguages[0].languageCode;
  }

  return { text, language, confidence: null };
};

const performLocalTesseractOcr = async (input) => {
  console.log('ℹ️ [OCR Engine] Falling back to local Tesseract.js engine...');
  const { data } = await Tesseract.recognize(input, 'eng');
  return {
    text: data.text || '',
    language: 'en',
    confidence: data.confidence ? data.confidence / 100 : null
  };
};

export const performOcr = async (input, type = 'image') => {
  try {
    if (type === 'pdf') {
      const request = {
        requests: [
          {
            inputConfig: {
              content: input,
              mimeType: 'application/pdf',
            },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
            pages: [1] // We are sending 1-page PDFs prepared by pdf-lib
          }
        ]
      };
      
      const [result] = await visionClient.batchAnnotateFiles(request);
      
      if (!result.responses?.[0]?.responses?.[0]?.fullTextAnnotation) {
        return { text: '', confidence: null, language: 'unknown' };
      }
      
      return parseVisionResult(result.responses[0].responses[0].fullTextAnnotation);
    } else {
      const request = {
        image: {
          ...(Buffer.isBuffer(input) || input instanceof Uint8Array
            ? { content: input }
            : { source: { filename: input } }),
        },
      };

      const [result] = await visionClient.documentTextDetection(request);
      return parseVisionResult(result.fullTextAnnotation);
    }
  } catch (error) {
    console.warn(`[OCR Engine] Google Vision API error (${type}): ${error.message}. Attempting local fallback...`);
    try {
      return await performLocalTesseractOcr(input);
    } catch (fallbackError) {
      console.error('[OCR Engine] Both Cloud Vision & local Tesseract failed:', fallbackError);
      throw new Error('OCR provider failed to extract text');
    }
  }
};
