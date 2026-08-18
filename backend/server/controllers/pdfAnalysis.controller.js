import { processPdf } from '../processors/pdf/index.js';
import { analyzeContent } from '../services/analysis.service.js';

export const analyzePdf = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No PDF file provided." });
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
    sendEvent({ stage: "extracting", message: "Extracting text and metadata from PDF..." });

    const processorResult = await processPdf(req.file);

    sendEvent({ stage: "analyzing", message: "AI analyzing credibility and detecting bias..." });

    const report = await analyzeContent({
      sourceType: processorResult.sourceType,
      originalInput: processorResult.originalInput,
      processedContent: processorResult.processedContent,
    }, sendEvent);

    sendEvent({ stage: "finalize", message: "Scoring and generating final report..." });

    report.metadata = { ...report.metadata, ...processorResult.metadata };
    await report.save();

    sendEvent({ stage: "complete", reportId: report._id });} catch (error) {
    sendEvent({ stage: "error", message: error.message || "An unexpected error occurred." });
  } finally {
    clearInterval(keepAlive);
    res.end();
  }
};
