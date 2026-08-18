import { DOCX_CONFIG } from "../../config/docx.config.js";


const normalizeDocxText = (text) => {
  if (!text) {
    return {
      normalizedText: "",
      truncated: { isTruncated: false, reason: null },
    };
  }

  // 1. Clean up excessive whitespace
  let normalizedText = text
    .replace(/\r\n/g, "\n")       // Standardize line endings
    .replace(/\n{3,}/g, "\n\n")   // Collapse 3+ newlines into 2
    .replace(/[ \t]+/g, " ")      // Collapse multiple spaces/tabs into a single space
    .trim();                      // Remove leading/trailing whitespace

  // 2. Check limits and truncate if necessary
  const truncated = { isTruncated: false, reason: null };

  if (normalizedText.length > DOCX_CONFIG.MAX_TEXT_LENGTH) {
    normalizedText = normalizedText.substring(0, DOCX_CONFIG.MAX_TEXT_LENGTH);
    truncated.isTruncated = true;
    truncated.reason = `Text exceeded maximum length of ${DOCX_CONFIG.MAX_TEXT_LENGTH} characters. Content has been truncated.`;
  }

  return { normalizedText, truncated };
};

export default normalizeDocxText;
