export const RISK_SYNONYMS = {
  "Missing Attribution": [
    "anonymous",
    "general attribution",
    "lack of attribution",
    "lack of source",
    "missing source",
    "no documents",
    "no link",
    "primary source attribution",
    "source attribution",
    "unnamed",
    "vague source",
    "vague sourcing",
  ],
  "Unsupported Claim": [
    "limited evidence",
    "low evidence",
    "no evidence",
    "unsupported",
    "unverified",
  ],
  "Opinion Framing": ["bias", "commentary", "editorial", "opinion"],
  "Political Framing": ["political", "partisan", "advocacy"],
  "Commercial Bias": ["advertisement", "commercial", "marketing", "promotional"],
  "Exaggerated Claim": ["exaggerated", "guarantees", "miracle", "sensational"],
  Clickbait: ["clickbait", "curiosity gap", "sensational headline"],
  Urgency: ["act", "before it disappears", "urgent", "urgency"],
  "Fear Appeal": ["fear", "panic", "threat"],
  Scarcity: ["limited time", "scarcity"],
  Conspiracy: ["conspiracy", "conspiratorial", "cover-up", "hiding"],
  "Medical Risk": ["cure", "diabetes", "medical", "medication"],
  "Financial Risk": ["deposit", "financial", "investment", "zero risk"],
  "Investment Risk": ["crypto", "cryptocurrency", "investment", "wallet"],
  "Impersonation Risk": ["verified-looking", "impersonation"],
  Satire: ["humor", "humorous", "implausible", "satire", "satirical"],
  "Misleading Context": ["misleading", "missing context"],
  Overgeneralization: ["overgeneralization", "sweeping"],
  "Single-Event Reasoning": ["single event", "one city"],
  "Vague Sourcing": ["heard", "insiders", "vague"],
  "Anonymous Sourcing": ["anonymous", "unnamed"],
  "Viral Claim": ["repost", "share", "viral"],
  "Call to Share": ["repost", "share"],
  "Call to Purchase": ["buy", "order", "purchase"],
  "Fabricated Specificity": ["fabricated", "secret"],
  "Low Evidence": ["generic", "limited", "limited evidence", "low evidence"],
  "Mixed Fact and Opinion": ["mixed", "opinion"],
};

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const getRiskTerms = (indicator) => {
  const normalizedIndicator = normalize(indicator);
  const canonicalMatch = Object.entries(RISK_SYNONYMS).find(
    ([title, synonyms]) =>
      normalize(title) === normalizedIndicator ||
      normalizedIndicator.includes(normalize(title)) ||
      synonyms.some((synonym) => {
        const normalizedSynonym = normalize(synonym);

        return (
          normalizedSynonym === normalizedIndicator ||
          normalizedIndicator.includes(normalizedSynonym)
        );
      }),
  );

  if (!canonicalMatch) return [normalizedIndicator];

  const [title, synonyms] = canonicalMatch;

  return [title, ...synonyms].map(normalize);
};
