import mongoose from "mongoose";
import { SEVERITY_LEVELS } from "../../constants/enums.js";
import evidenceSchema from "../shared/evidence.schema.js";

const riskIndicatorSchema = new mongoose.Schema(
  {
    riskType: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      required: true,
      enum: SEVERITY_LEVELS,
    },
    shortExplanation: {
      type: String,
      trim: true,
    },
    explanation: {
      type: String,
      trim: true,
      default: "",
    },
    affectedClaimId: {
      type: String,
      default: null,
    },
    scope: {
      type: String,
      enum: ["claim", "article"],
      default: "article",
    },
    evidenceQuote: {
      type: String,
      trim: true,
    },
    whyItMatters: {
      type: String,
      trim: true,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 70,
    },
    issues: [{
      type: String,
      trim: true,
    }],
    recommendation: {
      type: String,
      trim: true,
      default: "",
    },
    evidence: mongoose.Schema.Types.Mixed,
  },
  {
    _id: false,
  }
);

export default riskIndicatorSchema;
