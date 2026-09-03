import ActivityEvent from "../models/ActivityEvent.js";
import { logActivity } from "../services/activity.service.js";
import AnalysisReport from "../models/AnalysisReport.js";

export const getActivity = async (req, res, next) => {
  try {
    const { type, page = 1 } = req.query;
    const limit = Math.min(Number(req.query.limit) || 50, 100); // Cap at 100
    const filter = {};

    if (type) {
      if (type === "Analyses") {
        filter.eventType = { $in: ["ANALYSIS_COMPLETED", "BATCH_ANALYSIS_COMPLETED", "REPORT_REANALYZED"] };
      } else if (type === "Reports") {
        filter.eventType = { $in: ["REPORT_SAVED", "REPORT_UNSAVED", "REPORT_PINNED", "REPORT_UNPINNED", "REPORT_DELETED", "REPORT_EXPORTED"] };
      } else if (type === "Collections") {
        filter.eventType = { $in: ["COLLECTION_CREATED", "REPORT_ADDED_TO_COLLECTION", "REPORT_REMOVED_FROM_COLLECTION", "COLLECTION_DELETED"] };
      } else if (type === "Watchlist") {
        filter.eventType = { $in: ["WATCHLIST_CREATED", "WATCHLIST_CHECKED", "WATCHLIST_CHANGED", "WATCHLIST_PAUSED", "WATCHLIST_RESUMED", "WATCHLIST_DELETED"] };
      } else {
        // Direct event type match
        filter.eventType = type;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await ActivityEvent.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityEvent.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logExport = async (req, res, next) => {
  try {
    const { reportId } = req.body;
    
    if (!reportId) {
      return res.status(400).json({ success: false, message: "reportId is required" });
    }

    const report = await AnalysisReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const title = report.metadata?.title || report.metadata?.urlMetadata?.title || report.originalInput || "Report";

    await logActivity({
      eventType: "REPORT_EXPORTED",
      entityType: "Report",
      entityId: report._id,
      title: `Exported: ${title}`
    });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
