import AnalysisReport from '../models/AnalysisReport.js';
import BatchAnalysisReport from '../models/BatchAnalysisReport.js';

export const globalSearch = async (req, res) => {
  try {
    const { q = '', type = 'all', verdict = 'all', page = 1, limit = 20 } = req.query;
    const limitNum = Math.min(Number(limit) || 20, 50); // Cap at 50
    const skip = (Number(page) - 1) * limitNum;

    // Build query conditions
    const queryConditions = {};

    // 1. Text Search (Metadata title, originalInput)
    if (q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      queryConditions.$or = [
        { 'metadata.urlMetadata.title': regex },
        { 'metadata.file.originalname': regex },
        { 'metadata.title': regex }, // Custom assigned titles if they exist
        { originalInput: regex },
      ];
    }

    // Prepare separate condition objects for Analysis vs Batch because of schema differences
    const analysisConditions = { ...queryConditions };
    const batchConditions = { ...queryConditions };

    // 2. Filter by Verdict
    if (verdict !== 'all') {
      const regexVerdict = new RegExp(`^${verdict}$`, 'i');
      analysisConditions['analysis.overallVerdict.label'] = regexVerdict;
      batchConditions['analysis.overallCredibility'] = regexVerdict;
    }

    // 3. Filter by Source Type
    if (type !== 'all') {
      const regexType = new RegExp(`^${type}$`, 'i');
      analysisConditions['sourceType'] = regexType;
      batchConditions['sourceType'] = regexType; // Will likely only match 'batch'
    }

    let results = [];
    let totalCount = 0;

    // Search Execution based on type
    if (type.toLowerCase() === 'batch') {
      // Only search batch
      const [batchResults, batchCount] = await Promise.all([
        BatchAnalysisReport.find(batchConditions).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        BatchAnalysisReport.countDocuments(batchConditions)
      ]);
      results = batchResults.map(mapBatchReport);
      totalCount = batchCount;
    } else if (type.toLowerCase() !== 'all' && type.toLowerCase() !== 'batch') {
      // Only search individual reports
      const [reportResults, reportCount] = await Promise.all([
        AnalysisReport.find(analysisConditions).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        AnalysisReport.countDocuments(analysisConditions)
      ]);
      results = reportResults.map(mapAnalysisReport);
      totalCount = reportCount;
    } else {
      // Search both
      const [reportResults, reportCount, batchResults, batchCount] = await Promise.all([
        AnalysisReport.find(analysisConditions).sort({ createdAt: -1 }).limit(limitNum).lean(),
        AnalysisReport.countDocuments(analysisConditions),
        BatchAnalysisReport.find(batchConditions).sort({ createdAt: -1 }).limit(limitNum).lean(),
        BatchAnalysisReport.countDocuments(batchConditions)
      ]);
      
      totalCount = reportCount + batchCount;
      
      // Merge and sort in memory for the first page
      results = [
        ...reportResults.map(mapAnalysisReport),
        ...batchResults.map(mapBatchReport)
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(skip, skip + limitNum);
    }

    res.status(200).json({
      success: true,
      data: {
        results,
        pagination: {
          page: Number(page),
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Failed to perform search' });
  }
};

// Normalization Mappers
const mapAnalysisReport = (report) => ({
  id: report._id,
  entityType: 'report',
  title: report.metadata?.title || report.metadata?.urlMetadata?.title || report.metadata?.file?.originalname || report.originalInput?.substring(0, 50) + '...',
  sourceType: report.sourceType,
  verdict: report.analysis?.overallVerdict?.label || 'Unknown',
  score: report.analysis?.credibility?.score || 0,
  createdAt: report.createdAt,
  isPinned: report.isPinned,
  isSaved: report.isSaved
});

const mapBatchReport = (batch) => ({
  id: batch._id,
  entityType: 'batch',
  title: batch.metadata?.title || 'Batch Analysis',
  sourceType: 'batch',
  verdict: batch.analysis?.overallCredibility || 'Unknown',
  score: 0, // Batches typically don't have a single 0-100 score in Prism
  createdAt: batch.createdAt,
  isPinned: batch.isPinned,
  isSaved: batch.isSaved
});
