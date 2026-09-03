import express from "express";

const router = express.Router();

import { getSystemHealth } from "../controllers/health.controller.js";

router.get("/", getSystemHealth);

export default router;
