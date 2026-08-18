import { processImage } from '../processors/image/index.js';
import { analyzeContent } from '../services/analysis.service.js';

export const analyzeImage = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image uploaded." });
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

  // Keep-alive ping to prevent "Failed to fetch" caused by TCP idle timeout
  const keepAlive = setInterval(() => {
    res.write(':ping\n\n');
  }, 15000);

  try {
    sendEvent({ stage: "extracting", message: "Running OCR to extract text from image..." });

    const processedImage = await processImage(req.file);

    sendEvent({ stage: "analyzing", message: "AI analyzing credibility and detecting bias..." });

    const report = await analyzeContent({
      sourceType: processedImage.sourceType,
      originalInput: processedImage.originalInput,
      processedContent: processedImage.processedContent,
    });

    sendEvent({ stage: "finalize", message: "Scoring and generating final report..." });

    report.metadata.file = processedImage.metadata.file;
    report.metadata.ocr = processedImage.metadata.ocr;
    await report.save();

    sendEvent({ stage: "complete", reportId: report._id });
  } catch (error) {
    sendEvent({ stage: "error", message: error.message || "An unexpected error occurred." });
  } finally {
    clearInterval(keepAlive);
    res.end();
  }
};
