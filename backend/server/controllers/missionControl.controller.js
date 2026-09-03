import AnalysisReport from "../models/AnalysisReport.js";
import BatchAnalysisReport from "../models/BatchAnalysisReport.js";
import Collection from "../models/Collection.js";
import WatchlistItem from "../models/WatchlistItem.js";
import ActivityEvent from "../models/ActivityEvent.js";
import { checkSystemHealth } from "./health.controller.js";

export const getMissionControlData = async (req, res, next) => {
  try {
    const [
      { health, statusCode },
      totalAnalyses,
      averageScoreAgg,
      savedReports,
      pinnedReports,
      totalBatchReports,
      totalCollections,
      totalWatchlists,
      activeWatchlists,
      pausedWatchlists,
      neverCheckedWatchlists,
      nullCheckedWatchlists,
      sourceTypeDistAgg,
      verdictDistAgg
    ] = await Promise.all([
      checkSystemHealth(),
      AnalysisReport.countDocuments(),
      AnalysisReport.aggregate([
        { $match: { "analysis.credibility.score": { $ne: null } } },
        { $group: { _id: null, avgScore: { $avg: "$analysis.credibility.score" } } }
      ]),
      AnalysisReport.countDocuments({ isSaved: true }),
      AnalysisReport.countDocuments({ isPinned: true }),
      BatchAnalysisReport.countDocuments(),
      Collection.countDocuments(),
      WatchlistItem.countDocuments(),
      WatchlistItem.countDocuments({ isActive: true }),
      WatchlistItem.countDocuments({ isActive: false }),
      WatchlistItem.countDocuments({ lastCheckedAt: { $exists: false } }),
      WatchlistItem.countDocuments({ lastCheckedAt: null }),
      AnalysisReport.aggregate([{ $group: { _id: "$sourceType", count: { $sum: 1 } } }]),
      AnalysisReport.aggregate([{ $group: { _id: "$analysis.overallVerdict.label", count: { $sum: 1 } } }])
    ]);

    let averageScore = null;
    if (averageScoreAgg.length > 0 && averageScoreAgg[0].avgScore != null) {
      averageScore = Math.round(averageScoreAgg[0].avgScore);
    }

    const sourceTypeDistribution = sourceTypeDistAgg.reduce((acc, curr) => {
      if (curr._id) acc[curr._id] = curr.count;
      return acc;
    }, {});

    const verdictDistribution = verdictDistAgg.reduce((acc, curr) => {
      if (curr._id) acc[curr._id] = curr.count;
      return acc;
    }, {});

    const payload = {
      system: {
        status: health.status === "operational" ? "OPERATIONAL" : "DEGRADED",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "Production",
        appVersion: "4.2",
        apiVersion: "v1",
        aiProvider: (process.env.GEMINI_MODEL && !process.env.GEMINI_MODEL.includes("3.5")) 
          ? process.env.GEMINI_MODEL 
          : "gemini-3.7-flash"
      },
      analysis: {
        totalReports: totalAnalyses,
        totalBatchReports: totalBatchReports,
        averageScore: averageScore,
        savedReports: savedReports,
        pinnedReports: pinnedReports,
        sourceTypeDistribution,
        verdictDistribution
      },
      organization: {
        collections: totalCollections
      },
      watchlist: {
        total: totalWatchlists,
        active: activeWatchlists,
        paused: pausedWatchlists,
        neverChecked: neverCheckedWatchlists + nullCheckedWatchlists
      },
      health: health.services
    };

    res.status(statusCode).json(payload);
  } catch (error) {
    next(error);
  }
};
