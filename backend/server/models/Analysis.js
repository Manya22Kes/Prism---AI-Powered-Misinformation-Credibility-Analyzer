const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    sourceUrl: { type: String },
    uploadedFile: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Analysis", analysisSchema);
