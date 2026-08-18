import express from 'express';
import multer from 'multer';

const app = express();
const upload = multer({ limits: { fileSize: 10 } }); // 10 byte limit

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ success: true });
});

app.use((err, req, res, next) => {
  console.log('Error caught in middleware:', err.message, err.code, err.statusCode);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ message: err.message, code: err.code });
});

app.listen(5001, () => console.log('Test server running on 5001'));
