import fetchUrl from "./fetchUrl.js";
import extractArticleText, { createUrlDocument } from "./extractArticleText.js";
import classifyPage from "./classifyPage.js";
import extractUrlMetadata, {
  getStructuredDataTypes,
} from "./extractUrlMetadata.js";
import normalizeArticle from "./normalizeArticle.js";
import getArticleSuitability from "./pageSuitability.js";

export const processUrl = async (url) => {
  if (!url) {
    throw new Error("URL is required.");
  }

  const html = await fetchUrl(url);
  const document = createUrlDocument(html, url);
  let articleText = "";
  let readability = null;

  try {
    const extraction = extractArticleText(document);
    articleText = extraction.articleText;
    readability = extraction.readability;
  } catch {
    articleText = document.body?.textContent?.trim() || "";
  }

  const urlMetadata = extractUrlMetadata(document, url, readability);
  const structuredDataTypes = getStructuredDataTypes(document);
  const { pageType, pageTypeConfidence } = classifyPage({
    document,
    url,
    articleText,
    metadata: urlMetadata,
    structuredDataTypes,
  });
  const { isArticle, message } = getArticleSuitability(pageType);

  if (!isArticle) {
    return {
      processedContent: null,
      urlMetadata,
      pageType,
      pageTypeConfidence,
      isArticle,
      message,
    };
  }

  const processedContent = normalizeArticle(articleText);

  if (!processedContent) {
    throw new Error("Failed to process article content.");
  }

  return {
    processedContent,
    urlMetadata,
    pageType,
    pageTypeConfidence,
    isArticle,
    message,
  };
};

export default processUrl;
