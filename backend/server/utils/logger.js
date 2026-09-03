import winston from 'winston';

// Determine log format based on environment
const isProduction = process.env.NODE_ENV === 'production';

const logFormat = isProduction
  ? winston.format.combine(
      winston.format.timestamp(),
      winston.format.json() // Structured JSON logs in production
    )
  : winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(
        ({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `[${timestamp}] ${level}: ${message} ${metaStr}`;
        }
      )
    );

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console()
  ],
});

export default logger;
