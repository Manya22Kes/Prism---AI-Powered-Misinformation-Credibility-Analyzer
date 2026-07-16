import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import dotenv from "dotenv";
import mongoose from "mongoose";

import { getRiskTerms } from "./riskVocabulary.js";
import testCases from "./testCases.js";
import { PROMPT_VERSION } from "../prompts/analysis.prompt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const RESULTS_DIR = path.join(__dirname, "results");
const PASS_THRESHOLD = 5;
const PARTIAL_THRESHOLD = 3;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_BASE_MS = 2000;

const getCliOption = (name) => {
  const option = process.argv.find((arg) => arg.startsWith(`--${name}=`));

  if (!option) return null;

  return option.split("=").slice(1).join("=");
};

const getLimit = () => {
  const limitArg = getCliOption("limit");

  if (!limitArg) return testCases.length;

  const limit = Number(limitArg);

  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("The --limit value must be a positive integer.");
  }

  return Math.min(limit, testCases.length);
};

const getPositiveIntegerOption = (name, envName, fallback) => {
  const value = getCliOption(name) || process.env[envName];

  if (!value) return fallback;

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw new Error(`The --${name} value must be a non-negative integer.`);
  }

  return parsedValue;
};

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const getHeaderValue = (headers, name) => {
  if (!headers) return null;

  if (typeof headers.get === "function") return headers.get(name);

  return headers[name] || headers[name.toLowerCase()];
};

const getRetryAfterMs = (error) => {
  const retryAfter =
    getHeaderValue(error?.response?.headers, "retry-after") ||
    getHeaderValue(error?.headers, "retry-after");

  if (!retryAfter) return null;

  const retryAfterSeconds = Number(retryAfter);

  if (Number.isFinite(retryAfterSeconds)) return retryAfterSeconds * 1000;

  const retryDate = Date.parse(retryAfter);

  if (Number.isNaN(retryDate)) return null;

  return Math.max(retryDate - Date.now(), 0);
};

const classifyError = (error) => {
  const message = `${error?.message || ""} ${error?.status || ""} ${
    error?.code || ""
  }`.toLowerCase();

  if (
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("quota")
  ) {
    return "Quota Failure";
  }

  if (
    message.includes("etimedout") ||
    message.includes("econnreset") ||
    message.includes("enotfound") ||
    message.includes("network") ||
    message.includes("fetch failed")
  ) {
    return "Network Failure";
  }

  if (
    message.includes("gemini") ||
    message.includes("google") ||
    message.includes("model") ||
    message.includes("generatecontent")
  ) {
    return "Model Failure";
  }

  return "Evaluation Failure";
};

const isRetryableFailure = (failureType) =>
  ["Quota Failure", "Network Failure", "Model Failure"].includes(failureType);

const analyzeWithRetry = async (analyzeContent, input, options) => {
  let attempt = 0;
  let lastError;

  while (attempt <= options.maxRetries) {
    try {
      const report = await analyzeContent(input);

      return {
        report,
        attempts: attempt + 1,
      };
    } catch (error) {
      lastError = error;
      const failureType = classifyError(error);
      const hasRetriesLeft = attempt < options.maxRetries;

      if (!hasRetriesLeft || !isRetryableFailure(failureType)) {
        throw Object.assign(error, {
          failureType,
          attempts: attempt + 1,
        });
      }

      const retryAfterMs = getRetryAfterMs(error);
      const backoffMs =
        retryAfterMs ?? options.retryBaseMs * 2 ** attempt;

      console.log(
        `${failureType}; retrying ${attempt + 1}/${options.maxRetries} in ${backoffMs} ms.`,
      );

      await sleep(backoffMs);
      attempt += 1;
    }
  }

  throw lastError;
};

const formatValidationError = (errors) => errors.join("; ");

const validateExpected = (testCase) => {
  const errors = [];
  const expected = testCase.expected;

  if (!expected || typeof expected !== "object") {
    return ["expected must be an object"];
  }

  const expectedVerdicts =
    expected.acceptableVerdicts || expected.overallVerdict;

  if (
    !expectedVerdicts ||
    (Array.isArray(expectedVerdicts) && !expectedVerdicts.length)
  ) {
    errors.push("expected.overallVerdict or expected.acceptableVerdicts is required");
  }

  [
    ["credibilityRange", expected.credibilityRange],
    ["manipulationRange", expected.manipulationRange],
    ["biasRange", expected.biasRange],
  ].forEach(([fieldName, range]) => {
    if (!Array.isArray(range) || range.length !== 2) {
      errors.push(`expected.${fieldName} must be a [min, max] array`);
      return;
    }

    if (!range.every((value) => Number.isFinite(Number(value)))) {
      errors.push(`expected.${fieldName} must contain numeric values`);
    }
  });

  if (!Array.isArray(expected.expectedRiskIndicators)) {
    errors.push("expected.expectedRiskIndicators must be an array");
  }

  return errors;
};

const validateAnalysis = (report) => {
  const errors = [];
  const analysis = report?.analysis;

  if (!analysis || typeof analysis !== "object") {
    return ["report.analysis is missing or invalid"];
  }

  if (!analysis.overallVerdict?.label) {
    errors.push("report.analysis.overallVerdict.label is missing");
  }

  [
    ["credibility.score", analysis.credibility?.score],
    ["emotionalManipulation.score", analysis.emotionalManipulation?.score],
    ["bias.score", analysis.bias?.score],
  ].forEach(([fieldName, score]) => {
    if (!Number.isFinite(Number(score))) {
      errors.push(`report.analysis.${fieldName} must be numeric`);
    }
  });

  if (!Array.isArray(analysis.riskIndicators)) {
    errors.push("report.analysis.riskIndicators must be an array");
  }

  return errors;
};

const getAcceptableVerdicts = (expected) => {
  if (Array.isArray(expected.acceptableVerdicts)) {
    return expected.acceptableVerdicts;
  }

  if (Array.isArray(expected.overallVerdict)) {
    return expected.overallVerdict;
  }

  return [expected.overallVerdict];
};

const serializeForDebug = (value) => {
  if (!value) return value;

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return {
      message: "Unable to serialize report for debug logging.",
      reportType: value.constructor?.name,
      reportKeys: Object.keys(value || {}),
    };
  }
};

const logReturnedReportForDebug = (report) => {
  console.log("First returned report snapshot:");
  console.log(
    JSON.stringify(
      {
        reportType: report?.constructor?.name,
        report: serializeForDebug(report),
      },
      null,
      2,
    ),
  );
};

const getRangeError = (score, [min, max]) => {
  const numericScore = Number(score);

  if (Number.isNaN(numericScore)) return 100;
  if (numericScore < min) return min - numericScore;
  if (numericScore > max) return numericScore - max;

  return 0;
};

const isInRange = (score, range) => getRangeError(score, range) === 0;

const getRiskText = (analysis) => {
  const riskIndicators = analysis.riskIndicators || [];

  return riskIndicators
    .map((risk) =>
      [
        risk.title,
        risk.severity,
        risk.explanation,
        risk.recommendation,
        ...(risk.evidence || []).map((item) => item.text),
      ]
        .filter(Boolean)
        .join(" "),
    )
    .join(" ")
    .toLowerCase();
};

const getRiskTitles = (analysis) =>
  (analysis.riskIndicators || []).map((risk) => risk.title).filter(Boolean);

const getRiskMatches = (analysis, expectedRiskIndicators) => {
  const riskTitles = getRiskTitles(analysis);

  if (!expectedRiskIndicators.length) {
    return {
      matched: riskTitles.length ? 0 : 1,
      total: 1,
      missing: riskTitles.length ? ["no risk indicators"] : [],
    };
  }

  const riskText = getRiskText(analysis);
  const normalizedRiskText = riskText.replace(/[^a-z0-9]+/g, " ");
  const actualRiskTerms = riskTitles.flatMap(getRiskTerms);
  const missing = expectedRiskIndicators.filter((indicator) => {
    const expectedTerms = getRiskTerms(indicator);

    return !expectedTerms.some(
      (term) =>
        actualRiskTerms.includes(term) || normalizedRiskText.includes(term),
    );
  });

  return {
    matched: expectedRiskIndicators.length - missing.length,
    total: expectedRiskIndicators.length,
    missing,
  };
};

const gradeCase = (testCase, report, processingTimeMs) => {
  const expectedErrors = validateExpected(testCase);
  const analysisErrors = validateAnalysis(report);

  if (expectedErrors.length || analysisErrors.length) {
    throw new Error(
      formatValidationError([...expectedErrors, ...analysisErrors]),
    );
  }

  const analysis = report.analysis;
  const expected = testCase.expected;
  const acceptableVerdicts = getAcceptableVerdicts(expected);
  const riskMatches = getRiskMatches(
    analysis,
    expected.expectedRiskIndicators,
  );

  const checks = [
    {
      name: "overallVerdict",
      passed: acceptableVerdicts.includes(analysis.overallVerdict?.label),
      expected: acceptableVerdicts,
      actual: analysis.overallVerdict?.label,
    },
    {
      name: "credibility",
      passed: isInRange(analysis.credibility?.score, expected.credibilityRange),
      expected: expected.credibilityRange,
      actual: analysis.credibility?.score,
      error: getRangeError(
        analysis.credibility?.score,
        expected.credibilityRange,
      ),
    },
    {
      name: "manipulation",
      passed: isInRange(
        analysis.emotionalManipulation?.score,
        expected.manipulationRange,
      ),
      expected: expected.manipulationRange,
      actual: analysis.emotionalManipulation?.score,
      error: getRangeError(
        analysis.emotionalManipulation?.score,
        expected.manipulationRange,
      ),
    },
    {
      name: "bias",
      passed: isInRange(analysis.bias?.score, expected.biasRange),
      expected: expected.biasRange,
      actual: analysis.bias?.score,
      error: getRangeError(analysis.bias?.score, expected.biasRange),
    },
    {
      name: "riskIndicators",
      passed: riskMatches.matched === riskMatches.total,
      expected: expected.expectedRiskIndicators,
      actual: (analysis.riskIndicators || []).map((risk) => risk.title),
      missing: riskMatches.missing,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;
  const status =
    passedChecks >= PASS_THRESHOLD
      ? "PASS"
      : passedChecks >= PARTIAL_THRESHOLD
        ? "PARTIAL PASS"
        : "FAIL";

  return {
    id: testCase.id,
    category: testCase.category,
    title: testCase.title,
    status,
    passedChecks,
    totalChecks: checks.length,
    processingTimeMs,
    checks,
    scores: {
      credibility: analysis.credibility?.score,
      manipulation: analysis.emotionalManipulation?.score,
      bias: analysis.bias?.score,
    },
    labels: {
      overallVerdict: analysis.overallVerdict?.label,
      credibility: analysis.credibility?.label,
      manipulation: analysis.emotionalManipulation?.label,
      bias: analysis.bias?.label,
    },
    promptVersion: report.metadata?.promptVersion,
  };
};

const getAverage = (values) => {
  if (!values.length) return 0;

  return values.reduce((total, value) => total + value, 0) / values.length;
};

const getMarkdownStatus = (status) => {
  if (status === "PASS") return "[PASS]";
  if (status === "PARTIAL PASS") return "[PARTIAL]";
  if (status === "SKIPPED") return "[SKIPPED]";

  return "[FAIL]";
};

const getAnalysisResults = (results) =>
  results.filter((result) => !result.error && result.status !== "SKIPPED");

const getCategoryStats = (results) => {
  const stats = new Map();

  getAnalysisResults(results).forEach((result) => {
    const current = stats.get(result.category) || {
      total: 0,
      pass: 0,
      partial: 0,
      fail: 0,
      credibility: [],
      manipulation: [],
      bias: [],
    };

    current.total += 1;
    if (result.status === "PASS") current.pass += 1;
    if (result.status === "PARTIAL PASS") current.partial += 1;
    if (result.status === "FAIL") current.fail += 1;

    current.credibility.push(result.scores.credibility);
    current.manipulation.push(result.scores.manipulation);
    current.bias.push(result.scores.bias);

    stats.set(result.category, current);
  });

  return [...stats.entries()].map(([category, stat]) => ({
    category,
    ...stat,
    averageCredibility: getAverage(stat.credibility),
    averageManipulation: getAverage(stat.manipulation),
    averageBias: getAverage(stat.bias),
  }));
};

const getFailureTypeCounts = (results) => {
  const counts = new Map();

  results
    .filter((result) => result.failureType)
    .forEach((result) => {
      counts.set(result.failureType, (counts.get(result.failureType) || 0) + 1);
    });

  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
};

const getMostCommonFailedChecks = (results) => {
  const counts = new Map();

  getAnalysisResults(results).forEach((result) => {
    result.checks
      .filter((check) => !check.passed)
      .forEach((check) => {
        counts.set(check.name, (counts.get(check.name) || 0) + 1);
      });
  });

  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
};

const getCommonRiskIndicators = (results) => {
  const counts = new Map();

  getAnalysisResults(results).forEach((result) => {
    const riskCheck = result.checks.find((check) => check.name === "riskIndicators");

    (riskCheck?.actual || []).forEach((title) => {
      counts.set(title, (counts.get(title) || 0) + 1);
    });
  });

  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
};

const getPromptWeaknesses = (results) => {
  const failedChecks = getMostCommonFailedChecks(results);

  return failedChecks.map(([checkName, count]) => {
    const suggestions = {
      overallVerdict:
        "Verdict calibration may need clearer category-specific guidance.",
      credibility:
        "Credibility scoring ranges may need sharper sourcing and format rules.",
      manipulation:
        "Manipulation scoring may need clearer clickbait, urgency, and satire handling.",
      bias: "Bias scoring may need clearer separation between viewpoint and factual reliability.",
      riskIndicators:
        "Risk indicator titles may need stronger controlled-vocabulary guidance.",
    };

    return {
      checkName,
      count,
      suggestion: suggestions[checkName] || "Review prompt guidance for this check.",
    };
  });
};

const buildMarkdownReport = (results, startedAt, finishedAt, options) => {
  const completedResults = getAnalysisResults(results);
  const skippedCount = results.filter((result) => result.status === "SKIPPED").length;
  const passedCount = completedResults.filter(
    (result) => result.status === "PASS",
  ).length;
  const partialCount = results.filter(
    (result) => result.status === "PARTIAL PASS",
  ).length;
  const failedCount = results.filter((result) => result.status === "FAIL").length;
  const categoryStats = getCategoryStats(results);
  const failureTypeCounts = getFailureTypeCounts(results);
  const commonFailedChecks = getMostCommonFailedChecks(results);
  const commonRiskIndicators = getCommonRiskIndicators(results);
  const promptWeaknesses = getPromptWeaknesses(results);

  const credibilityErrors = completedResults.map((result) => {
    const check = result.checks.find((item) => item.name === "credibility");
    return check.error || 0;
  });
  const manipulationErrors = completedResults.map((result) => {
    const check = result.checks.find((item) => item.name === "manipulation");
    return check.error || 0;
  });
  const biasErrors = completedResults.map((result) => {
    const check = result.checks.find((item) => item.name === "bias");
    return check.error || 0;
  });
  const processingTimes = completedResults.map(
    (result) => result.processingTimeMs,
  );

  const lines = [
    "# Evaluation Results",
    "",
    `Started: ${startedAt.toISOString()}`,
    `Finished: ${finishedAt.toISOString()}`,
    `Prompt Version: ${PROMPT_VERSION}`,
    `Max Retries: ${options.maxRetries}`,
    `Retry Base Delay: ${options.retryBaseMs} ms`,
    "",
    "## Summary",
    "",
    `- Overall Score: ${passedCount} / ${completedResults.length} Completed Analyses Passed`,
    `- Partial Passes: ${partialCount}`,
    `- Failures: ${failedCount}`,
    `- Skipped: ${skippedCount}`,
    `- Average Credibility Error: ${getAverage(credibilityErrors).toFixed(2)}`,
    `- Average Manipulation Error: ${getAverage(manipulationErrors).toFixed(2)}`,
    `- Average Bias Error: ${getAverage(biasErrors).toFixed(2)}`,
    `- Average Processing Time: ${getAverage(processingTimes).toFixed(0)} ms`,
    "",
    "## Failure Types",
    "",
    failureTypeCounts.length
      ? failureTypeCounts
          .map(([type, count]) => `- ${type}: ${count}`)
          .join("\n")
      : "- None",
    "",
    "## Category Accuracy",
    "",
    "| Category | Passed | Partial | Failed | Total |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...categoryStats.map(
      (stat) =>
        `| ${stat.category} | ${stat.pass} | ${stat.partial} | ${stat.fail} | ${stat.total} |`,
    ),
    "",
    "## Average Scores By Category",
    "",
    "| Category | Credibility | Manipulation | Bias |",
    "| --- | ---: | ---: | ---: |",
    ...categoryStats.map(
      (stat) =>
        `| ${stat.category} | ${stat.averageCredibility.toFixed(1)} | ${stat.averageManipulation.toFixed(1)} | ${stat.averageBias.toFixed(1)} |`,
    ),
    "",
    "## Most Common Failed Checks",
    "",
    commonFailedChecks.length
      ? commonFailedChecks
          .map(([checkName, count]) => `- ${checkName}: ${count}`)
          .join("\n")
      : "- None",
    "",
    "## Common Risk Indicators",
    "",
    commonRiskIndicators.length
      ? commonRiskIndicators
          .map(([title, count]) => `- ${title}: ${count}`)
          .join("\n")
      : "- None",
    "",
    "## Top Prompt Weaknesses",
    "",
    promptWeaknesses.length
      ? promptWeaknesses
          .map((weakness) => `- ${weakness.suggestion} (${weakness.count})`)
          .join("\n")
      : "- No recurring prompt weaknesses detected.",
    "",
    "## Case Results",
    "",
  ];

  results.forEach((result) => {
    if (result.error) {
      lines.push(
        `- ${getMarkdownStatus(result.status)} ${result.title} (${result.category}) - ${result.failureType}: ${result.error}`,
      );
      return;
    }

    lines.push(
      `- ${getMarkdownStatus(result.status)} ${result.title} (${result.category})`,
    );
  });

  lines.push("", "## Detailed Findings", "");

  results.forEach((result) => {
    lines.push(`### ${getMarkdownStatus(result.status)} ${result.title}`);
    lines.push("");
    lines.push(`- ID: ${result.id}`);
    lines.push(`- Category: ${result.category}`);

    if (result.error) {
      lines.push(`- Failure Type: ${result.failureType || "Evaluation Failure"}`);
      lines.push(`- Attempts: ${result.attempts || 1}`);
      lines.push(`- Error: ${result.error}`, "");
      return;
    }

    lines.push(`- Checks: ${result.passedChecks} / ${result.totalChecks}`);
    lines.push(`- Attempts: ${result.attempts || 1}`);
    lines.push(`- Processing Time: ${result.processingTimeMs} ms`);
    lines.push(
      `- Actual Scores: credibility ${result.scores.credibility}, manipulation ${result.scores.manipulation}, bias ${result.scores.bias}`,
    );
    lines.push(
      `- Actual Labels: verdict "${result.labels.overallVerdict}", credibility "${result.labels.credibility}", manipulation "${result.labels.manipulation}", bias "${result.labels.bias}"`,
    );
    lines.push("");
    lines.push("| Check | Result | Expected | Actual |");
    lines.push("| --- | --- | --- | --- |");

    result.checks.forEach((check) => {
      const expected = Array.isArray(check.expected)
        ? check.expected.join(", ")
        : check.expected;
      const actual = Array.isArray(check.actual)
        ? check.actual.join(", ")
        : check.actual;

      lines.push(
        `| ${check.name} | ${check.passed ? "PASS" : "FAIL"} | ${expected || "none"} | ${actual || "none"} |`,
      );
    });

    lines.push("");
  });

  return lines.join("\n");
};

const runEvaluation = async () => {
  const { default: connectDB } = await import("../config/db.js");
  const { analyzeContent } = await import("../services/analysis.service.js");

  const startedAt = new Date();
  const results = [];
  const limit = getLimit();
  const maxRetries = getPositiveIntegerOption(
    "maxRetries",
    "EVALUATION_MAX_RETRIES",
    DEFAULT_MAX_RETRIES,
  );
  const retryBaseMs = getPositiveIntegerOption(
    "retryBaseMs",
    "EVALUATION_RETRY_BASE_MS",
    DEFAULT_RETRY_BASE_MS,
  );
  const selectedTestCases = testCases.slice(0, limit);
  let hasLoggedComparisonFailureReport = false;

  await fs.mkdir(RESULTS_DIR, { recursive: true });
  await connectDB();

  console.log(
    `Running ${selectedTestCases.length} of ${testCases.length} evaluation cases.`,
  );

  for (const testCase of selectedTestCases) {
    const caseStart = Date.now();

    try {
      console.log(`Evaluating ${testCase.id}: ${testCase.title}`);

      const { report, attempts } = await analyzeWithRetry(
        analyzeContent,
        {
          sourceType: "text",
          originalInput: testCase.input,
          processedContent: testCase.input,
        },
        {
          maxRetries,
          retryBaseMs,
        },
      );
      const processingTimeMs = Date.now() - caseStart;

      try {
        const result = gradeCase(testCase, report, processingTimeMs);
        result.attempts = attempts;

        if (result.status !== "PASS" && !hasLoggedComparisonFailureReport) {
          logReturnedReportForDebug(report);
          hasLoggedComparisonFailureReport = true;
        }

        results.push(result);
      } catch (comparisonError) {
        if (!hasLoggedComparisonFailureReport) {
          logReturnedReportForDebug(report);
          hasLoggedComparisonFailureReport = true;
        }

        throw comparisonError;
      }
    } catch (error) {
      const failureType = error.failureType || classifyError(error);
      const status = failureType === "Quota Failure" ? "SKIPPED" : "FAIL";

      results.push({
        id: testCase.id,
        category: testCase.category,
        title: testCase.title,
        status,
        failureType,
        attempts: error.attempts || 1,
        error: error.message,
      });
    }
  }

  const finishedAt = new Date();
  const timestamp = finishedAt.toISOString().replace(/[:.]/g, "-");
  const markdownReport = buildMarkdownReport(results, startedAt, finishedAt, {
    maxRetries,
    retryBaseMs,
  });
  const jsonReport = {
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    totalCases: selectedTestCases.length,
    totalAvailableCases: testCases.length,
    limit,
    maxRetries,
    retryBaseMs,
    promptVersion: PROMPT_VERSION,
    results,
  };

  const markdownPath = path.join(RESULTS_DIR, `${timestamp}-evaluation.md`);
  const jsonPath = path.join(RESULTS_DIR, `${timestamp}-evaluation.json`);

  await fs.writeFile(markdownPath, markdownReport);
  await fs.writeFile(jsonPath, JSON.stringify(jsonReport, null, 2));

  await mongoose.disconnect();

  console.log("");
  console.log("Evaluation complete.");
  console.log(`Markdown report: ${markdownPath}`);
  console.log(`JSON report: ${jsonPath}`);
};

runEvaluation().catch(async (error) => {
  console.error("Evaluation failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
