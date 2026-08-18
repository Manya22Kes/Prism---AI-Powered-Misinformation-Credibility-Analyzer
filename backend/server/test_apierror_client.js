import fs from 'fs';
import path from 'path';

const testMulterApiError = async () => {
  try {
    const filePath = path.resolve('dummy.txt');
    fs.writeFileSync(filePath, '123'); 
    
    const formData = new FormData();
    const blob = new Blob([fs.readFileSync(filePath)], { type: 'text/plain' });
    formData.append('file', blob, 'dummy.txt');

    const response = await fetch('http://localhost:5002/upload', {
      method: 'POST',
      body: formData,
    });

    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Body:', text);

    fs.unlinkSync(filePath);
    process.exit(0);
  } catch (error) {
    console.error('Fetch error:', error);
    process.exit(1);
  }
};

testMulterApiError();
