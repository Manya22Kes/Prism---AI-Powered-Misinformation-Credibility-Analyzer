import { analyzeContent } from "../services/analysis.service.js";
import { processAudio } from "../processors/audio/index.js";

export const analyzeAudio = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }

  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const keepAlive = setInterval(() => { res.write(':ping\n\n'); }, 15000);

  try {
    sendEvent({ stage: "extracting", message: "Transcribing audio via speech-to-text..." });

    const {
      sourceType,
      originalInput,
      processedContent,
      metadata,
    } = await processAudio(req.file.buffer, req.file.mimetype, req.file.size);

    sendEvent({ stage: "analyzing", message: "AI analyzing credibility and detecting bias..." });

    const report = await analyzeContent({
      sourceType,
      originalInput,
      processedContent,
    });

    sendEvent({ stage: "finalize", message: "Scoring and generating final report..." });

    report.metadata = { ...report.metadata, ...metadata };
    await report.save();

    sendEvent({ stage: "complete", reportId: report._id });} catch (error) {
    sendEvent({ stage: "error", message: error.message || "An unexpected error occurred." });
  } finally {
    clearInterval(keepAlive);
    res.end();
  }
};
