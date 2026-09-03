import Report from '../models/AnalysisReport.js';
import BatchReport from '../models/BatchAnalysisReport.js';
import { logActivity } from '../services/activity.service.js';

export const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;
    limit = Math.min(limit, 50); // Cap at 50
    const skip = (page - 1) * limit;

    // Fetch individual reports
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch batch reports
    const batchReports = await BatchReport.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // In a real application, we would interleave these perfectly with an aggregation pipeline
    // For now, we'll just merge and sort them in JS for simplicity
    const combined = [...reports.map(r => ({ ...r, isBatch: false })), ...batchReports.map(b => ({ ...b, isBatch: true }))]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    res.status(200).json({
      success: true,
      data: combined,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;
    limit = Math.min(limit, 50); // Cap at 50
    const skip = (page - 1) * limit;

    const reports = await Report.find({ isSaved: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const batchReports = await BatchReport.find({ isSaved: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const combined = [...reports.map(r => ({ ...r, isBatch: false })), ...batchReports.map(b => ({ ...b, isBatch: true }))]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    res.status(200).json({
      success: true,
      data: combined,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    let report = await Report.findById(req.params.id);
    let isBatch = false;
    if (!report) {
      report = await BatchReport.findById(req.params.id).populate('reports');
      if (report) isBatch = true;
    }
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.status(200).json({ success: true, data: report, isBatch });
  } catch (error) {
    next(error);
  }
};

export const getBatchReportById = async (req, res, next) => {
  try {
    let batchReport = await BatchReport.findById(req.params.id).populate('reports');
    let isBatch = true;
    if (!batchReport) {
      batchReport = await Report.findById(req.params.id);
      if (batchReport) isBatch = false;
    }
    if (!batchReport) {
      return res.status(404).json({ success: false, message: 'Batch report not found' });
    }
    res.status(200).json({ success: true, data: batchReport, isBatch });
  } catch (error) {
    next(error);
  }
};

export const togglePinStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check AnalysisReport first
    let report = await Report.findById(id);
    let isBatch = false;

    if (!report) {
      // If not found, check BatchAnalysisReport
      report = await BatchReport.findById(id);
      isBatch = true;
    }

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.isPinned = !report.isPinned;
    await report.save();

    const title = report.metadata?.title || report.metadata?.urlMetadata?.title || report.originalInput || report.batchName || "Report";
    await logActivity({
      eventType: report.isPinned ? "REPORT_PINNED" : "REPORT_UNPINNED",
      entityType: isBatch ? "BatchReport" : "Report",
      entityId: report._id,
      title: `${report.isPinned ? "Pinned" : "Unpinned"}: ${title}`,
    });

    res.status(200).json({ 
      success: true, 
      data: { id: report._id, isPinned: report.isPinned, isBatch } 
    });
  } catch (error) {
    next(error);
  }
};

export const toggleSaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    let report = await Report.findById(id);
    let isBatch = false;

    if (!report) {
      report = await BatchReport.findById(id);
      isBatch = true;
    }

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.isSaved = !report.isSaved;
    await report.save();

    const title = report.metadata?.title || report.metadata?.urlMetadata?.title || report.originalInput || report.batchName || "Report";
    await logActivity({
      eventType: report.isSaved ? "REPORT_SAVED" : "REPORT_UNSAVED",
      entityType: isBatch ? "BatchReport" : "Report",
      entityId: report._id,
      title: `${report.isSaved ? "Saved" : "Unsaved"}: ${title}`,
    });

    res.status(200).json({ 
      success: true, 
      data: { id: report._id, isSaved: report.isSaved, isBatch } 
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check AnalysisReport first
    let report = await Report.findById(id);
    let isBatch = false;

    if (!report) {
      // If not found, check BatchAnalysisReport
      report = await BatchReport.findById(id);
      isBatch = true;
    }

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (isBatch) {
      await BatchReport.findByIdAndDelete(id);
    } else {
      await Report.findByIdAndDelete(id);
    }

    const title = report.metadata?.title || report.metadata?.urlMetadata?.title || report.originalInput || report.batchName || "Report";
    await logActivity({
      eventType: "REPORT_DELETED",
      entityType: isBatch ? "BatchReport" : "Report",
      entityId: report._id,
      title: `Deleted: ${title}`,
    });

    res.status(200).json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
};
