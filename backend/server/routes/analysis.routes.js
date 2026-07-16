import express from "express";
import { analyzeText, analyzeUrl } from "../controllers/analysis.controller.js";

const router = express.Router();

router.post("/text", analyzeText);
router.post("/url", analyzeUrl);

export default router;
