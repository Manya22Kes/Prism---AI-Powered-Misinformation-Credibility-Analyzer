import { PDFDocument } from 'pdf-lib';


const buildOcrPdf = async (originalPdfBuffer, pageNumber) => {
  // Load the original PDF
  const sourceDoc = await PDFDocument.load(originalPdfBuffer);
  
  // Create a new empty PDF
  const ocrDoc = await PDFDocument.create();
  
  const [copiedPage] = await ocrDoc.copyPages(sourceDoc, [pageNumber - 1]);
  
  // Add the copied page to the new document
  ocrDoc.addPage(copiedPage);
  
  // Serialize the new document to a Uint8Array
  const ocrPdfBytes = await ocrDoc.save();
  return ocrPdfBytes;
};

export default buildOcrPdf;
