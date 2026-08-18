import BatchAnalysisReport from "../../models/BatchAnalysisReport.js";
import { generateHash } from "../../utils/hash.js";
import buildBatchAnalysisPrompt, {
  BATCH_PROMPT_VERSION,
} from "../../prompts/batchAnalysis.prompt.js";
import { generateAnalysis } from "../ai.service.js";


export const analyzeBatchSinglePromptStrategy = async (input) => {
  const { processedContent, metadata, failedFiles } = input;

  if (!processedContent) {
    throw new Error("Missing merged content for batch analysis.");
  }

  const analysisHash = generateHash(processedContent);
  const status = failedFiles && failedFiles.length > 0 ? "partial_success" : "processing";

  const report = await BatchAnalysisReport.create({
    status: status,
    originalInput: "batch_upload",
    processedContent,
    analysisHash,
    failedFiles: failedFiles || [],
    metadata: {
      provider: "Google",
      model: process.env.GEMINI_MODEL,
      processingDuration: 0,
      analysisVersion: 1,
      promptVersion: BATCH_PROMPT_VERSION,
      batch: metadata.batch // Transfer batch metadata stats
    },
  });

  const prompt = buildBatchAnalysisPrompt(processedContent);
  const startTime = Date.now();

  // Re-use the existing AI engine generic call
  const analysis = await generateAnalysis(prompt);

  const processingDuration = Date.now() - startTime;

  report.analysis = analysis;
  report.status = failedFiles && failedFiles.length > 0 ? "partial_success" : "completed";
  report.metadata.processingDuration = processingDuration;

  await report.save();
  return report;
};

export const analyzeBatchContent = analyzeBatchSinglePromptStrategy;
