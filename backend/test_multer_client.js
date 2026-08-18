import fs from 'fs';
import path from 'path';

const testMulter = async () => {
  try {
    const filePath = path.resolve('dummy_large.txt');
    fs.writeFileSync(filePath, '12345678901234567890'); // 20 bytes
    
    const formData = new FormData();
    const blob = new Blob([fs.readFileSync(filePath)], { type: 'text/plain' });
    formData.append('file', blob, 'dummy.txt');

    const response = await fetch('http://localhost:5001/upload', {
      method: 'POST',
      body: formData,
    });

    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    const text = await response.text();
    console.log('Body:', text);

    fs.unlinkSync(filePath);
    process.exit(0);
  } catch (error) {
    console.error('Fetch error:', error);
    process.exit(1);
  }
};

testMulter();
