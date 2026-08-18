import mongoose from "mongoose";
import {
  CLAIM_CATEGORIES,
  CLAIM_IMPORTANCE,
  CLAIM_INVESTIGATION_VERDICTS,
} from "../../constants/enums.js";

// Typed evidence item
const typedEvidenceItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Quote", "Case Study", "Statistic", "Expert Opinion", "Example", "Reference", "Acknowledgment"],
      default: "Example",
    },
    subject: { type: String, trim: true, default: "" },
    text: { type: String, required: true, trim: true },
    source: { type: String, trim: true, default: "" },
    interpretation: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

// Cross-finding relationship
const findingRelationshipSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["supports", "contradicts", "depends on"],
      required: true,
    },
    targetClaimId: { type: String, required: true },
    targetTheme: { type: String, default: "" },
  },
  { _id: false }
);

// Primary Analytical Finding / Claim Investigation schema
const analyticalFindingSchema = new mongoose.Schema(
  {
    claimId: { type: String, required: true },
    theme: { type: String, required: true, trim: true },
    topic: { type: String, trim: true, default: "" },
    claimText: { type: String, trim: true, default: "" }, // Declarative major claim
    question: { type: String, trim: true, default: "" },
    answer: { type: String, trim: true, default: "" },
    verdict: {
      type: String,
      enum: CLAIM_INVESTIGATION_VERDICTS,
      default: "Unverified",
    },
    verificationStatus: {
      type: String,
      enum: CLAIM_INVESTIGATION_VERDICTS,
      default: "Unverified",
    },
    confidenceScore: { type: Number, min: 0, max: 100, default: 70 },
    importance: {
      type: String,
      enum: CLAIM_IMPORTANCE,
      default: "Moderate",
    },
    category: {
      type: String,
      enum: CLAIM_CATEGORIES,
      default: "Other",
    },
    shortAssessment: { type: String, trim: true, default: "" },
    analystReasoning: { type: String, trim: true, default: "" },
    whyPrismThinksThis: {
      trustBullets: [{ type: String, trim: true }],
      cautionBullets: [{ type: String, trim: true }],
    },
    supportingEvidence: [typedEvidenceItemSchema],
    contradictingEvidence: [typedEvidenceItemSchema],
    evidenceFromArticle: [typedEvidenceItemSchema],
    evidenceAgainstClaim: [typedEvidenceItemSchema],
    dataGaps: [{ type: String, trim: true }],
    missingEvidence: [{ type: String, trim: true }],
    logicalFlaws: [{ type: String, trim: true }],
    scientificConsensus: {
      type: String,
      enum: ["Supported", "Contradicted", "Contested", "Inconclusive", "N/A"],
      default: "Inconclusive",
    },
    analyticalAssessment: { type: String, trim: true, default: "" },
    relationships: [findingRelationshipSchema],
  },
  { _id: false }
);

export default analyticalFindingSchema;
