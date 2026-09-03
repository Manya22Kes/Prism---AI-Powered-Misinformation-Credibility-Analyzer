import { analyzeContent } from "../services/analysis.service.js";
import { logActivity } from "../services/activity.service.js";
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

    const processorResult = await processAudio(req.file);

    sendEvent({ stage: "analyzing", message: "AI analyzing credibility and detecting bias..." });

    const report = await analyzeContent({
      sourceType: processorResult.sourceType,
      originalInput: processorResult.originalInput,
      processedContent: processorResult.processedContent,
    }, sendEvent);

    sendEvent({ stage: "finalize", message: "Scoring and generating final report..." });

    report.set('metadata', {
      ...(report.metadata ? report.metadata.toObject() : {}),
      ...processorResult.metadata
    });
    await report.save();
    
    const title = report.metadata?.title || report.metadata?.urlMetadata?.title || report.originalInput || "Report";
    await logActivity({
      eventType: "ANALYSIS_COMPLETED",
      entityType: "Report",
      entityId: report._id,
      title: `Analyzed: ${title}`
    });

    sendEvent({ stage: "complete", reportId: report._id });} catch (error) {
    await logActivity({
      eventType: "ANALYSIS_FAILED",
      entityType: "System",
      title: "Analysis Failed: Audio",
      description: error.message || "An unexpected error occurred."
    }).catch(e => console.error("Failed to log activity", e));
    sendEvent({ stage: "error", message: error.message || "An unexpected error occurred." });
  } finally {
    clearInterval(keepAlive);
    res.end();
  }
};
