import { PPTX_CONFIG } from "../../config/pptx.config.js";


const normalizeSlides = (rawText) => {
  if (!rawText) {
    return {
      normalizedText: "",
      truncated: { isTruncated: false, reason: null },
    };
  }

  let normalizedText = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  const truncated = { isTruncated: false, reason: null };

  if (normalizedText.length > PPTX_CONFIG.MAX_TEXT_LENGTH) {
    normalizedText = normalizedText.substring(0, PPTX_CONFIG.MAX_TEXT_LENGTH);
    truncated.isTruncated = true;
    truncated.reason = `PPTX content exceeded maximum length of ${PPTX_CONFIG.MAX_TEXT_LENGTH} characters. Content has been truncated.`;
  }

  return { normalizedText, truncated };
};

export default normalizeSlides;
