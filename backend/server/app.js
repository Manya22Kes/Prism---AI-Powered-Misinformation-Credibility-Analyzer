import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import analysisRoutes from "./routes/analysis.routes.js";
import healthRoutes from "./routes/health.routes.js";

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
app.use("/api/v1/health", healthRoutes);

export default app;
