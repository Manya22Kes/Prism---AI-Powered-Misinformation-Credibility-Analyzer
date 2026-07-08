import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

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

// Health Check Route

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Prism API is running.",
  });
});

export default app;
