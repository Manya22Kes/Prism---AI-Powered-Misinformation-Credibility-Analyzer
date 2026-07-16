const MAX_ARTICLE_LENGTH = 25000;

export const normalizeArticle = (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Article text is empty or invalid.");
  }

  let normalized = text
    // Normalize line endings
    .replace(/\r\n/g, "\n")

    // Remove tabs
    .replace(/\t/g, " ")

    // Collapse multiple spaces
    .replace(/[ ]{2,}/g, " ")

    // Collapse excessive blank lines
    .replace(/\n{3,}/g, "\n\n")

    // Trim surrounding whitespace
    .trim();

  if (!normalized.length) {
    throw new Error("Article contains no readable content.");
  }

  // Prevent extremely large articles from exceeding model limits
  if (normalized.length > MAX_ARTICLE_LENGTH) {
    normalized = normalized.slice(0, MAX_ARTICLE_LENGTH);
  }

  return normalized;
};

export default normalizeArticle;
