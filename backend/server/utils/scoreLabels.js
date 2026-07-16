import {
  BIAS_SCORE_RANGES,
  CREDIBILITY_SCORE_RANGES,
  MANIPULATION_SCORE_RANGES,
} from "./scoreRanges.js";

const normalizeScore = (score) => {
  const numericScore = Number(score);

  if (Number.isNaN(numericScore)) return 0;

  return Math.min(Math.max(numericScore, 0), 100);
};

const getScoreRangeLabel = (score, ranges) => {
  const normalizedScore = normalizeScore(score);

  return ranges.find(
    (range) => normalizedScore >= range.min && normalizedScore <= range.max,
  ).label;
};

export const getCredibilityLabel = (score) =>
  getScoreRangeLabel(score, CREDIBILITY_SCORE_RANGES);

export const getBiasLabel = (score) =>
  getScoreRangeLabel(score, BIAS_SCORE_RANGES);

export const getManipulationLabel = (score) =>
  getScoreRangeLabel(score, MANIPULATION_SCORE_RANGES);
