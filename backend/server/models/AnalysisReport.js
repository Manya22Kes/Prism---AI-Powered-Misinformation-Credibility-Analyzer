import mongoose from "mongoose";

import {
  ANALYSIS_STATUS,
  OVERALL_VERDICT,
  SOURCE_TYPES,
} from "../constants/enums.js";
import credibilitySchema from "../schemas/analysis/credibility.schema.js";
import biasSchema from "../schemas/analysis/bias.schema.js";
import emotionalManipulationSchema from "../schemas/analysis/emotionalManipulation.schema.js";
import claimSchema from "../schemas/analysis/claim.schema.js";
import riskIndicatorSchema from "../schemas/analysis/riskIndicator.schema.js";
import metadataSchema from "../schemas/analysis/metadata.schema.js";
import errorSchema from "../schemas/analysis/error.schema.js";

const analysisReportSchema = new mongoose.Schema(
  {
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

      claims: [claimSchema],

      riskIndicators: [riskIndicatorSchema],

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
  },
);

const AnalysisReport = mongoose.model("AnalysisReport", analysisReportSchema);

export default AnalysisReport;
