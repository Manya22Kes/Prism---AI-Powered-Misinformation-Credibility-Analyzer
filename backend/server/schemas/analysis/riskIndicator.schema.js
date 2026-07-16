import mongoose from "mongoose";
import { SEVERITY_LEVELS } from "../../constants/enums.js";
import evidenceSchema from "../shared/evidence.schema.js";

const riskIndicatorSchema = new mongoose.Schema(
  {
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

    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    explanation: {
      type: String,
      required: true,
      trim: true,
    },

    recommendation: {
      type: String,
      required: true,
      trim: true,
    },

    evidence: [evidenceSchema],
  },
  {
    _id: false,
  },
);

export default riskIndicatorSchema;
