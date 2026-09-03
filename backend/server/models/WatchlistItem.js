import mongoose from "mongoose";

const historyEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  score: {
    type: Number,
  },
  verdict: {
    type: String,
  },
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AnalysisReport",
  },
  scoreChange: {
    type: Number,
    default: null, // null means first check
  },
});

const watchlistItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    targetType: {
      type: String,
      enum: ["URL", "SOURCE", "TOPIC"],
      required: true,
    },
    target: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastCheckedAt: {
      type: Date,
    },
    lastAnalysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnalysisReport",
    },
    lastScore: {
      type: Number,
    },
    lastVerdict: {
      type: String,
    },
    history: [historyEntrySchema],
  },
  {
    timestamps: true,
  }
);

watchlistItemSchema.index({ createdAt: -1 });
watchlistItemSchema.index({ isActive: 1, createdAt: -1 });

const WatchlistItem = mongoose.model("WatchlistItem", watchlistItemSchema);

export default WatchlistItem;
