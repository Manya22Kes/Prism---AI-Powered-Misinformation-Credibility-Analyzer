import { BATCH_CONFIG } from "../../config/batch.config.js";


const mergeContent = (successfulFiles) => {
  let mergedText = "";
  let isTruncated = false;
  let reason = null;

  for (let i = 0; i < successfulFiles.length; i++) {
    const fileData = successfulFiles[i];
    const { originalName, sourceType, processedContent } = fileData;
    
    const header = `\n===== DOCUMENT ${i + 1} =====\nType: ${sourceType.toUpperCase()}\nFilename: ${originalName}\nContent:\n`;
    const footer = `\n========================\n`;

    const section = header + processedContent + footer;

    if (mergedText.length + section.length > BATCH_CONFIG.MAX_TOTAL_TEXT) {
      const remainingSpace = BATCH_CONFIG.MAX_TOTAL_TEXT - mergedText.length;
      
      // If we can't even fit the header, stop completely
      if (remainingSpace <= header.length + footer.length + 100) {
        isTruncated = true;
        reason = `Batch output truncated due to exceeding MAX_TOTAL_TEXT (${BATCH_CONFIG.MAX_TOTAL_TEXT} chars). Remaining files were omitted.`;
        break;
      }

      // Truncate the current document content
      const truncatedContentLength = remainingSpace - header.length - footer.length - 50; // buffer
      const truncatedContent = processedContent.substring(0, truncatedContentLength) + "\n...[CONTENT TRUNCATED]...";
      mergedText += header + truncatedContent + footer;

      isTruncated = true;
      reason = `Batch output truncated due to exceeding MAX_TOTAL_TEXT (${BATCH_CONFIG.MAX_TOTAL_TEXT} chars).`;
      break;
    } else {
      mergedText += section;
    }
  }

  return {
    mergedText: mergedText.trim(),
    totalCharacters: mergedText.length,
    isTruncated,
    reason,
  };
};

export default mergeContent;
