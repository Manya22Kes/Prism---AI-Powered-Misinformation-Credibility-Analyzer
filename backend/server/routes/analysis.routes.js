import express from "express";
import { analyzeText } from "../controllers/textAnalysis.controller.js";
import { analyzeUrl } from "../controllers/urlAnalysis.controller.js";
import { analyzeImage } from "../controllers/imageAnalysis.controller.js";
import { analyzePdf } from "../controllers/pdfAnalysis.controller.js";
import { analyzeDocx } from "../controllers/docxAnalysis.controller.js";
import { analyzeAudio } from "../controllers/audioAnalysis.controller.js";
import { analyzePptx } from "../controllers/pptxAnalysis.controller.js";
import { analyzeBatch } from "../controllers/batchAnalysis.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { BATCH_CONFIG } from "../config/batch.config.js";

const router = express.Router();

router.post("/text", analyzeText);
router.post("/url", analyzeUrl);
router.post("/image", upload.single("image"), analyzeImage);
router.post("/pdf", upload.single("file"), analyzePdf);
router.post("/docx", upload.single("file"), analyzeDocx);
router.post("/audio", upload.single("file"), analyzeAudio);
router.post("/pptx", upload.single("file"), analyzePptx);
router.post("/batch", upload.array("files", BATCH_CONFIG.MAX_FILES), analyzeBatch);

export default router;
