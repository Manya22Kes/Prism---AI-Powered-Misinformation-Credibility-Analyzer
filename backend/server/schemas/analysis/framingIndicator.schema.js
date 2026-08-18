import mongoose from "mongoose";
import { SEVERITY_LEVELS } from "../../constants/enums.js";

const framingIndicatorSchema = new mongoose.Schema(
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
    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },
    evidenceQuote: {
      type: String,
      trim: true,
      default: "",
    },
    whyItMatters: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

export default framingIndicatorSchema;
