import AnalysisReport from "../models/AnalysisReport.js";
import { generateHash } from "../utils/hash.js";
import buildAnalysisPrompt, {
  PROMPT_VERSION,
} from "../prompts/analysis.prompt.js";
import { generateAnalysis } from "./ai.service.js";
import { normalizeAnalysis } from "../utils/normalizeAnalysis.js";

export const analyzeContent = async (input, onProgress) => {
  const { sourceType, originalInput, processedContent } = input;

  if (!sourceType || !originalInput || !processedContent) {
    throw new Error("Missing required analysis input.");
  }

  const analysisHash = generateHash(processedContent);

  const report = await AnalysisReport.create({
    status: "processing",

    sourceType,

    originalInput,

    processedContent,

    analysisHash,

    metadata: {
      provider: "Google",
      model: process.env.GEMINI_MODEL,
      processingDuration: 0,
      analysisVersion: 4,
      promptVersion: PROMPT_VERSION,
    },
  });

  const prompt = buildAnalysisPrompt(processedContent);

  const startTime = Date.now();

  if (onProgress) {
    onProgress({ stage: "analyzing", message: "Investigating major claims & analyzing evidence..." });
  }

  const progressTimer = setTimeout(() => {
    if (onProgress) {
      onProgress({ stage: "finalize", message: "Deriving overall verdict, trust drivers & credibility signals..." });
    }
  }, 3500);

  let analysis;
  try {
    analysis = await generateAnalysis(prompt);
  } finally {
    clearTimeout(progressTimer);
  }

  const processingDuration = Date.now() - startTime;

  const normalizedAnalysis = normalizeAnalysis(analysis);
  normalizedAnalysis.rawAiOutput = analysis;

  report.analysis = normalizedAnalysis;

  report.status = "completed";

  report.metadata.processingDuration = processingDuration;

  await report.save();
  return report;
};
