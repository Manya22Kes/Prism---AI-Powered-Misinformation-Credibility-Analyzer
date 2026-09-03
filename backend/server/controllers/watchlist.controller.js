import WatchlistItem from "../models/WatchlistItem.js";
import { analyzeContent } from "../services/analysis.service.js";
import { processUrl } from "../processors/url/index.js";
import validateUrl from "../utils/urlValidator.js";
import { logActivity } from "../services/activity.service.js";

export const getWatchlistItems = async (req, res, next) => {
  try {
    const items = await WatchlistItem.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const getWatchlistItemById = async (req, res, next) => {
  try {
    const item = await WatchlistItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Watchlist item not found" });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const createWatchlistItem = async (req, res, next) => {
  try {
    const { name, targetType, target, description } = req.body;
    
    if (!name || !targetType || !target) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (targetType === "URL") {
      try {
        validateUrl(target);
      } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid URL provided for target" });
      }
    }

    const newItem = await WatchlistItem.create({
      name,
      targetType,
      target,
      description,
      isActive: true,
      history: []
    });

    await logActivity({
      eventType: "WATCHLIST_CREATED",
      entityType: "Watchlist",
      entityId: newItem._id,
      title: `Added to Watchlist: ${newItem.name}`,
      metadata: { targetType, target }
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

export const updateWatchlistItem = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;
    
    const updated = await WatchlistItem.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Watchlist item not found" });
    }

    if (req.body.isActive !== undefined) {
      await logActivity({
        eventType: updated.isActive ? "WATCHLIST_RESUMED" : "WATCHLIST_PAUSED",
        entityType: "Watchlist",
        entityId: updated._id,
        title: `${updated.isActive ? "Resumed" : "Paused"} Monitoring: ${updated.name}`
      });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteWatchlistItem = async (req, res, next) => {
  try {
    const deleted = await WatchlistItem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Watchlist item not found" });
    }

    await logActivity({
      eventType: "WATCHLIST_DELETED",
      entityType: "Watchlist",
      entityId: deleted._id,
      title: `Deleted from Watchlist: ${deleted.name}`
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const checkWatchlistItem = async (req, res, next) => {
  try {
    const item = await WatchlistItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Watchlist item not found" });
    }

    if (item.targetType === "SOURCE" || item.targetType === "TOPIC") {
      return res.status(400).json({ 
        success: false, 
        message: "Live checking for SOURCE and TOPIC is a future capability and requires search integrations." 
      });
    }

    if (item.targetType === "URL") {
      const validatedUrl = validateUrl(item.target);
      
      const {
        processedContent,
        urlMetadata,
        pageType,
        pageTypeConfidence,
        isArticle,
        message,
      } = await processUrl(validatedUrl);

      if (!isArticle) {
        return res.status(400).json({ success: false, message: message || "URL is not a valid article" });
      }

      const report = await analyzeContent({
        sourceType: "url",
        originalInput: validatedUrl,
        processedContent,
      }, null); // no progress callback

      report.metadata.urlMetadata = urlMetadata;
      report.metadata.pageType = pageType;
      report.metadata.pageTypeConfidence = pageTypeConfidence;
      report.metadata.isArticle = isArticle;

      await report.save();

      const newScore = report.analysis.credibility?.score || report.analysis.score || 0;
      const newVerdict = report.analysis.verdict || report.analysis.overallVerdict?.label || "Unknown";

      // Calculate change
      let scoreChange = null;
      if (item.history && item.history.length > 0) {
        const lastEntry = item.history[item.history.length - 1];
        if (lastEntry && typeof lastEntry.score === 'number') {
          scoreChange = newScore - lastEntry.score;
        }
      }

      // Add to history
      item.history.push({
        date: new Date(),
        score: newScore,
        verdict: newVerdict,
        analysisId: report._id,
        scoreChange: scoreChange
      });

      item.lastCheckedAt = new Date();
      item.lastAnalysisId = report._id;
      item.lastScore = newScore;
      item.lastVerdict = newVerdict;

      await item.save();

      if (scoreChange !== null && scoreChange !== 0) {
        await logActivity({
          eventType: "WATCHLIST_CHANGED",
          entityType: "Watchlist",
          entityId: item._id,
          title: `Change Detected: ${item.name}`,
          description: `Score changed from ${newScore - scoreChange} to ${newScore}. Verdict: ${newVerdict}`,
          metadata: { newScore, scoreChange, newVerdict, reportId: report._id }
        });
      } else {
        await logActivity({
          eventType: "WATCHLIST_CHECKED",
          entityType: "Watchlist",
          entityId: item._id,
          title: `Checked: ${item.name}`,
          metadata: { reportId: report._id }
        });
      }

      return res.status(200).json({ success: true, data: item });
    }

    return res.status(400).json({ success: false, message: "Unsupported target type" });

  } catch (error) {
    next(error);
  }
};
