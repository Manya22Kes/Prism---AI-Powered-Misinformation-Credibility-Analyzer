import mongoose from "mongoose";

const activityEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: [
        "ANALYSIS_COMPLETED",
        "ANALYSIS_FAILED",
        "BATCH_ANALYSIS_COMPLETED",
        "BATCH_ANALYSIS_FAILED",
        "REPORT_SAVED",
        "REPORT_UNSAVED",
        "REPORT_PINNED",
        "REPORT_UNPINNED",
        "REPORT_DELETED",
        "REPORT_REANALYZED",
        "COLLECTION_CREATED",
        "REPORT_ADDED_TO_COLLECTION",
        "REPORT_REMOVED_FROM_COLLECTION",
        "COLLECTION_DELETED",
        "WATCHLIST_CREATED",
        "WATCHLIST_CHECKED",
        "WATCHLIST_CHANGED",
        "WATCHLIST_PAUSED",
        "WATCHLIST_RESUMED",
        "WATCHLIST_DELETED",
        "REPORT_EXPORTED",
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: ["Report", "BatchReport", "Collection", "Watchlist", "System"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast chronological retrieval and filtering
activityEventSchema.index({ createdAt: -1 });
activityEventSchema.index({ eventType: 1, createdAt: -1 });

const ActivityEvent = mongoose.model("ActivityEvent", activityEventSchema);

export default ActivityEvent;
