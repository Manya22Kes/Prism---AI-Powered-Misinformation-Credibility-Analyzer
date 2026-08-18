import express from 'express';
import morgan from 'morgan';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();
app.use(morgan('dev'));

app.get('/test', (req, res, next) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream' });
  next(new Error('Test error after writeHead'));
});

app.use(errorMiddleware);

app.listen(5003, () => console.log('Server running on 5003'));
