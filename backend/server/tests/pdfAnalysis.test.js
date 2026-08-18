import { PDFDocument, rgb } from 'pdf-lib';
import processPdf from './server/processors/pdf/processPdf.js';
import visionClient from './server/config/googleVision.js';

let ocrCallCount = 0;
visionClient.batchAnnotateFiles = async (request) => {
  ocrCallCount++;
  return [{
    responses: [{
      responses: [{
        fullTextAnnotation: {
          text: `[Mock OCR Result for Scanned Page]`,
          pages: []
        }
      }]
    }]
  }];
};

async function generateMixedPdf() {
  const doc = await PDFDocument.create();
  
  for (let i = 1; i <= 10; i++) {
    const page = doc.addPage([500, 500]);
    
    if (i % 2 === 0) {
      // Digital Page
      page.drawText(`This is digital text on page ${i}`, {
        x: 50,
        y: 250,
        size: 20,
        color: rgb(0, 0, 0)
      });
    } else {
    }
  }
  
  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}

async function runTest() {
  console.log('Generating 10-page mixed PDF...');
  const pdfBuffer = await generateMixedPdf();
  
  const mockMulterFile = {
    buffer: pdfBuffer,
    mimetype: 'application/pdf',
    size: pdfBuffer.length,
    originalname: 'test_mixed_document.pdf'
  };
  
  console.log('Running processPdf pipeline...');
  const result = await processPdf(mockMulterFile);
  
  console.log('\n=== TEST RESULTS ===');
  console.log('Metadata:', JSON.stringify(result.metadata, null, 2));
  console.log('\nProcessed Content Snippet:\n', result.processedContent);
  
  // Verifications
  const m = result.metadata.pdf;
  let passed = true;
  
  if (m.pageCount !== 10) { console.error('❌ Expected 10 pages'); passed = false; }
  if (m.digitalPagesDetected !== 5) { console.error('❌ Expected 5 digital pages'); passed = false; }
  if (m.scannedPagesDetected !== 5) { console.error('❌ Expected 5 scanned pages'); passed = false; }
  if (m.ocrPagesProcessed !== 5) { console.error('❌ Expected 5 OCR pages processed'); passed = false; }
  if (ocrCallCount !== 5) { console.error('❌ Expected Google Vision to be called exactly 5 times'); passed = false; }
  if (m.processingStrategy !== 'mixed') { console.error('❌ Expected processingStrategy to be "mixed"'); passed = false; }
  
  if (passed) {
    console.log('\n✅ All verifications passed! The mixed PDF optimization is working flawlessly.');
  } else {
    console.error('\n❌ Test failed.');
    process.exit(1);
  }
}

runTest().catch(console.error);
