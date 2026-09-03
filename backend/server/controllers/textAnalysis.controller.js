import { analyzeContent } from "../services/analysis.service.js";
import { processText } from "../processors/text/index.js";
import { logActivity } from "../services/activity.service.js";

export const analyzeText = async (req, res, next) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, message: "Content is required." });
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
    sendEvent({ stage: "extracting", message: "Extracting raw text..." });

    const {
      sourceType,
      originalInput,
      processedContent,
      metadata
    } = await processText(content);

    sendEvent({ stage: "analyzing", message: "AI evaluating credibility and detecting bias..." });

    const report = await analyzeContent({
      sourceType,
      originalInput,
      processedContent,
    }, sendEvent);

    sendEvent({ stage: "finalize", message: "Scoring and generating final report..." });

    // Merge in text-specific metadata
    report.metadata = { ...report.metadata, ...metadata };
    await report.save();

    await logActivity({
      eventType: "ANALYSIS_COMPLETED",
      entityType: "Report",
      entityId: report._id,
      title: `Analyzed Text`
    });

    sendEvent({ stage: "complete", reportId: report._id });} catch (error) {
    await logActivity({
      eventType: "ANALYSIS_FAILED",
      entityType: "System",
      title: "Analysis Failed: Text",
      description: error.message || "An unexpected error occurred."
    }).catch(e => console.error("Failed to log activity", e));
    sendEvent({ stage: "error", message: error.message || "An unexpected error occurred." });
  } finally {
    clearInterval(keepAlive);
    res.end();
  }
};
