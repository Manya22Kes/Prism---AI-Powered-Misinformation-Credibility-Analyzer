import mongoose from "mongoose";
import { CREDIBILITY_LABELS } from "../../constants/enums.js";

const credibilitySchema = new mongoose.Schema(
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
      enum: CREDIBILITY_LABELS,
    },

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

export default credibilitySchema;
