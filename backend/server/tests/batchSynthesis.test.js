import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import buildBatchAnalysisPrompt from '../prompts/batchAnalysis.prompt.js';
import { generateAnalysis } from '../services/ai.service.js';

const runTest = async (testName, mergedContent) => {
  console.log(`\n===========================================`);
  console.log(`[TEST] ${testName}`);
  console.log(`===========================================`);
  
  const prompt = buildBatchAnalysisPrompt(mergedContent);
  
  try {
    const analysis = await generateAnalysis(prompt);
    console.log(JSON.stringify(analysis, null, 2));
  } catch (err) {
    console.error(`Test failed: ${err.message}`);
  }
};

const runAllTests = async () => {
  // Test A - Unrelated Documents
  await runTest('Test A: Unrelated Documents (Image about Topic A + PDF about Topic B)', `
===== DOCUMENT 1 =====
Type: IMAGE
Filename: recipe.jpg
Content:
How to bake a chocolate cake: Preheat oven to 350F. Mix flour, sugar, cocoa powder, baking soda, and salt. Add eggs, milk, oil, and vanilla. Bake for 30 minutes.

========================

===== DOCUMENT 2 =====
Type: PDF
Filename: quarterly_report.pdf
Content:
Q3 Financial Results: Revenue increased by 15% year-over-year. Operating expenses were reduced by 5% due to supply chain optimizations. Net income sits at $45M.

========================
  `);

  // Test B - Corroborating Documents
  await runTest('Test B: Corroborating Documents', `
===== DOCUMENT 1 =====
Type: PDF
Filename: incident_report_alpha.pdf
Content:
The server outage on Tuesday was caused by a memory leak in the redis caching layer. This was isolated to the us-east-1 region.

========================

===== DOCUMENT 2 =====
Type: PDF
Filename: incident_report_beta.pdf
Content:
According to the post-mortem, Tuesday's downtime originated from redis instances running out of memory. The issue only affected our east coast data centers.

========================
  `);

  // Test C - Contradictory Documents
  await runTest('Test C: Contradictory Documents', `
===== DOCUMENT 1 =====
Type: DOCX
Filename: witness_statement_1.docx
Content:
I clearly saw the suspect flee the scene in a red Toyota sedan immediately after the alarm sounded at 10:15 PM.

========================

===== DOCUMENT 2 =====
Type: PDF
Filename: witness_statement_2.pdf
Content:
At exactly 10:15 PM when the alarms went off, the suspect jumped into a blue Ford pickup truck and drove away.

========================
  `);

  // Test D - Three Documents
  await runTest('Test D: Three Documents (Complex Synthesis)', `
===== DOCUMENT 1 =====
Type: TEXT
Filename: doc1.txt
Content:
The new 'Project X' algorithm has been shown to improve processing efficiency by 20%. However, it requires double the memory allocation.

========================

===== DOCUMENT 2 =====
Type: TEXT
Filename: doc2.txt
Content:
Recent benchmarks on Project X confirm a 20% speedup. The memory footprint, unfortunately, is twice as large as the previous version.

========================

===== DOCUMENT 3 =====
Type: TEXT
Filename: doc3.txt
Content:
Despite claims from the development team, our independent tests show Project X only improves efficiency by 5%, making the 2x memory cost unjustified.

========================
  `);
};

runAllTests();
