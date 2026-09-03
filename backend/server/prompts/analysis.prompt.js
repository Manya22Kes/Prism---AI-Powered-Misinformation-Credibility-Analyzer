import responseTemplate from "./responseTemplate.js";
import {
  CLAIM_CATEGORIES,
  CLAIM_IMPORTANCE,
  ARTICLE_INTENT_TYPES,
  CLAIM_INVESTIGATION_VERDICTS,
} from "../constants/enums.js";

export const PROMPT_VERSION = "4.0";

const buildAnalysisPrompt = (content) => {
  const text = typeof content === "string" ? content : "";
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  // Multipage indicators from PDF/Docx processors: e.g., "[Page 2]", "[Page 3]", "===== DOCUMENT X ====="
  const isMultipage = /\[Page\s+[2-9]\d*\]/i.test(text) || /===== DOCUMENT \d+ =====/i.test(text);
  
  // Longer article indicator: articles with >= 1000 words are considered long/in-depth
  const isLongArticle = wordCount >= 1000;
  
  const isComprehensive = isMultipage || isLongArticle;
  const claimRange = isComprehensive ? "6–12" : "4–8";
  
  const documentScopeNote = isComprehensive
    ? `NOTE ON SCOPE: This is a comprehensive, longer, or multi-page document (${wordCount} words${isMultipage ? ', multi-page' : ''}). Extract and conduct an in-depth investigation into 6–12 major claims to ensure thorough analytical coverage across all core sections and pages.`
    : `NOTE ON SCOPE: This is a concise or standard document (${wordCount} words). Focus on extracting and investigating the 4–8 most critical claims.`;

  return `
You are Prism, an AI Investigator. Your task is to extract and conduct a deep investigation into the ${claimRange} major claims made by the document below.

${documentScopeNote}

DO NOT write an overall essay summary.
DO NOT write a main thesis paragraph.
DO NOT write duplicate risk sections.
DO NOT invent questions. Write clear, natural, declarative major claims.

Focus entirely on investigating the ${claimRange} major claims.
Every higher-level insight (verdict, score, trust reasons, caution reasons, risks) will be derived automatically from your claim investigations.

═══════════════════════════════════════════════════════
STAGE 1: DOCUMENT CONTEXT
═══════════════════════════════════════════════════════
1. What is the document's purpose/contentType?
   Choose one: ${ARTICLE_INTENT_TYPES.join(" | ")}
2. What is the author's stance on the topic? (Supportive | Neutral | Critical)
3. What is the primary topic?
4. Write ONE single sentence summarizing what the article is about.

═══════════════════════════════════════════════════════
STAGE 2: EXTRACT ${claimRange} MAJOR CLAIMS
═══════════════════════════════════════════════════════
- Identify the ${claimRange} most important arguments made by the document.
- Write each as a declarative claim statement (e.g. "Child memory reports contain verifiable details matching historical records.").
- Assign a theme name, category, and importance.

═══════════════════════════════════════════════════════
STAGE 3: INVESTIGATE EACH CLAIM
═══════════════════════════════════════════════════════
For each claim, investigate thoroughly:
1. verdict: Choose one from [${CLAIM_INVESTIGATION_VERDICTS.join(" | ")}]
2. confidenceScore: Rate 0–100 based on strength of evidence in the document.
3. shortAssessment: Write a single 1-sentence analytical takeaway for this claim. STRICT RULE: NEVER paraphrase or restate the claim itself. Only explain the underlying logic, conditions, or reasons WHY Prism reached this verdict.
4. whyPrismThinksThis:
   - trustBullets: 2–3 concise points explaining why this claim has credibility (e.g. "✓ Conducted within an academic institution", "✓ Uses named medical sources").
   - cautionBullets: 2–3 concise points explaining why readers should be cautious (e.g. "⚠ Difficult for independent researchers to replicate", "⚠ Reliance on retrospective memory").
5. evidenceFromArticle: Collect verbatim quotes, case studies, statistics from text supporting this claim.
6. evidenceAgainstClaim: Collect verbatim quotes, scientific caveats, counterarguments challenging this claim.
7. dataGaps: List missing proofs or unverified assertions for this claim.
8. logicalFlaws: List detected flaws (e.g. "Anecdotal Generalization", "Confirmation Bias").
9. scientificConsensus: Supported | Contradicted | Contested | Inconclusive | N/A

═══════════════════════════════════════════════════════
STAGE 4: CREDIBILITY DIMENSIONS & SOURCE INTELLIGENCE
═══════════════════════════════════════════════════════
Evaluate the document on 4 core credibility dimensions (score 0-100) and provide a 1-sentence explanation for each.
CRITICAL SCORING RUBRIC (YOU MUST FOLLOW THIS):
- 90–100: Overwhelming/high-quality evidence; bulletproof logic; broad consensus.
- 70–89: Strong supporting evidence / generally accepted consensus.
- 50–69: Mixed, uncertain, or insufficient evidence / contested.
- 30–49: Significant contradiction, weak support, or major logical flaws.
- 10–29: Strong evidence against the claim / highly unreliable.
- 0–9: Claim directly contradicts overwhelming scientific evidence / established reality (e.g. flat earth).

1. evidenceQuality (0-100 & explanation): Is the evidence empirical, verifiable, or anecdotal?
2. sourceReliability (0-100 & explanation): Is the publisher/author authoritative and historically accurate?
3. logicalConsistency (0-100 & explanation): Are there contradictions, fallacies, or unsupported leaps?
4. scientificConsensus (0-100 & explanation): Does it align with established expert consensus? (If not applicable, rate based on factual alignment)


SOURCE INTELLIGENCE EXTRACTION:
Extract structured intelligence about the source.
CRITICAL RULE: NEVER invent source information. Do not infer peer-review status, primary-source status, author credentials, or source reliability merely from the presence of a name, institution, URL, or citation. Only mark these attributes when the analyzed content provides sufficient evidence; otherwise use the exact string "Not established from available content."

Provide values for:
- publisher, author, publicationDate, sourceType, primaryVsSecondary, reportingLevel, evidenceProvenance.
- citationsPresent (boolean) and citationsCount (number). If 0, use "not found", not "not established".
- primarySourcesReferenced, peerReviewedSources, namedExperts, institutionsMentioned (arrays of strings).

═══════════════════════════════════════════════════════
STAGE 5: RISK & ANOMALY INTELLIGENCE
═══════════════════════════════════════════════════════
Detect and extract specific, structured credibility risks from the document.
CRITICAL RULES:
- A risk is NOT automatically evidence that the article is false. For example, "Anecdotal Evidence" means the evidence type is insufficient to establish a broader conclusion; it does not mean the underlying claim is necessarily false. "Emotional Language" describes presentation, not factual inaccuracy.
- DO NOT invent or force risks just to populate this section.
- If no meaningful risks are detected, leave the riskIndicators array empty.
- Every risk must be traceable to either a specific claim or a clearly identified article-level issue.
- If a risk affects a specific claim, set "scope" to "claim" and "affectedClaimId" to that claim's ID. If it applies to the whole article, set "scope" to "article" and "affectedClaimId" to null.
- "evidenceQuote" must be text actually present in the analyzed content. Never generate a plausible-sounding quotation. If the triggering passage cannot be confidently identified, leave it null.
- "severity" must be LOW, MEDIUM, HIGH, or CRITICAL. Do not assign HIGH simply because something sounds suspicious. Use HIGH/CRITICAL only for major unsupported inferences, serious evidence gaps, or fundamental failures that substantially undermine the central claim.

═══════════════════════════════════════════════════════
STAGE 6: BIAS & FRAMING INTELLIGENCE
═══════════════════════════════════════════════════════
Analyze the document's presentation for bias and framing techniques.
CRITICAL RULES:
1. SEMANTIC INDEPENDENCE: Bias and emotional manipulation describe HOW information is presented, not IF it is true. A biased/emotional article can be factually correct, and a calm/neutral article can be entirely false.
2. VERBATIM EVIDENCE: The 'evidenceQuote' must be copied exactly from the analyzed content. The system MUST NOT fabricate or paraphrase text. If no exact supporting passage can be identified, leave 'evidenceQuote' empty.
3. NO HALLUCINATION: If no meaningful bias or framing techniques are detected, return empty arrays for 'biasIndicators' and 'framingIndicators'. Do not invent indicators just to populate the section.

Assess the overall numerical levels (0-100):
- biasLevel: 0 = neutral presentation, 100 = highly ideologically/selectively biased presentation.
- emotionalManipulationLevel: 0 = calm/professional, 100 = highly manipulative/emotional.

Distinguish between two types of indicators:
- biasIndicators: Focuses on selective, ideological, or omissive presentation (e.g. Selective Evidence, Confirmation Framing, Omission, Ideological Framing).
- framingIndicators: Focuses on rhetorical/psychological influence (e.g. Outrage Framing, Fear Appeal, Loaded Language, Absolute Language, False Urgency, Authority Framing).

═══════════════════════════════════════════════════════
FORMATTING RULES
═══════════════════════════════════════════════════════
- Return ONLY valid JSON matching the template below.
- No markdown wrappers around the JSON output.
- Evidence quotes MUST be verbatim text from the document.

═══════════════════════════════════════════════════════
DOCUMENT TO INVESTIGATE
═══════════════════════════════════════════════════════

${content}

═══════════════════════════════════════════════════════
JSON OUTPUT TEMPLATE
═══════════════════════════════════════════════════════

${JSON.stringify(responseTemplate, null, 2)}
`;
};

export default buildAnalysisPrompt;
