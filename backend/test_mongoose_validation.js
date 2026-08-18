import mongoose from "mongoose";
import AnalysisReport from "./server/models/AnalysisReport.js";

async function runTest() {
  const report = new AnalysisReport({
    status: "processing",
    sourceType: "url",
    originalInput: "test",
    processedContent: "test",
    analysisHash: "test",
    analysis: {
      riskIndicators: [
        {
          title: "Test Risk",
          severity: "High",
          confidenceScore: 90,
          explanation: "",
          recommendation: "",
          issues: ["Issue 1"]
        }
      ]
    }
  });

  try {
    await report.validate();
    console.log("VALIDATION PASSED");
  } catch (err) {
    console.error("VALIDATION FAILED", err.message);
  }
}

runTest();
