import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import analysisRoutes from "./routes/analysis.routes.js";
import healthRoutes from "./routes/health.routes.js";
import historyRoutes from "./routes/history.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();
// Global Middleware

app.use(helmet());

app.use(cors());

app.use(morgan("dev"));

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use("/api/v1/analyze", analysisRoutes);
app.use("/api/v1/history", historyRoutes);
app.use("/api/v1/health", healthRoutes);

app.get('/test500', (req, res, next) => next(new Error('Test error')));

// Global Error Handler
app.use(errorMiddleware);

export default app;
