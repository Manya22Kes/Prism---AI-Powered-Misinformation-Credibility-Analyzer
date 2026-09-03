import validateDocx from "./validateDocx.js";
import extractText from "./extractText.js";
import normalizeDocxText from "./normalizeDocxText.js";


const processDocx = async (file) => {
  const fileBuffer = file.buffer || file;
  const mimetype = file.mimetype || file.mimeType || "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const size = file.size || (fileBuffer?.length ?? 0);
  const originalname = file.originalname || "document.docx";

  // 1. Validation
  validateDocx(fileBuffer, mimetype, size);

  // 2. Extraction
  const { rawText, metadata } = await extractText(fileBuffer);

  // 3. Normalization
  const { normalizedText, truncated } = normalizeDocxText(rawText);

  // 4. Construct Final Metadata
  const docxMetadata = {
    file: {
      originalname,
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
    originalInput: originalname,
    processedContent: normalizedText,
    metadata: docxMetadata,
  };
};

export default processDocx;
