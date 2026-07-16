import { analyzeContent } from "../services/analysis.service.js";
import { processUrl } from "../processors/url/index.js";
import {
  URL_BLOCKED_ERROR_CODE,
  URL_BLOCKED_MESSAGE,
} from "../processors/url/fetchUrl.js";
import validateUrl from "../utils/urlValidator.js";

export const analyzeText = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required.",
      });
    }

    const report = await analyzeContent({
      sourceType: "text",
      originalInput: content,
      processedContent: content,
    });

    return res.status(200).json({
      success: true,
      message: "Content analyzed successfully.",
      data: report,
    });
  } catch (error) {
    if (error.code === URL_BLOCKED_ERROR_CODE) {
      const statusCode = error.originalStatusCode === 429 ? 422 : 403;

      return res.status(statusCode).json({
        success: false,
        code: URL_BLOCKED_ERROR_CODE,
        message: URL_BLOCKED_MESSAGE,
      });
    }

    next(error);
  }
};

export const analyzeUrl = async (req, res, next) => {
  try {
    const { url } = req.body;

    const validatedUrl = validateUrl(url);

    const {
      processedContent,
      urlMetadata,
      pageType,
      pageTypeConfidence,
      isArticle,
      message,
    } = await processUrl(validatedUrl);

    if (!isArticle) {
      return res.status(400).json({
        success: false,
        message,
        metadata: {
          pageType,
          pageTypeConfidence,
          isArticle,
          urlMetadata,
        },
      });
    }

    const report = await analyzeContent({
      sourceType: "url",
      originalInput: validatedUrl,
      processedContent,
    });

    report.metadata.urlMetadata = urlMetadata;
    report.metadata.pageType = pageType;
    report.metadata.pageTypeConfidence = pageTypeConfidence;
    report.metadata.isArticle = isArticle;

    await report.save();

    return res.status(200).json({
      success: true,
      message: "URL analyzed successfully.",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
