import AnalysisReport from '../models/AnalysisReport.js';
import { processText } from '../processors/text/index.js';
import { processUrl } from '../processors/url/index.js';
import { analyzeContent } from '../services/analysis.service.js';
import { logActivity } from '../services/activity.service.js';

export const reanalyzeReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const oldReport = await AnalysisReport.findById(id);

    if (!oldReport) {
      return res.status(404).json({ success: false, message: "Analysis not found." });
    }

    // Reject unsupported source types
    const supportedTypes = ['text', 'url'];
    if (!supportedTypes.includes(oldReport.sourceType)) {
      return res.status(400).json({ 
        success: false, 
        message: "Re-analysis unavailable for this source type. Original file is not stored." 
      });
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
      let rawInput = oldReport.originalInput;
      
      // Fallback if originalInput is empty or placeholder
      if (!rawInput || rawInput === 'text_content' || rawInput === 'url_content') {
        rawInput = oldReport.processedContent;
      }

      // Handle object payloads
      if (typeof rawInput === 'object' && rawInput !== null) {
        rawInput = rawInput.text || rawInput.content || JSON.stringify(rawInput);
      }

      if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
        sendEvent({
          stage: "error",
          message: "Original analysis content is missing or unreadable. Re-analysis unavailable for this report."
        });
        return;
      }

      let processorResult;
      
      if (oldReport.sourceType === 'url' && rawInput.trim().toLowerCase().startsWith('http')) {
        sendEvent({ stage: "extracting", message: "Re-fetching URL content..." });
        try {
          processorResult = await processUrl(rawInput.trim());
        } catch (e) {
          console.warn("Re-fetching URL failed during re-analysis:", e.message);
        }

        // If re-fetching URL returned null processedContent or failed, fall back to stored processedContent
        if (!processorResult || !processorResult.processedContent) {
          if (oldReport.processedContent) {
            sendEvent({ stage: "extracting", message: "Using stored article content for re-analysis..." });
            processorResult = await processText(oldReport.processedContent);
          } else {
            throw new Error(processorResult?.message || "Unable to extract article content from URL, and stored content is unavailable.");
          }
        }
      } else {
        sendEvent({ stage: "extracting", message: "Preparing text for re-analysis..." });
        processorResult = await processText(rawInput);
      }

      sendEvent({ stage: "analyzing", message: "AI analyzing credibility and detecting bias..." });

      const newReport = await analyzeContent({
        sourceType: processorResult.sourceType || oldReport.sourceType || "text",
        originalInput: processorResult.originalInput || oldReport.originalInput || rawInput || "Re-analyzed Content",
        processedContent: processorResult.processedContent,
      }, sendEvent);

      sendEvent({ stage: "finalize", message: "Scoring and generating final report..." });

      // Retain appropriate source metadata, but ensure we don't carry over old analysis
      newReport.set('metadata', {
        ...(newReport.metadata ? newReport.metadata.toObject() : {}),
        ...processorResult.metadata
      });
      await newReport.save();

      const title = newReport.metadata?.title || newReport.metadata?.urlMetadata?.title || newReport.originalInput || "Report";
      await logActivity({
        eventType: "REPORT_REANALYZED",
        entityType: "Report",
        entityId: newReport._id,
        title: `Re-analyzed: ${title}`,
        metadata: { oldReportId: id }
      });

      sendEvent({ stage: "complete", reportId: newReport._id });
    } catch (error) {
    await logActivity({
      eventType: "ANALYSIS_FAILED",
      entityType: "System",
      title: "Re-analysis Failed",
      description: error.message || "An unexpected error occurred."
    }).catch(e => console.error("Failed to log activity", e));
      sendEvent({ stage: "error", message: error.message || "An unexpected error occurred during re-analysis." });
    } finally {
      clearInterval(keepAlive);
      res.end();
    }
  } catch (error) {
    next(error);
  }
};
