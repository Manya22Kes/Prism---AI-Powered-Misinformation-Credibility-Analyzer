import mongoose from "mongoose";
import { ANALYSIS_STATUS, SOURCE_TYPES } from "../constants/enums.js";
import metadataSchema from "../schemas/analysis/metadata.schema.js";
import errorSchema from "../schemas/analysis/error.schema.js";

const batchAnalysisReportSchema = new mongoose.Schema(
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
      enum: [...ANALYSIS_STATUS, "partial_success"],
      default: "processing",
      index: true,
    },

    sourceType: {
      type: String,
      default: "batch",
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

    failedFiles: [
      {
        filename: String,
        reason: String
      }
    ],

    reports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AnalysisReport",
      }
    ],

    analysis: {
      overallCredibility: {
        type: String,
        enum: ["High", "Medium", "Low", "Mixed", "Not Applicable"],
        required: true,
      },
      
      sourceComparisons: {
        consistencyScore: { type: Number, min: 0, max: 100 },
        summary: String,
      },

      corroboratedClaims: [
        {
          claim: String,
          foundIn: [String],
        }
      ],

      contradictoryClaims: [
        {
          claim: String,
          conflict: String,
        }
      ],

      recurringThemes: [String],

      overallSummary: String,
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

batchAnalysisReportSchema.index({ createdAt: -1 });

const BatchAnalysisReport = mongoose.model("BatchAnalysisReport", batchAnalysisReportSchema);

export default BatchAnalysisReport;
