import fs from 'fs';
import path from 'path';

const testPptx = async () => {
  try {
    // Create a dummy PPTX file of 20MB
    const filePath = path.resolve('dummy.pptx');
    const buffer = Buffer.alloc(20 * 1024 * 1024, '0'); // 20MB of zeros
    fs.writeFileSync(filePath, buffer);
    
    const formData = new FormData();
    const blob = new Blob([fs.readFileSync(filePath)], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    formData.append('file', blob, 'dummy.pptx');

    const response = await fetch('http://localhost:5000/api/v1/analyze/pptx', {
      method: 'POST',
      body: formData,
    });

    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    const text = await response.text();
    console.log('Body:', text);

    fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

testPptx();
