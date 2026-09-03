import app from "./app.js";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 5000;

// Startup Validation
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  logger.error("FATAL ERROR: Missing required environment variable: MONGO_URI (or MONGODB_URI)");
  process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
  logger.error("FATAL ERROR: Missing required environment variable: GEMINI_API_KEY");
  process.exit(1);
}

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    // Graceful Shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info("Closed out remaining connections.");
        await mongoose.connection.close(false);
        logger.info("MongoDB connection closed.");
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        logger.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
