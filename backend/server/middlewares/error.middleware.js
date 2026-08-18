const errorMiddleware = (err, req, res, next) => {
  console.error("ERROR CAUGHT IN MIDDLEWARE:", err);
  
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

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorMiddleware;
