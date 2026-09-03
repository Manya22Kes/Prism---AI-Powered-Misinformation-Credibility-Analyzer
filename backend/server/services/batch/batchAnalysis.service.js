import BatchAnalysisReport from "../../models/BatchAnalysisReport.js";
import { generateHash } from "../../utils/hash.js";
import buildBatchAnalysisPrompt, {
  BATCH_PROMPT_VERSION,
} from "../../prompts/batchAnalysis.prompt.js";
import { generateAnalysis } from "../ai.service.js";


export const analyzeBatchSinglePromptStrategy = async (input, individualReports, onProgress = null) => {
  const { processedContent, metadata, failedFiles } = input;

  if (!processedContent) {
    throw new Error("Missing merged content for batch analysis.");
  }

  const analysisHash = generateHash(processedContent);
  const status = failedFiles && failedFiles.length > 0 ? "partial_success" : "processing";

  const prompt = buildBatchAnalysisPrompt(processedContent);
  const startTime = Date.now();

  // Re-use the existing AI engine generic call
  let analysis = await generateAnalysis(prompt, onProgress);
  
  if (!analysis || typeof analysis !== 'object') {
    analysis = {};
  }

  // Ensure overallCredibility matches the Mongoose Schema Enum
  const validCredibilities = ["High", "Medium", "Low", "Mixed", "Not Applicable"];
  let rawCredibility = analysis.overallCredibility;
  
  if (typeof rawCredibility === 'string') {
     // Don't modify "Not Applicable", but title-case others
     if (rawCredibility.toLowerCase() === 'not applicable') {
       rawCredibility = 'Not Applicable';
     } else {
       rawCredibility = rawCredibility.charAt(0).toUpperCase() + rawCredibility.slice(1).toLowerCase();
     }
  }
  
  if (!validCredibilities.includes(rawCredibility)) {
    rawCredibility = "Not Applicable"; // Default to Not Applicable if confused
  }
  
  analysis.overallCredibility = rawCredibility;

  const processingDuration = Date.now() - startTime;

  const report = new BatchAnalysisReport({
    status: failedFiles && failedFiles.length > 0 ? "partial_success" : "completed",
    originalInput: "batch_upload",
    processedContent,
    analysisHash,
    failedFiles: failedFiles || [],
    reports: individualReports ? individualReports.map(r => r._id) : [],
    analysis: analysis,
    metadata: {
      provider: "Google",
      model: analysis?._modelUsed || process.env.GEMINI_MODEL || "gemini-3.7-flash",
      processingDuration: processingDuration,
      analysisVersion: 1,
      promptVersion: BATCH_PROMPT_VERSION,
      batch: metadata.batch // Transfer batch metadata stats
    },
  });

  await report.save();
  return report;
};

export const analyzeBatchContent = analyzeBatchSinglePromptStrategy;
