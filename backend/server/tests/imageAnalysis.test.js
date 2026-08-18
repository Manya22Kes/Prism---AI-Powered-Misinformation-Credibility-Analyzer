import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testEndpoint = async () => {
  const imagePath = process.argv[2];
  
  if (!imagePath) {
    console.error('Please provide an image path: node imageAnalysis.test.js <path-to-image>');
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), imagePath);
  
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const formData = new FormData();
  const fileBuffer = fs.readFileSync(resolvedPath);
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' }); // Approximate type for test
  formData.append('image', blob, path.basename(resolvedPath));

  console.log(`Uploading ${path.basename(resolvedPath)} to http://localhost:5000/api/v1/analyze/image ...`);

  try {
    const response = await fetch('http://localhost:5000/api/v1/analyze/image', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('Extracted Text:\n', data.data.extractedText);
      console.log('\nMetadata:', data.data.metadata);
    } else {
      console.error('❌ Error response from server:', data);
    }
  } catch (err) {
    console.error('❌ Request failed:', err.message);
  }
};

testEndpoint();
