import validateDocx from "./validateDocx.js";
import extractText from "./extractText.js";
import normalizeDocxText from "./normalizeDocxText.js";


const processDocx = async (fileBuffer, mimetype, size) => {
  // 1. Validation
  validateDocx(fileBuffer, mimetype, size);

  // 2. Extraction
  const { rawText, metadata } = await extractText(fileBuffer);

  // 3. Normalization
  const { normalizedText, truncated } = normalizeDocxText(rawText);

  // 4. Construct Final Metadata
  const docxMetadata = {
    file: {
      mimeType: mimetype,
      size,
    },
    docx: {
      ...metadata,
      hasHeadersFooters: false, // Mammoth ignores headers/footers by design
      truncated,
    },
  };

  // 5. Return Standard Processor Contract
  return {
    sourceType: "docx",
    originalInput: "docx_buffer", // We do not store the buffer itself in the contract to save memory
    processedContent: normalizedText,
    metadata: docxMetadata,
  };
};

export default processDocx;
