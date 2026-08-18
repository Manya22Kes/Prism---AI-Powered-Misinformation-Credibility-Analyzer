import { processPptx } from "../processors/pptx/index.js";
import { analyzeContent } from "../services/analysis.service.js";

export const analyzePptx = async (req, res, next) => {
  console.log("PPTX Request received. File:", req.file ? `Size: ${req.file.size} bytes, Mimetype: ${req.file.mimetype}` : "None");
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No PPTX file provided." });
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
    sendEvent({ stage: "extracting", message: "Extracting slides and speaker notes..." });

    const processedData = await processPptx(req.file.buffer, req.file.mimetype, req.file.size);

    sendEvent({ stage: "analyzing", message: "AI analyzing credibility and detecting bias..." });

    const report = await analyzeContent({
      sourceType: processedData.sourceType,
      originalInput: processedData.originalInput,
      processedContent: processedData.processedContent,
    });

    sendEvent({ stage: "finalize", message: "Scoring and generating final report..." });

    report.metadata = { ...report.metadata, ...processedData.metadata };
    await report.save();

    sendEvent({ stage: "complete", reportId: report._id });} catch (error) {
    sendEvent({ stage: "error", message: error.message || "An unexpected error occurred." });
  } finally {
    clearInterval(keepAlive);
    res.end();
  }
};
