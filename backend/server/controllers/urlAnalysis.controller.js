import { analyzeContent } from "../services/analysis.service.js";
import { processUrl } from "../processors/url/index.js";
import {
  URL_BLOCKED_ERROR_CODE,
  URL_BLOCKED_MESSAGE,
} from "../processors/url/fetchUrl.js";
import validateUrl from "../utils/urlValidator.js";

export const analyzeUrl = async (req, res, next) => {
  const { url } = req.body;

  let validatedUrl;
  try {
    validatedUrl = validateUrl(url);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
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
    sendEvent({ stage: "extracting", message: "Fetching and extracting web content..." });

    const {
      processedContent,
      urlMetadata,
      pageType,
      pageTypeConfidence,
      isArticle,
      message,
    } = await processUrl(validatedUrl);

    if (!isArticle) {
      sendEvent({ stage: "error", message });
      return res.end();
    }

    sendEvent({ stage: "analyzing", message: "AI analyzing credibility and detecting bias..." });

    const report = await analyzeContent({
      sourceType: "url",
      originalInput: validatedUrl,
      processedContent,
    }, sendEvent);

    sendEvent({ stage: "finalize", message: "Scoring and generating final report..." });

    report.metadata.urlMetadata = urlMetadata;
    report.metadata.pageType = pageType;
    report.metadata.pageTypeConfidence = pageTypeConfidence;
    report.metadata.isArticle = isArticle;

    await report.save();

    sendEvent({ stage: "complete", reportId: report._id });} catch (error) {
    if (error.code === URL_BLOCKED_ERROR_CODE) {
      sendEvent({ stage: "error", message: URL_BLOCKED_MESSAGE });
    } else {
      sendEvent({ stage: "error", message: error.message || "An unexpected error occurred." });
    }
  } finally {
    clearInterval(keepAlive);
    res.end();
  }
};
