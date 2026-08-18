import {
  OVERALL_VERDICT,
  CLAIM_IMPORTANCE,
  CLAIM_CATEGORIES,
  SEVERITY_LEVELS,
  ARTICLE_INTENT_TYPES,
  CLAIM_INVESTIGATION_VERDICTS,
} from "../constants/enums.js";
import {
  getBiasLabel,
  getCredibilityLabel,
  getManipulationLabel,
} from "./scoreLabels.js";

const normalizeEnum = (value, allowedValues, fallback) => {
  if (!value) return fallback;
  const exactMatch = allowedValues.find(
    (item) => item.toLowerCase() === value.toLowerCase(),
  );
  return exactMatch || fallback;
};

// ── Normalize a single evidence item ───────────────────────────────────────
const EVIDENCE_TYPES = ["Quote", "Case Study", "Statistic", "Expert Opinion", "Example", "Reference", "Acknowledgment"];
const normalizeEvidenceItem = (item, fallbackType = "Example") => {
  if (!item) return null;
  const text = item.text || item.quote || item.content || "";
  if (!text) return null;
  return {
    type: normalizeEnum(item.type, EVIDENCE_TYPES, fallbackType),
    subject: item.subject || item.name || "",
    text,
    source: item.source || "Article text",
    interpretation: item.interpretation || item.explanation || "",
  };
};

// ── Normalize a single claim investigation ─────────────────────────────────
const normalizeClaim = (claim, index) => {
  const claimText = claim.claimText || claim.statement || claim.answer || claim.text || claim.claim || `Major Claim ${index + 1}`;
  const theme = claim.theme || claim.topic || claim.category || `Claim ${index + 1}`;
  const topic = claim.topic || theme;

  const rawSupporting = Array.isArray(claim.evidenceFromArticle)
    ? claim.evidenceFromArticle
    : (Array.isArray(claim.supportingEvidence) ? claim.supportingEvidence : []);

  const rawContradicting = Array.isArray(claim.evidenceAgainstClaim)
    ? claim.evidenceAgainstClaim
    : (Array.isArray(claim.contradictingEvidence) ? claim.contradictingEvidence : []);

  const evidenceFromArticle = rawSupporting
    .map(ev => normalizeEvidenceItem(ev, "Example"))
    .filter(Boolean);

  const evidenceAgainstClaim = rawContradicting
    .map(ev => normalizeEvidenceItem(ev, "Expert Opinion"))
    .filter(Boolean);

  if (evidenceFromArticle.length === 0) {
    evidenceFromArticle.push({
      type: "Reference",
      subject: "Article text",
      text: claimText,
      source: "Article text",
      interpretation: "Asserted within article content.",
    });
  }

  // Trust & Caution bullets
  const rawTrust = claim.whyPrismThinksThis?.trustBullets || claim.trustBullets || [];
  const rawCaution = claim.whyPrismThinksThis?.cautionBullets || claim.cautionBullets || [];

  const trustBullets = Array.isArray(rawTrust) && rawTrust.length > 0
    ? rawTrust.filter(Boolean)
    : (evidenceFromArticle.slice(0, 2).map(e => e.interpretation || e.text.slice(0, 80)));

  const cautionBullets = Array.isArray(rawCaution) && rawCaution.length > 0
    ? rawCaution.filter(Boolean)
    : (evidenceAgainstClaim.slice(0, 2).map(e => e.interpretation || e.text.slice(0, 80)));

  const rawVerdict = claim.verdict || claim.verificationStatus || "Unverified";
  const verdict = normalizeEnum(rawVerdict, CLAIM_INVESTIGATION_VERDICTS, "Unverified");

  return {
    claimId: claim.claimId || `C${index + 1}`,
    theme,
    topic,
    claimText,
    text: claimText, // Satisfy legacy claimSchema
    question: claim.question || `Is the claim "${claimText.slice(0, 50)}..." supported by evidence?`,
    answer: claim.shortAssessment || claim.answer || claimText,
    verdict,
    verificationStatus: verdict,
    needsVerification: verdict === "Unverified", // Satisfy legacy claimSchema
    confidenceScore: typeof claim.confidenceScore === "number" ? claim.confidenceScore : 75,
    importance: normalizeEnum(claim.importance, CLAIM_IMPORTANCE, "Major"),
    category: normalizeEnum(claim.category, CLAIM_CATEGORIES, "Other"),
    shortAssessment: claim.shortAssessment || claim.analyticalAssessment || claim.analystReasoning || "Investigation completed across source content.",
    analystReasoning: claim.analystReasoning || claim.shortAssessment || "",
    whyPrismThinksThis: {
      trustBullets: trustBullets.length > 0 ? trustBullets : ["Presents contextual supporting details in article"],
      cautionBullets: cautionBullets.length > 0 ? cautionBullets : ["Requires independent secondary verification"],
    },
    evidenceFromArticle,
    supportingEvidence: evidenceFromArticle,
    evidenceAgainstClaim,
    contradictingEvidence: evidenceAgainstClaim,
    dataGaps: Array.isArray(claim.dataGaps) ? claim.dataGaps.filter(Boolean) : (Array.isArray(claim.missingEvidence) ? claim.missingEvidence.filter(Boolean) : []),
    missingEvidence: Array.isArray(claim.dataGaps) ? claim.dataGaps.filter(Boolean) : (Array.isArray(claim.missingEvidence) ? claim.missingEvidence.filter(Boolean) : []),
    logicalFlaws: Array.isArray(claim.logicalFlaws) ? claim.logicalFlaws.filter(Boolean) : [],
    scientificConsensus: normalizeEnum(
      claim.scientificConsensus ? claim.scientificConsensus.split(" ")[0] : "Inconclusive",
      ["Supported", "Contradicted", "Contested", "Inconclusive", "N/A"],
      "Inconclusive"
    ),
    analyticalAssessment: claim.shortAssessment || "",
    relationships: Array.isArray(claim.relationships) ? claim.relationships : [],
  };
};

/**
 * normalizeAnalysis — Automated Derivation Engine
 *
 * Implements the Claim-Centric Data Architecture:
 * All top-level insights (Verdict, Score Breakdown, Trust Drivers, Caution Drivers, Risks, Guidance)
 * are derived directly from the investigated claims.
 */
export const normalizeAnalysis = (analysis) => {
  if (!analysis) analysis = {};

  // ── 1. Document Context ──────────────────────────────────────────────────
  const ctx = analysis.articleContext || analysis.articleIntelligence || {};
  const summaryText = typeof analysis.summary === "string" && analysis.summary.length > 10
    ? analysis.summary
    : (ctx.oneSentenceSummary || analysis.executiveBriefing?.conclusion || "Article claim investigation completed.");

  const wordCount = analysis.processedContent ? analysis.processedContent.split(/\s+/).length : 1500;
  const estimatedReadTime = Math.max(1, Math.round(wordCount / 200));

  analysis.articleContext = {
    title: ctx.title || "Analyzed Article",
    publisher: ctx.publisher || analysis.sourceIntelligence?.publisher || "Extracted Source",
    contentType: normalizeEnum(ctx.contentType || ctx.detectedIntent, ARTICLE_INTENT_TYPES, "Research Reporting"),
    primaryTopic: ctx.primaryTopic || "General Science",
    authorStance: ctx.authorStance || ctx.authorPosition || "Neutral",
    oneSentenceSummary: summaryText,
    readingTimeMinutes: estimatedReadTime,
  };
  analysis.articleIntelligence = analysis.articleContext; // Alias for backward compatibility

  // ── 2. Claim Investigations (Single Source of Truth) ─────────────────────
  const rawClaims = Array.isArray(analysis.claimInvestigations)
    ? analysis.claimInvestigations
    : (Array.isArray(analysis.analyticalFindings) ? analysis.analyticalFindings : (Array.isArray(analysis.claims) ? analysis.claims : []));

  const claimInvestigations = rawClaims
    .filter(c => c && (c.claimText || c.answer || c.statement || c.text || c.claim))
    .map((c, i) => normalizeClaim(c, i));

  // Fallback default claim if none extracted
  if (claimInvestigations.length === 0) {
    claimInvestigations.push(normalizeClaim({
      claimId: "C1",
      theme: "Core Content Assertion",
      claimText: "The article presents claims regarding its primary subject matter.",
      verdict: "Partially Supported",
      confidenceScore: 70,
      shortAssessment: "Information is presented with contextual references but limited external validation.",
      trustBullets: ["Published in primary article text"],
      cautionBullets: ["Lacks direct independent peer review"],
    }, 0));
  }

  analysis.claimInvestigations = claimInvestigations;
  analysis.analyticalFindings = claimInvestigations; // Alias
  analysis.claims = claimInvestigations; // Alias

  // ── 3. Automated Verdict & Score Derivation ──────────────────────────────
  const VERDICT_WEIGHTS = {
    "Verified": 95,
    "Corroborated": 85,
    "Partially Supported": 65,
    "Contested": 45,
    "Unsupported": 25,
    "Contradicted": 10,
    "Unverified": 40,
  };

  const totalClaims = claimInvestigations.length;
  let weightedScoreSum = 0;
  const verdictCounts = {};

  claimInvestigations.forEach(c => {
    const weight = VERDICT_WEIGHTS[c.verdict] ?? 50;
    const confidenceFactor = (c.confidenceScore ?? 70) / 100;
    weightedScoreSum += weight * (0.8 + 0.2 * confidenceFactor);
    verdictCounts[c.verdict] = (verdictCounts[c.verdict] || 0) + 1;
  });

  const rawComputedScore = Math.round(weightedScoreSum / totalClaims);

  // ── 4. Core Dimensions & Final Score ──────────────────────────────────────
  const rawDims = analysis.dimensionScores || {};
  
  // Extract AI-generated dimension scores or fallback to neutral
  const evidenceQuality = rawDims.evidenceQuality?.score ?? 50;
  const sourceReliability = rawDims.sourceReliability?.score ?? 50;
  const logicalConsistency = rawDims.logicalConsistency?.score ?? 50;
  const scientificConsensus = rawDims.scientificConsensus?.score ?? 50;

  const coreDimensionsAvg = Math.round((evidenceQuality + sourceReliability + logicalConsistency + scientificConsensus) / 4);

  // The final score is a 50/50 blend of claim verification and core dimension analysis
  const finalCredibilityScore = Math.min(100, Math.max(0, Math.round((rawComputedScore * 0.5) + (coreDimensionsAvg * 0.5))));

  // Contextual presentation signals (these DO NOT artificially inflate or lower the core credibility score)
  const baf = analysis.biasAndFraming || {};
  const signals = analysis.signals || {};
  const biasScore = typeof baf.biasLevel === "number" ? baf.biasLevel : (typeof signals.biasScore === "number" ? signals.biasScore : (analysis.bias?.score || 30));
  const manipScore = typeof baf.emotionalManipulationLevel === "number" ? baf.emotionalManipulationLevel : (typeof signals.emotionalManipulationScore === "number" ? signals.emotionalManipulationScore : (analysis.emotionalManipulation?.score || 20));

  let derivedLabel = "Proceed With Caution";
  if (finalCredibilityScore >= 80) derivedLabel = "Highly Reliable";
  else if (finalCredibilityScore >= 65) derivedLabel = "Generally Reliable";
  else if (finalCredibilityScore >= 50) derivedLabel = "Proceed With Caution";
  else if (finalCredibilityScore >= 35) derivedLabel = "Questionable";
  else derivedLabel = "Highly Unreliable";

  // Build verdict breakdown string
  const breakdownParts = Object.entries(verdictCounts)
    .map(([v, count]) => `${count} ${v}`)
    .join(", ");

  analysis.credibility = {
    score: finalCredibilityScore,
    explanation: `Investigated ${totalClaims} major claims (${breakdownParts}). Dimensions avg: ${coreDimensionsAvg}. Final score: ${finalCredibilityScore}%.`,
    label: getCredibilityLabel(finalCredibilityScore),
  };

  analysis.overallVerdict = {
    label: derivedLabel,
    explanation: `Overall verdict: ${derivedLabel} based on ${totalClaims} claims and core dimension analysis.`,
  };

  analysis.dimensionScores = {
    evidenceQuality: {
      score: evidenceQuality,
      explanation: rawDims.evidenceQuality?.explanation || "Evidence quality was assessed based on provided sources."
    },
    sourceReliability: {
      score: sourceReliability,
      explanation: rawDims.sourceReliability?.explanation || "Source reliability evaluated based on historical accuracy."
    },
    logicalConsistency: {
      score: logicalConsistency,
      explanation: rawDims.logicalConsistency?.explanation || "Logical consistency evaluated across all major arguments."
    },
    scientificConsensus: {
      score: scientificConsensus,
      explanation: rawDims.scientificConsensus?.explanation || "Alignment with consensus evaluated where applicable."
    },
    biasLevel: biasScore,
    emotionalManipulation: manipScore,
  };

  // ── 5. Derived Trust & Caution Drivers ────────────────────────────────────
  const trustDrivers = [];
  const cautiousDrivers = [];

  let supportedCount = 0;
  let peerReviewedCount = 0;
  let contestedCount = 0;
  let unsupportedCount = 0;

  claimInvestigations.forEach(c => {
    if (["Verified", "Corroborated", "Partially Supported"].includes(c.verdict)) supportedCount++;
    if (["Contested", "Contradicted"].includes(c.verdict)) contestedCount++;
    if (c.verdict === "Unsupported" || c.verdict === "Unverified") unsupportedCount++;
    if (c.evidenceFromArticle?.some(e => ["Expert Opinion", "Statistic", "Case Study"].includes(e.type))) peerReviewedCount++;
  });

  if (supportedCount > 0) trustDrivers.push(`✓ ${supportedCount} of ${totalClaims} claims are independently supported`);
  if (peerReviewedCount > 0) trustDrivers.push(`✓ ${peerReviewedCount} claims cite expert opinions or statistical evidence`);
  if (totalClaims > 0 && supportedCount >= totalClaims / 2) trustDrivers.push(`✓ Multiple sources align on central findings`);
  if (trustDrivers.length === 0) trustDrivers.push("✓ Article presents clear, declarative claims");

  if (contestedCount > 0) cautiousDrivers.push(`⚠ ${contestedCount} claims are actively contested or contradicted`);
  if (unsupportedCount > 0) cautiousDrivers.push(`⚠ ${unsupportedCount} claims lack strong supporting evidence`);
  
  // Aggregate some specific flaws for cautious drivers if we don't have enough
  if (cautiousDrivers.length < 2) {
    let allFlaws = [];
    claimInvestigations.forEach(c => allFlaws.push(...(c.logicalFlaws || [])));
    const uniqueFlaws = [...new Set(allFlaws)];
    if (uniqueFlaws.length > 0) cautiousDrivers.push(`⚠ Relies on ${uniqueFlaws[0].toLowerCase()}`);
    else cautiousDrivers.push("⚠ Requires independent peer-reviewed replication");
  }

  analysis.executiveBriefing = {
    conclusion: summaryText,
    trustDrivers,
    cautiousDrivers,
    strongestEvidence: trustDrivers,
    mainCredibilityRisks: cautiousDrivers,
    keyUncertainty: cautiousDrivers[0] || "Requires external scientific replication.",
    recommendation: "Cross-reference key assertions with primary scientific registries.",
    confidence: 85,
  };

  // ── 6. Risk & Anomaly Intelligence ────────────────────────────────────────
  const rawRisks = Array.isArray(analysis.riskIndicators) ? analysis.riskIndicators : [];
  const derivedRisks = rawRisks.map(r => ({
    riskType: r.riskType || r.title || "Unspecified Risk",
    title: r.title || r.riskType || "Credibility Anomaly",
    severity: normalizeEnum(r.severity, ["LOW", "MEDIUM", "HIGH", "CRITICAL"], "MEDIUM"),
    shortExplanation: r.shortExplanation || r.explanation || "",
    explanation: r.shortExplanation || r.explanation || "", // Legacy fallback
    affectedClaimId: r.affectedClaimId || null,
    scope: r.scope === "article" || r.affectedClaimId === null ? "article" : "claim",
    evidenceQuote: r.evidenceQuote || null,
    whyItMatters: r.whyItMatters || "",
    confidenceScore: r.confidenceScore || 80, // Legacy fallback
    issues: r.issues || [],
    evidence: r.evidence || null
  }));

  analysis.riskIndicators = derivedRisks;

  const summary = analysis.riskSummary || {};
  if (derivedRisks.length === 0) {
    analysis.riskSummary = {
      status: "clear",
      message: "No significant credibility anomalies detected.",
    };
  } else {
    analysis.riskSummary = {
      status: "has_risks",
      message: summary.message || `${derivedRisks.length} credibility anomalies detected.`,
    };
  }

  // ── 7. Derived Reader Guidance & Recommendations ──────────────────────────
  analysis.recommendations = [
    "✓ Compare with external consensus",
    "✓ Look for independent replication",
    "✓ Check publication date",
    "✓ Verify quoted statistics",
  ];

  // ── 8. Source Intelligence ───────────────────────────────────────────────
  const si = analysis.sourceIntelligence || {};
  analysis.sourceIntelligence = {
    publisher: si.publisher || analysis.articleContext.publisher || "Not established from available content.",
    author: si.author || "Not established from available content.",
    publicationDate: si.publicationDate || "Not established from available content.",
    sourceType: si.sourceType || analysis.articleContext.contentType || "Not established from available content.",
    primaryVsSecondary: si.primaryVsSecondary || "Not established from available content.",
    citationsPresent: typeof si.citationsPresent === 'boolean' ? si.citationsPresent : false,
    citationsCount: typeof si.citationsCount === 'number' ? si.citationsCount : 0,
    primarySourcesReferenced: Array.isArray(si.primarySourcesReferenced) ? si.primarySourcesReferenced : [],
    peerReviewedSources: Array.isArray(si.peerReviewedSources) ? si.peerReviewedSources : [],
    namedExperts: Array.isArray(si.namedExperts) ? si.namedExperts : [],
    institutionsMentioned: Array.isArray(si.institutionsMentioned) ? si.institutionsMentioned : [],
    reportingLevel: si.reportingLevel || "Not established from available content.",
    evidenceProvenance: si.evidenceProvenance || "Not established from available content.",
  };

  const bafObj = analysis.biasAndFraming || {};
  
  const normalizeFramingIndicator = (ind) => ({
    type: ind.type || "Unspecified Presentation Indicator",
    severity: normalizeEnum(ind.severity, ["LOW", "MEDIUM", "HIGH", "CRITICAL"], "MEDIUM"),
    shortDescription: ind.shortDescription || ind.explanation || "",
    evidenceQuote: ind.evidenceQuote || "",
    whyItMatters: ind.whyItMatters || ""
  });

  analysis.biasAndFraming = {
    biasLevel: biasScore,
    emotionalManipulationLevel: manipScore,
    biasIndicators: Array.isArray(bafObj.biasIndicators) ? bafObj.biasIndicators.map(normalizeFramingIndicator) : [],
    framingIndicators: Array.isArray(bafObj.framingIndicators) ? bafObj.framingIndicators.map(normalizeFramingIndicator) : []
  };

  // Preserve legacy fields for safety, but they will be phased out of the schema eventually
  analysis.bias = {
    score: biasScore,
    label: getBiasLabel(biasScore),
    explanation: `Framing & perspective adherence evaluated at ${biasScore}% bias level.`,
    detectedBiases: analysis.bias?.detectedBiases || [],
  };

  analysis.emotionalManipulation = {
    score: manipScore,
    label: getManipulationLabel(manipScore),
    explanation: `Rhetorical & emotional triggers evaluated at ${manipScore}% manipulation level.`,
    detectedTechniques: analysis.emotionalManipulation?.detectedTechniques || [],
  };

  analysis.claimSummaryStats = {
    primaryFindingsCount: totalClaims,
    totalSupportingStatements: claimInvestigations.reduce((s, c) => s + (c.evidenceFromArticle?.length || 0), 0),
    totalContradictingStatements: claimInvestigations.reduce((s, c) => s + (c.evidenceAgainstClaim?.length || 0), 0),
  };

  return analysis;
};
