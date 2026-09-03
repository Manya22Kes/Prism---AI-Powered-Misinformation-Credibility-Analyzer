import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    reports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AnalysisReport",
      },
    ],
    batchReports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BatchAnalysisReport",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reports inside the same collection
collectionSchema.pre("save", function () {
  if (this.reports && this.reports.length > 0) {
    this.reports = [...new Set(this.reports.map(id => id.toString()))];
  }
  if (this.batchReports && this.batchReports.length > 0) {
    this.batchReports = [...new Set(this.batchReports.map(id => id.toString()))];
  }
});

collectionSchema.index({ updatedAt: -1 });

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
