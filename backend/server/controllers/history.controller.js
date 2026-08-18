import Report from '../models/AnalysisReport.js';
import BatchReport from '../models/BatchAnalysisReport.js';

export const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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

export const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

export const getBatchReportById = async (req, res, next) => {
  try {
    const batchReport = await BatchReport.findById(req.params.id).populate('reports');
    if (!batchReport) {
      return res.status(404).json({ success: false, message: 'Batch report not found' });
    }
    res.status(200).json({ success: true, data: batchReport });
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

    res.status(200).json({ 
      success: true, 
      data: { id: report._id, isPinned: report.isPinned, isBatch } 
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

    res.status(200).json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
};
