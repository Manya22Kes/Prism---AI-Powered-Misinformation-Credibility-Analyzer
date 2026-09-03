import Collection from '../models/Collection.js';
import Report from '../models/AnalysisReport.js';
import BatchReport from '../models/BatchAnalysisReport.js';
import { logActivity } from '../services/activity.service.js';

export const getCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: collections });
  } catch (error) {
    next(error);
  }
};

export const getCollectionById = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('reports')
      .populate('batchReports');
      
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    res.status(200).json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
};

export const createCollection = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    
    const collection = await Collection.create({ name, description });
    
    await logActivity({
      eventType: "COLLECTION_CREATED",
      entityType: "Collection",
      entityId: collection._id,
      title: `Created Collection: ${name}`,
    });

    res.status(201).json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
};

export const updateCollection = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const collection = await Collection.findByIdAndUpdate(
      req.params.id, 
      { name, description }, 
      { new: true, runValidators: true }
    );
    
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    res.status(200).json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
};

export const deleteCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    
    await logActivity({
      eventType: "COLLECTION_DELETED",
      entityType: "Collection",
      entityId: collection._id,
      title: `Deleted Collection: ${collection.name}`,
    });

    res.status(200).json({ success: true, message: 'Collection deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addReportToCollection = async (req, res, next) => {
  try {
    const { id, reportId } = req.params;
    
    // Check if it's a batch or normal report
    let isBatch = false;
    let report = await Report.findById(reportId);
    
    if (!report) {
      report = await BatchReport.findById(reportId);
      isBatch = true;
    }
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    if (isBatch) {
      if (!collection.batchReports.includes(reportId)) {
        collection.batchReports.push(reportId);
      }
    } else {
      if (!collection.reports.includes(reportId)) {
        collection.reports.push(reportId);
      }
    }
    
    await collection.save();

    const title = report.metadata?.title || report.metadata?.urlMetadata?.title || report.originalInput || report.batchName || "Report";
    await logActivity({
      eventType: "REPORT_ADDED_TO_COLLECTION",
      entityType: isBatch ? "BatchReport" : "Report",
      entityId: report._id,
      title: `Added "${title}" to ${collection.name}`,
      metadata: { collectionId: collection._id }
    });

    res.status(200).json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
};

export const removeReportFromCollection = async (req, res, next) => {
  try {
    const { id, reportId } = req.params;
    
    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    collection.reports = collection.reports.filter(rId => rId.toString() !== reportId);
    collection.batchReports = collection.batchReports.filter(rId => rId.toString() !== reportId);
    
    await collection.save();

    await logActivity({
      eventType: "REPORT_REMOVED_FROM_COLLECTION",
      entityType: "Collection",
      entityId: collection._id,
      title: `Removed a report from ${collection.name}`,
      metadata: { reportId }
    });

    res.status(200).json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
};
