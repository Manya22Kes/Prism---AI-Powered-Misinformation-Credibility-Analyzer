import express from 'express';
import multer from 'multer';
import ApiError from './utils/ApiError.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

const fileFilter = (req, file, cb) => {
  cb(new ApiError(400, 'Test invalid file type'));
};

const upload = multer({ fileFilter });

app.post('/upload', upload.single('file'), (req, res) => res.json({ success: true }));
app.use(errorMiddleware);

app.listen(5002, () => console.log('Test server running on 5002'));
