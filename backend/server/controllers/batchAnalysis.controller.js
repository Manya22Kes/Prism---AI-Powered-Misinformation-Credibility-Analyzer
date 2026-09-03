import { processBatch } from "../processors/batch/index.js";
import { analyzeBatchContent } from "../services/batch/batchAnalysis.service.js";


export const analyzeBatch = async (req, res, next) => {
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ success: false, message: "No files uploaded for batch." });
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
    sendEvent({ stage: "extracting", message: "Processing batch documents..." });

    const processorResult = await processBatch(files);

    sendEvent({ stage: "analyzing_individual", message: "Level 1: Running individual claim investigations..." });
    
    // Level 1: Individual Analysis
    const individualReports = [];
    // We import analyzeContent dynamically or from the analysis.service.js
    const { analyzeContent } = await import('../services/analysis.service.js');
    
    for (const fileData of processorResult.successfulFiles) {
      try {
        const report = await analyzeContent({
          sourceType: fileData.sourceType,
          originalInput: fileData.originalInput || fileData.originalName || fileData.filename || "Unknown_File",
          processedContent: fileData.processedContent
        }, null); // skip individual SSE to keep batch SSE clean

        // Inject source metadata (e.g. filename, mimeType) so individual reports retain it
        report.set('metadata', {
          ...(report.metadata ? report.metadata.toObject() : {}),
          ...fileData.metadata
        });
        await report.save();

        individualReports.push(report);
      } catch (err) {
        console.error(`Failed to analyze individual file ${fileData.originalInput || fileData.originalName}:`, err);
        // Continue processing others, but we could add this to failedFiles
      }
    }

    sendEvent({ stage: "analyzing", message: "Level 2: AI synthesizing cross-source relationships..." });

    const report = await analyzeBatchContent(processorResult, individualReports);

    sendEvent({ stage: "finalize", message: "Scoring and generating batch report..." });

    const statusText = processorResult.failedFiles.length > 0 ? "partial_success" : "success";

    sendEvent({ 
      stage: "complete", 
      reportId: report._id,
      batchStatus: {
        status: statusText,
        processedFiles: processorResult.metadata.batch.fileCount - processorResult.failedFiles.length,
        failedFiles: processorResult.failedFiles.length > 0 ? processorResult.failedFiles : undefined
      }
    });
  } catch (error) {
    await logActivity({
      eventType: "BATCH_ANALYSIS_FAILED",
      entityType: "System",
      title: "Batch Analysis Failed",
      description: error.message || "An unexpected error occurred."
    }).catch(e => console.error("Failed to log activity", e));
    sendEvent({ stage: "error", message: error.message || "An unexpected error occurred." });
  } finally {
    clearInterval(keepAlive);
    res.end();
  }
};
