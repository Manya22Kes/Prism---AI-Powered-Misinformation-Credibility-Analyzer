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

    sendEvent({ stage: "analyzing", message: "AI synthesizing cross-source relationships..." });

    const report = await analyzeBatchContent(processorResult);

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
    });} catch (error) {
    sendEvent({ stage: "error", message: error.message || "An unexpected error occurred." });
  } finally {
    clearInterval(keepAlive);
    res.end();
  }
};
