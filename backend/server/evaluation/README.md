# Prism Evaluation Harness

This directory contains a developer-only evaluation harness for the existing Prism analysis pipeline.

It does not add API routes, change schemas, or bypass the production analysis flow. The evaluator calls `analyzeContent()` with:

```js
{
  sourceType: "text",
  originalInput: testCase.input,
  processedContent: testCase.input,
}
```

Because `analyzeContent()` only requires `sourceType`, `originalInput`, and `processedContent`, it remains generic. The service does not need to know whether `processedContent` came from raw text, a URL scraper, OCR, PDF extraction, or a Word document extractor.

## Run

From `backend/`:

```bash
npm run evaluate
```

Run a smaller sample while refining prompts:

```bash
npm run evaluate -- --limit=5
```

Retry behavior can be tuned from the command line:

```bash
npm run evaluate -- --limit=5 --maxRetries=2 --retryBaseMs=3000
```

The same retry options can be set with `EVALUATION_MAX_RETRIES` and `EVALUATION_RETRY_BASE_MS`.

## Test Cases

`testCases.js` contains 30 realistic evaluation inputs across reliable reporting, scientific announcements, misinformation, medical claims, scams, satire, social media rumors, climate claims, politics, finance, technology, entertainment, sports, and mixed factual/opinion content.

Each case defines expected ranges instead of exact scores:

```js
{
  id,
  category,
  title,
  input,
  expected: {
    overallVerdict,
    acceptableVerdicts,
    credibilityRange,
    manipulationRange,
    biasRange,
    expectedRiskIndicators,
  },
}
```

## Report Format

Each run writes timestamped Markdown and JSON files to `results/`.

The Markdown report includes:

- Overall passed, partial, and failed counts
- Skipped quota cases
- Failure type counts for model, network, quota, and evaluation failures
- Category accuracy
- Average credibility, manipulation, and bias error
- Average scores by category
- Common risk indicators
- Most common failed checks
- Prompt weakness suggestions
- Average processing time
- A one-line result for every case
- Detailed per-case checks comparing expected values with actual model output

Use the Markdown report to spot prompt weaknesses, brittle scoring behavior, or categories that need more precise instructions.
