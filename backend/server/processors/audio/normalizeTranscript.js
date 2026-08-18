import { AUDIO_CONFIG } from "../../config/audio.config.js";


const normalizeTranscript = (text) => {
  if (!text) {
    return {
      normalizedText: "",
      truncated: { isTruncated: false, reason: null },
    };
  }

  // 1. Clean up excessive whitespace
  let normalizedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  // 2. Check limits and truncate if necessary
  const truncated = { isTruncated: false, reason: null };

  if (normalizedText.length > AUDIO_CONFIG.MAX_TRANSCRIPT_LENGTH) {
    normalizedText = normalizedText.substring(0, AUDIO_CONFIG.MAX_TRANSCRIPT_LENGTH);
    truncated.isTruncated = true;
    truncated.reason = `Audio transcript exceeded maximum length of ${AUDIO_CONFIG.MAX_TRANSCRIPT_LENGTH} characters. Content has been truncated.`;
  }

  return { normalizedText, truncated };
};

export default normalizeTranscript;
