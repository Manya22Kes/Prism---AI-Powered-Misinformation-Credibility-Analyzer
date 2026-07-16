import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    startIndex: {
      type: Number,
      min: 0,
      default: null,
    },

    endIndex: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    _id: false,
  },
);

export default evidenceSchema;
