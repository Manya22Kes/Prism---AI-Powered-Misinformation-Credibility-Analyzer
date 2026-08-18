import validatePdf from './validatePdf.js';
import detectPdfStructure from './detectPdfStructure.js';
import extractText from './extractText.js';
import buildOcrPdf from './buildOcrPdf.js';
import normalizePdfText from './normalizePdfText.js';
import { performOcr } from '../../services/ocr/googleVision.service.js';
import { PDF_CONFIG } from '../../config/pdf.config.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Removed invalid workerSrc assignment


const processPdf = async (file) => {
  validatePdf(file);

  const metadata = {
    file: {
      mimeType: file.mimetype,
      size: file.size
    },
    pdf: {
      pageCount: 0,
      isScanned: false,
      isMixed: false,
      processingStrategy: 'digital',
      digitalPagesDetected: 0,
      digitalPagesProcessed: 0,
      scannedPagesDetected: 0,
      ocrPagesProcessed: 0,
      failedOcrPages: [],
      truncated: {
        isTruncated: false,
        reason: null
      }
    }
  };

  const uint8Array = new Uint8Array(file.buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const doc = await loadingTask.promise;
  
  metadata.pdf.pageCount = doc.numPages;
  
  const pagesToProcess = Math.min(doc.numPages, PDF_CONFIG.MAX_PAGES);
  if (doc.numPages > PDF_CONFIG.MAX_PAGES) {
    metadata.pdf.truncated.isTruncated = true;
    metadata.pdf.truncated.reason = 'MAX_PAGE_LIMIT';
  }

  let assembledText = '';

  for (let i = 1; i <= pagesToProcess; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const isDigital = detectPdfStructure(textContent);

    if (isDigital) {
      metadata.pdf.digitalPagesDetected++;
      const text = extractText(textContent);
      assembledText += `\n[Page ${i}]\n${text}\n`;
      metadata.pdf.digitalPagesProcessed++;
    } else {
      metadata.pdf.scannedPagesDetected++;
      
      // Check OCR limit
      if (metadata.pdf.ocrPagesProcessed >= PDF_CONFIG.MAX_OCR_PAGES) {
        if (!metadata.pdf.truncated.isTruncated) {
          metadata.pdf.truncated.isTruncated = true;
          metadata.pdf.truncated.reason = 'MAX_OCR_PAGES';
        }
        continue; 
      }

      try {
        const ocrPdfBuffer = await buildOcrPdf(file.buffer, i);
        
        // Wrap Google Vision OCR in a strict timeout
        const ocrPromise = performOcr(ocrPdfBuffer, 'pdf');
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('OCR Timeout')), PDF_CONFIG.OCR_TIMEOUT_MS);
        });
        
        const ocrResult = await Promise.race([ocrPromise, timeoutPromise]);
        
        assembledText += `\n[Page ${i} - OCR]\n${ocrResult.text}\n`;
        metadata.pdf.ocrPagesProcessed++;
      } catch (error) {
        console.warn(`[PDF Processor] OCR failed for page ${i}:`, error.message);
        metadata.pdf.failedOcrPages.push(i);
      }
    }
  }

  // Finalize processing strategy labels
  if (metadata.pdf.scannedPagesDetected > 0 && metadata.pdf.digitalPagesDetected > 0) {
    metadata.pdf.processingStrategy = 'mixed';
    metadata.pdf.isMixed = true;
  } else if (metadata.pdf.scannedPagesDetected > 0) {
    metadata.pdf.processingStrategy = 'ocr';
    metadata.pdf.isScanned = true;
  } else {
    metadata.pdf.processingStrategy = 'digital';
  }

  // Normalize final payload
  const finalProcessedText = normalizePdfText(assembledText);

  if (finalProcessedText.includes('[TRUNCATED DUE TO LENGTH LIMIT]')) {
      if (!metadata.pdf.truncated.isTruncated) {
          metadata.pdf.truncated.isTruncated = true;
          metadata.pdf.truncated.reason = 'MAX_TEXT_LENGTH';
      }
  }

  return {
    sourceType: 'pdf',
    originalInput: file.originalname,
    processedContent: finalProcessedText,
    metadata
  };
};

export default processPdf;
