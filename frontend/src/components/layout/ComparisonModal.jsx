import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueries } from '@tanstack/react-query';
import { X, ExternalLink, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Layers, ChevronRight, GitCompare, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { EmptyState } from '../shared/EmptyState';
import { historyApi } from '../../services/api/history.api';
import { useComparisonStore } from '../../store/comparisonStore';
import { Button } from '../shared/Button';
import { cn } from '../../utils/cn';

// Simple fallback badge for verdicts
const VerdictBadge = ({ verdict }) => {
  const getColors = (v) => {
    const l = (v || '').toLowerCase();
    if (l === 'reliable') return 'text-prism-cyan border-prism-cyan/30 bg-prism-cyan/10';
    if (l === 'mixed') return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    if (l === 'unreliable') return 'text-red-500 border-red-500/30 bg-red-500/10';
    return 'text-prism-text-muted border-prism-border bg-prism-surface';
  };
  return (
    <span className={cn("px-2.5 py-1 text-xs font-semibold uppercase tracking-wider border rounded-md", getColors(verdict))}>
      {verdict || 'Unknown'}
    </span>
  );
};

export const ComparisonModal = ({ isOpen, onClose }) => {
  const { selectedReports, removeReport, clearReports } = useComparisonStore();

  const queries = useQueries({
    queries: selectedReports.map(report => ({
      queryKey: ['report', report.id, report.entityType || report.type],
      queryFn: async () => {
        const isBatch = report.entityType === 'batch' || report.type === 'batch' || report.isBatch || report.sourceType === 'batch';
        const res = isBatch ? await historyApi.getBatchReportById(report.id) : await historyApi.getReportById(report.id);
        return {
          ...res.data,
          _isBatch: isBatch
        };
      },
      staleTime: 60000,
      enabled: isOpen && !!report.id
    }))
  });

  const isLoading = queries.some(q => q.isLoading);

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="relative w-full max-w-[1600px] h-full bg-prism-surface/90 border border-prism-border rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-prism-border/50 bg-prism-surface-active/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-prism-cyan/10 rounded-lg">
              <GitCompare className="text-prism-cyan" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-light text-prism-text-primary">Intelligence Comparison</h2>
              <p className="text-prism-text-secondary text-sm">Comparing {selectedReports.length} {selectedReports.length === 1 ? 'report' : 'reports'}</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <Button variant="outline" size="sm" onClick={clearReports}>Clear All</Button>
            <button onClick={onClose} className="p-2 rounded-xl bg-prism-text-primary/5 hover:bg-red-500/20 hover:text-red-400 text-prism-text-muted transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="flex h-12 w-12 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prism-cyan opacity-40"></span>
              <span className="relative inline-flex rounded-full h-12 w-12 bg-prism-cyan"></span>
            </span>
          </div>
        ) : selectedReports.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <EmptyState 
              icon={Layers}
              title="No Reports Selected"
              description="Select reports from Archive, Saved, or Collections to compare them."
              actionLabel="Close Comparison"
              onAction={onClose}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto overflow-x-hidden md:overflow-x-auto md:overflow-y-hidden px-4 md:px-6 py-6 md:py-8 custom-scrollbar relative">
            <div className="flex flex-col md:flex-row gap-6 h-max md:h-full md:min-w-max pb-4">
              <AnimatePresence>
                {queries.map((query, index) => {
                  const baseReport = selectedReports[index];
                  const fullReport = query.data;
                  const isError = query.isError;
                  
                  if (isError || !fullReport) {
                    return (
                      <motion.div
                        key={`err-${baseReport.id}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full md:w-[400px] shrink-0 h-48 md:h-full bg-prism-surface-active/20 border border-red-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative"
                      >
                        <button onClick={() => removeReport(baseReport.id)} className="absolute top-4 right-4 p-2 text-prism-text-muted hover:text-prism-text-primary transition-colors">
                          <X size={16} />
                        </button>
                        <AlertTriangle className="text-red-500/60 mb-4" size={48} />
                        <h4 className="text-red-400 font-medium mb-2">Report Unavailable</h4>
                        <p className="text-xs text-prism-text-secondary mb-4">This report may have been deleted or is inaccessible.</p>
                        <Button variant="secondary" size="sm" onClick={() => removeReport(baseReport.id)}>Remove</Button>
                      </motion.div>
                    );
                  }

                  const isBatch = fullReport._isBatch;
                  const analysis = fullReport.analysis || {};
                  
                  const verdictLabel = isBatch ? analysis.overallCredibility : analysis.overallVerdict?.label || analysis.verdict;
                  const scoreValue = isBatch ? analysis.sourceComparisons?.consistencyScore : analysis.credibility?.score || analysis.score;
                  const title = fullReport.metadata?.title || (isBatch ? 'Batch Analysis' : 'Analysis Report');

                  return (
                      <motion.div
                      key={fullReport._id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, width: 0, margin: 0, padding: 0, overflow: 'hidden' }}
                      className="w-full md:w-[450px] shrink-0 h-max md:h-full flex flex-col gap-4 relative"
                    >
                      {/* Header Card */}
                      <div className="bg-prism-surface border border-prism-border rounded-2xl p-6 relative overflow-hidden shrink-0 sticky top-0 z-30 shadow-xl md:shadow-none">
                        <button onClick={() => removeReport(baseReport.id)} className="absolute top-4 right-4 p-1.5 text-prism-text-muted hover:text-prism-text-primary hover:bg-red-500/20 rounded-md transition-colors z-20">
                          <X size={16} />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-prism-surface-active text-prism-text-secondary border border-prism-border">
                            {isBatch ? <Layers size={16} /> : <FileText size={16} />}
                          </div>
                          <span className="text-xs font-mono text-prism-text-muted">
                            {new Date(fullReport.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-medium text-prism-text-primary mb-2 line-clamp-2 pr-6">
                          {title}
                        </h3>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-prism-border/50">
                          <VerdictBadge verdict={verdictLabel} />
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-widest text-prism-text-muted">Score</span>
                            <span className="text-xl font-bold font-mono tracking-tighter text-prism-cyan">{scoreValue ?? '--'}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <Link to={isBatch ? `/batch/${fullReport._id}` : `/report/${fullReport._id}`} onClick={onClose}>
                            <button className="flex items-center gap-1.5 text-xs text-prism-text-muted hover:text-prism-cyan transition-colors">
                              Open Full Report <ExternalLink size={12} />
                            </button>
                          </Link>
                        </div>
                      </div>

                      {/* Scrollable Content Body */}
                      <div className="flex-1 bg-prism-surface-active/20 border border-prism-border rounded-2xl p-4 md:p-6 md:overflow-y-auto custom-scrollbar shadow-inner">
                        <div className="mb-8">
                          <h4 className="text-xs font-semibold text-prism-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-prism-cyan" /> Summary
                          </h4>
                          <p className="text-sm text-prism-text-primary leading-relaxed font-light">
                            {isBatch ? analysis.overallSummary : analysis.summary}
                          </p>
                        </div>

                        {isBatch ? (
                          <>
                            {analysis.recurringThemes?.length > 0 && (
                              <div className="mb-8">
                                <h4 className="text-xs font-semibold text-prism-text-secondary uppercase tracking-widest mb-3">
                                  Recurring Themes
                                </h4>
                                <ul className="space-y-2">
                                  {analysis.recurringThemes.map((theme, i) => (
                                    <li key={i} className="text-sm text-prism-text-primary flex items-start gap-2 bg-prism-surface/50 p-3 rounded-lg border border-prism-border/40">
                                      <div className="w-1.5 h-1.5 rounded-full bg-prism-cyan mt-1.5 shrink-0" />
                                      <span>{theme}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {analysis.contradictoryClaims?.length > 0 && (
                              <div className="mb-8">
                                <h4 className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-3">
                                  Contradictions
                                </h4>
                                <ul className="space-y-3">
                                  {analysis.contradictoryClaims.map((conflict, i) => (
                                    <li key={i} className="text-sm bg-red-500/5 border border-red-500/20 p-3 rounded-lg">
                                      <div className="font-medium text-prism-text-primary mb-1">Claim: {conflict.claim}</div>
                                      <div className="text-red-400/80 text-xs">{conflict.conflict}</div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {analysis.claims?.length > 0 && (
                              <div className="mb-8">
                                <h4 className="text-xs font-semibold text-prism-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <CheckCircle2 size={14} className="text-prism-cyan" /> Key Claims
                                </h4>
                                <ul className="space-y-3">
                                  {analysis.claims.slice(0, 4).map((claim, i) => (
                                    <li key={i} className="text-sm bg-prism-surface/50 border border-prism-border/40 p-3 rounded-lg flex flex-col gap-2">
                                      <span className="text-prism-text-primary">{claim.claim}</span>
                                      <div className="flex items-center gap-2">
                                        <VerdictBadge verdict={claim.verdict} />
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}

                        <div className="mb-4 pt-6 border-t border-prism-border/50">
                          <h4 className="text-xs font-semibold text-prism-text-secondary uppercase tracking-widest mb-3">
                            Input Context
                          </h4>
                          <div className="text-xs font-mono text-prism-text-muted bg-prism-surface p-3 rounded-lg border border-prism-border overflow-hidden text-ellipsis line-clamp-3">
                            {fullReport.originalInput || 'N/A'}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Global Floating Action Bar for Comparison
export const ComparisonActionBar = () => {
  const { selectedReports, clearReports } = useComparisonStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const location = useLocation();

  // Only show on specific pages (Archive, Saved, Collections)
  const isRelevantPage = ['/archive', '/saved', '/collections', '/collection'].some(p => location.pathname.startsWith(p));

  if (!isRelevantPage || selectedReports.length === 0) return null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-prism-surface/90 backdrop-blur-xl border border-prism-cyan/30 shadow-[0_0_30px_rgba(34,211,238,0.15)] rounded-full px-6 py-3 flex items-center gap-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-prism-cyan/20 text-prism-cyan flex items-center justify-center font-bold font-mono">
            {selectedReports.length}
          </div>
          <span className="text-prism-text-primary font-medium text-sm">Reports Selected</span>
        </div>

        <div className="w-px h-6 bg-prism-border/50" />

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={clearReports} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
            Clear
          </Button>
          <Button variant="primary" size="sm" className="shadow-[0_0_15px_rgba(34,211,238,0.3)]" onClick={() => setIsModalOpen(true)}>
            Compare Now
          </Button>
        </div>
      </motion.div>

      <ComparisonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
