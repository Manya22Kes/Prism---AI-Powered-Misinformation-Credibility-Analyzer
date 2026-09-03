import mongoose from "mongoose";
import {
  ANALYSIS_STATUS,
  OVERALL_VERDICT,
  SOURCE_TYPES,
  ARTICLE_INTENT_TYPES,
} from "../constants/enums.js";
import credibilitySchema from "../schemas/analysis/credibility.schema.js";
import biasSchema from "../schemas/analysis/bias.schema.js";
import emotionalManipulationSchema from "../schemas/analysis/emotionalManipulation.schema.js";
import claimSchema from "../schemas/analysis/claim.schema.js";
import analyticalFindingSchema from "../schemas/analysis/analyticalFinding.schema.js";
import riskIndicatorSchema from "../schemas/analysis/riskIndicator.schema.js";
import framingIndicatorSchema from "../schemas/analysis/framingIndicator.schema.js";
import metadataSchema from "../schemas/analysis/metadata.schema.js";
import errorSchema from "../schemas/analysis/error.schema.js";

const analysisReportSchema = new mongoose.Schema(
  {
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    isSaved: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    status: {
      type: String,
      enum: ANALYSIS_STATUS,
      default: "processing",
      index: true,
    },

    sourceType: {
      type: String,
      required: true,
      enum: SOURCE_TYPES,
      index: true,
    },

    originalInput: {
      type: String,
      required: true,
      trim: true,
    },

    processedContent: {
      type: String,
      required: true,
      trim: true,
    },

    analysisHash: {
      type: String,
      required: true,
      index: true,
    },

    analysis: {
      overallVerdict: {
        label: {
          type: String,
          enum: OVERALL_VERDICT,
        },
        explanation: {
          type: String,
          trim: true,
        },
      },

      credibility: credibilitySchema,
      bias: biasSchema,
      emotionalManipulation: emotionalManipulationSchema,

      // ── v4.0: Claim-Centric Data Architecture ──────────────────────────────
      articleContext: {
        title: { type: String, trim: true, default: "" },
        publisher: { type: String, trim: true, default: "" },
        contentType: { type: String, enum: ARTICLE_INTENT_TYPES, default: "Research Reporting" },
        primaryTopic: { type: String, trim: true, default: "" },
        authorStance: { type: String, trim: true, default: "Neutral" },
        oneSentenceSummary: { type: String, trim: true, default: "" },
        readingTimeMinutes: { type: Number, default: 5 },
      },

      claimInvestigations: [analyticalFindingSchema],
      analyticalFindings: [analyticalFindingSchema],
      claims: [claimSchema],

      articleIntelligence: mongoose.Schema.Types.Mixed,
      argumentStructure: mongoose.Schema.Types.Mixed,
      claimSummaryStats: mongoose.Schema.Types.Mixed,
      executiveBriefing: mongoose.Schema.Types.Mixed,
      sourceIntelligence: mongoose.Schema.Types.Mixed,

      riskIndicators: [riskIndicatorSchema],
      riskSummary: {
        status: { type: String, enum: ["clear", "has_risks"], default: "clear" },
        message: { type: String, trim: true, default: "" },
      },

      dimensionScores: {
        evidenceQuality: {
          score: { type: Number, min: 0, max: 100 },
          explanation: { type: String, trim: true }
        },
        sourceReliability: {
          score: { type: Number, min: 0, max: 100 },
          explanation: { type: String, trim: true }
        },
        logicalConsistency: {
          score: { type: Number, min: 0, max: 100 },
          explanation: { type: String, trim: true }
        },
        scientificConsensus: {
          score: { type: Number, min: 0, max: 100 },
          explanation: { type: String, trim: true }
        }
      },

      biasAndFraming: {
        biasLevel: { type: Number, min: 0, max: 100, default: 0 },
        emotionalManipulationLevel: { type: Number, min: 0, max: 100, default: 0 },
        biasIndicators: [framingIndicatorSchema],
        framingIndicators: [framingIndicatorSchema]
      },

      summary: {
        type: String,
        trim: true,
      },

      recommendations: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    metadata: metadataSchema,

    error: {
      type: errorSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
analysisReportSchema.index({ createdAt: -1 });
analysisReportSchema.index({ isSaved: 1, createdAt: -1 });
analysisReportSchema.index({ batchId: 1 });

const AnalysisReport = mongoose.model("AnalysisReport", analysisReportSchema);

export default AnalysisReport;
