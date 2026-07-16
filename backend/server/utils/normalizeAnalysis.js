import {
  OVERALL_VERDICT,
  CLAIM_IMPORTANCE,
  CLAIM_CATEGORIES,
  SEVERITY_LEVELS,
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

export const normalizeAnalysis = (analysis) => {
  analysis.overallVerdict.label = normalizeEnum(
    analysis.overallVerdict.label,
    OVERALL_VERDICT,
    "Proceed With Caution",
  );

  analysis.credibility.label = getCredibilityLabel(analysis.credibility.score);

  analysis.claims?.forEach((claim) => {
    claim.importance = normalizeEnum(
      claim.importance,
      CLAIM_IMPORTANCE,
      "Moderate",
    );

    claim.category = normalizeEnum(claim.category, CLAIM_CATEGORIES, "Other");
  });

  analysis.bias.detectedBiases?.forEach((bias) => {
    bias.severity = normalizeEnum(bias.severity, SEVERITY_LEVELS, "Low");
  });

  analysis.emotionalManipulation.detectedTechniques?.forEach((technique) => {
    technique.severity = normalizeEnum(
      technique.severity,
      SEVERITY_LEVELS,
      "Low",
    );
  });

  analysis.riskIndicators?.forEach((risk) => {
    risk.severity = normalizeEnum(risk.severity, SEVERITY_LEVELS, "Low");
  });

  analysis.emotionalManipulation.label = getManipulationLabel(
    analysis.emotionalManipulation.score,
  );

  analysis.bias.label = getBiasLabel(analysis.bias.score);

  return analysis;
};
