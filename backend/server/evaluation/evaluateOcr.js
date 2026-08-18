import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import processImagePipeline from '../processors/image/processImage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_IMAGES_DIR = path.join(__dirname, 'test_images');

const evaluateOcr = async () => {
  try {
    const testCasesPath = path.join(__dirname, 'imageTestCases.json');
    const testCasesRaw = await fs.readFile(testCasesPath, 'utf8');
    const testCases = JSON.parse(testCasesRaw);

    console.log(`Starting OCR Evaluation for ${testCases.length} cases...`);

    let passed = 0;
    
    for (const testCase of testCases) {
      console.log(`\nEvaluating: ${testCase.id} - ${testCase.description}`);
      try {
        const imagePath = path.join(TEST_IMAGES_DIR, testCase.filename);
        
        // Mock a multer file object
        const fileBuffer = await fs.readFile(imagePath);
        
        // Determine basic mimetype
        const ext = path.extname(testCase.filename).toLowerCase();
        let mimetype = 'image/jpeg';
        if (ext === '.png') mimetype = 'image/png';
        if (ext === '.webp') mimetype = 'image/webp';

        const file = {
          originalname: testCase.filename,
          mimetype,
          size: fileBuffer.length,
          buffer: fileBuffer
        };

        const result = await processImagePipeline(file);
        
        console.log(`Extracted Text Length: ${result.text.length}`);
        console.log(`Confidence: ${result.confidence}`);
        
        let allKeywordsFound = true;
        for (const keyword of testCase.expectedContents) {
          if (!result.text.toLowerCase().includes(keyword.toLowerCase())) {
            console.log(`❌ Missing expected keyword: "${keyword}"`);
            allKeywordsFound = false;
          }
        }

        if (allKeywordsFound) {
          console.log(`✅ Test passed!`);
          passed++;
        }
      } catch (err) {
        console.log(`❌ Test failed with error: ${err.message}`);
        if (err.message.includes('ENOENT')) {
          console.log(`  (Note: You need to place ${testCase.filename} in the server/evaluation/test_images/ folder)`);
        }
      }
    }

    console.log(`\n--- Evaluation Summary ---`);
    console.log(`Passed: ${passed} / ${testCases.length}`);

  } catch (error) {
    console.error('Error running evaluation:', error);
  }
};

// Run the evaluation if this script is executed directly
if (process.argv[1] === __filename) {
  evaluateOcr();
}

export default evaluateOcr;
