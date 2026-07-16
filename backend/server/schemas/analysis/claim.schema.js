import mongoose from "mongoose";
import {
  CLAIM_CATEGORIES,
  CLAIM_IMPORTANCE,
} from "../../constants/enums.js";
import evidenceSchema from "../shared/evidence.schema.js";

const claimSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    needsVerification: {
      type: Boolean,
      required: true,
      default: true,
    },

    importance: {
      type: String,
      required: true,
      enum: CLAIM_IMPORTANCE,
    },

    category: {
      type: String,
      required: true,
      enum: CLAIM_CATEGORIES,
    },

    evidence: [evidenceSchema],
  },
  {
    _id: false,
  },
);

export default claimSchema;
