import logger from '../utils/logger.js';

const sanitizeRequest = (req) => {
  if (!req) return {};
  const { password, token, authorization, key, ...safeHeaders } = req.headers || {};
  return {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip,
    headers: safeHeaders,
  };
};

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Handle Multer-specific errors
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File is too large to be uploaded.";
  } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = 400;
    message = "Unexpected file upload format.";
  }
  
  // Handle Database Disconnection Errors gracefully
  if (err.name === 'MongooseServerSelectionError') {
    statusCode = 503;
    message = "Database service is temporarily unavailable. Please try again later.";
  }

  // Log error using Winston with sanitization
  logger.error({
    message: err.message,
    stack: err.stack,
    request: sanitizeRequest(req),
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "production" && statusCode >= 500 
      ? "An unexpected error occurred. Please try again later."
      : message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorMiddleware;
