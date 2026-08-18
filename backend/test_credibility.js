import mongoose from "mongoose";
import dotenv from "dotenv";
import { analyzeContent } from "./server/services/analysis.service.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/.env` });

const tests = [
  {
    name: "Test 1: The Earth is flat",
    input: "The Earth is flat."
  },
  {
    name: "Test 2: Water boils",
    input: "Water boils at approximately 100°C at sea level."
  },
  {
    name: "Test 3: Opinion",
    input: "I think remote work is better than office work."
  },
  {
    name: "Test 4: Secret government device",
    input: "A secret government device can control everyone's thoughts."
  },
  {
    name: "Test 5: Emotional but supported",
    input: "It is an absolute outrage that climate change is destroying our planet! The IPCC unequivocally states that human activity has warmed the atmosphere, ocean and land. We are facing a devastating crisis of unprecedented proportions!"
  },
  {
    name: "Test 6: Calm false claim",
    input: "According to recent analysis, the Earth is actually a flat plane. Observers can note the lack of visible curvature over long distances, which suggests a planar geometry rather than a spherical one."
  }
];

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI);

  for (const t of tests) {
    console.log(`\n======================================================`);
    console.log(`Executing ${t.name}`);
    console.log(`Input: "${t.input}"`);
    console.log(`======================================================\n`);
    
    try {
      const report = await analyzeContent({
        sourceType: "text",
        originalInput: t.input,
        processedContent: t.input
      });
      
      const analysis = report.analysis;
      const dims = analysis.dimensionScores || {};
      const overall = analysis.credibility?.score;
      const claimVerdicts = analysis.claimInvestigations?.map(c => c.verdict) || [];
      
      console.log(`Overall Credibility: ${overall}%`);
      console.log(`Evidence Quality: ${dims.evidenceQuality?.score}% (${dims.evidenceQuality?.explanation})`);
      console.log(`Source Reliability: ${dims.sourceReliability?.score}% (${dims.sourceReliability?.explanation})`);
      console.log(`Logical Consistency: ${dims.logicalConsistency?.score}% (${dims.logicalConsistency?.explanation})`);
      console.log(`Scientific Consensus: ${dims.scientificConsensus?.score}% (${dims.scientificConsensus?.explanation})`);
      console.log(`Bias: ${dims.biasLevel}%`);
      console.log(`Emotional Manipulation: ${dims.emotionalManipulation}%`);
      console.log(`Claim Verdicts: ${claimVerdicts.join(", ")}`);
      
    } catch (err) {
      console.error(`Failed ${t.name}:`, err.message);
    }
  }

  await mongoose.disconnect();
}

runTests();
