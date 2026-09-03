import validateBatch from "./validateBatch.js";
import mergeContent from "./mergeContent.js";

// Processors
import { processPdf } from "../pdf/index.js";
import { processDocx } from "../docx/index.js";
import { processPptx } from "../pptx/index.js";
import { processImage } from "../image/index.js";
import { processAudio } from "../audio/index.js";
import { processText } from "../text/index.js";


const processBatch = async (files) => {
  // 1. Global Validation
  validateBatch(files);

  const successfulFiles = [];
  const failedFiles = [];
  
  const stats = {
    fileCount: files.length,
    containsImages: false,
    containsAudio: false,
    containsDocuments: false,
    containsUrls: false,
  };

  const startTime = Date.now();

  // 2. Iterate and Route
  for (const file of files) {
    try {
      let processorResult;

      if (file.mimetype === 'application/pdf') {
        processorResult = await processPdf(file);
        stats.containsDocuments = true;
      } 
      else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        processorResult = await processDocx(file);
        stats.containsDocuments = true;
      }
      else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        processorResult = await processPptx(file);
        stats.containsDocuments = true;
      }
      else if (file.mimetype.startsWith('image/')) {
        processorResult = await processImage(file);
        stats.containsImages = true;
      }
      else if (file.mimetype.startsWith('audio/')) {
        processorResult = await processAudio(file);
        stats.containsAudio = true;
      }
      else if (file.mimetype === 'text/plain') {
        const textContent = file.buffer.toString('utf8');
        processorResult = await processText(textContent);
        stats.containsDocuments = true; // Technically text
      }
      else {
        throw new Error(`Unsupported mimetype in batch: ${file.mimetype}`);
      }

      // Attach original name for merging
      processorResult.originalName = file.originalname || file.filename || "Unknown_File";
      successfulFiles.push(processorResult);

    } catch (error) {
      // Partial Success Strategy: Record the error and continue
      failedFiles.push({
        filename: file.originalname || file.filename || "Unknown_File",
        reason: error.message || "Failed to process file",
      });
    }
  }

  // 3. Fail entirely if NO files succeeded
  if (successfulFiles.length === 0) {
    const errorMsg = failedFiles.map(f => `${f.filename}: ${f.reason}`).join(" | ");
    const err = new Error(`Batch processing failed completely. Errors: ${errorMsg}`);
    err.statusCode = 400;
    throw err;
  }

  // 4. Merge Content
  const { mergedText, totalCharacters, isTruncated, reason } = mergeContent(successfulFiles);

  stats.processingTime = Date.now() - startTime;
  stats.totalCharacters = totalCharacters;
  stats.truncated = { isTruncated, reason };
  stats.files = successfulFiles.map(f => ({
    filename: f.originalInput || f.originalName || "Unknown_File",
    sourceType: f.sourceType,
    metadata: f.metadata
  }));

  // 5. Build standard payload
  return {
    sourceType: "batch",
    originalInput: "batch_upload",
    processedContent: mergedText,
    successfulFiles,
    failedFiles,
    metadata: {
      batch: stats
    }
  };
};

export default processBatch;
