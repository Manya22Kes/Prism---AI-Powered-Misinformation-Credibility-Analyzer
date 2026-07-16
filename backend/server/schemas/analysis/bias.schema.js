import mongoose from "mongoose";
import { BIAS_LABELS, SEVERITY_LEVELS } from "../../constants/enums.js";
import evidenceSchema from "../shared/evidence.schema.js";

const detectedBiasSchema = new mongoose.Schema(
  {
    type: {
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

    evidence: [evidenceSchema],
  },
  {
    _id: false,
  },
);

const biasSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    label: {
      type: String,
      required: true,
      enum: BIAS_LABELS,
    },

    detectedBiases: [detectedBiasSchema],

    explanation: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

export default biasSchema;
