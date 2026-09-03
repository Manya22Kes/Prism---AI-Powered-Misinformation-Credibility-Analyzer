import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import analysisRoutes from "./routes/analysis.routes.js";
import healthRoutes from "./routes/health.routes.js";
import historyRoutes from "./routes/history.routes.js";
import collectionRoutes from "./routes/collection.routes.js";
import watchlistRoutes from "./routes/watchlist.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import missionControlRoutes from "./routes/missionControl.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import searchRoutes from "./routes/search.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import rateLimit from "express-rate-limit";
import logger from "./utils/logger.js";

const app = express();
// Global Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Ensure API resources can be fetched across configured origins
}));

const corsOptions = {
  origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "*",
  credentials: true,
};
app.use(cors(corsOptions));

app.use(morgan("dev")); // Keep Morgan for dev, but we use Winston for app errors

// General Rate Limiter: 150 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 150, 
  standardHeaders: true, 
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" },
});

// Apply rate limiter to all /api/v1 routes EXCEPT analysis (which has its own)
app.use("/api/v1", (req, res, next) => {
  if (req.path.startsWith('/analyze')) {
    return next();
  }
  // Also we should exclude SSE if they were on a distinct route, but they are on /analyze
  return apiLimiter(req, res, next);
});

app.use(express.json({ limit: '1mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  })
);
app.use("/api/v1/analyze", analysisRoutes);
app.use("/api/v1/history", historyRoutes);
app.use("/api/v1/collections", collectionRoutes);
app.use("/api/v1/watchlist", watchlistRoutes);
app.use("/api/v1/activity", activityRoutes);
app.use("/api/v1/health", healthRoutes);
app.use("/health", healthRoutes);
app.use("/api/v1/mission-control", missionControlRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/search", searchRoutes);

app.get('/test500', (req, res, next) => next(new Error('Test error')));

// Global Error Handler
app.use(errorMiddleware);

export default app;
