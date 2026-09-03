import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, Download, ChevronLeft, Layers, CheckCircle2, Pin, RefreshCw, MessageSquare, FileText, Bookmark, AlertCircle } from 'lucide-react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyApi } from '../services/api/history.api';
import { activityApi } from '../services/api/activity.api';
import { CredibilityGauge } from '../components/report/CredibilityGauge';
import { ContradictionGraph } from '../components/report/ContradictionGraph';
import { ClaimCard } from '../components/report/ClaimCard';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { CollectionSelector } from '../components/report/CollectionSelector';
import { EmptyState } from '../components/shared/EmptyState';
import { useCinematicStore } from '../store/cinematicStore';
import toast from 'react-hot-toast';

// Utility to get glow color based on score
const getScoreGlow = (score) => {
  if (score >= 80) return 'rgba(34, 211, 238, 0.15)'; // Cyan
  if (score >= 50) return 'rgba(250, 204, 21, 0.15)'; // Yellow
  return 'rgba(239, 68, 68, 0.15)'; // Red
};

export const BatchDashboard = () => {
  const { id } = useParams();
  const location = useLocation();
  const fromWorkspace = location.state?.fromWorkspace || location.state?.from === 'workspace';
  const backTarget = fromWorkspace ? '/' : '/archive';
  const backLabel = fromWorkspace ? 'Workspace' : 'Archive';

  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);
  const setEnvironmentWorkspace = useCinematicStore((state) => state.setEnvironmentWorkspace);
  const setPrismPosition = useCinematicStore((state) => state.setPrismPosition);
  const queryClient = useQueryClient();

  const pinMutation = useMutation({
    mutationFn: () => historyApi.togglePin(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['batch', id] });
      const previousData = queryClient.getQueryData(['batch', id]);
      
      queryClient.setQueryData(['batch', id], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            isPinned: !old.data.isPinned
          }
        };
      });
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['batch', id], context.previousData);
      toast.error('Failed to update pin status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['batch', id] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
    onSuccess: (data) => {
      // The backend togglePin returns the updated doc or undefined.
      // Since it's optimistic, we rely on standard query invalidation, 
      // but let's just trigger a generic success if we can't tell the exact state.
      toast.success('Pin status updated');
    }
  });

  useEffect(() => {
    // Report environment: Prism is in the background, subtly glowing
    setEnvironmentWorkspace();
    setPrismPosition([4, -2, -5]);
  }, [setEnvironmentWorkspace, setPrismPosition]);

  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['batch', id],
    queryFn: () => historyApi.getBatchReportById(id),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  const rawBatchDoc = response?.data?.data || response?.data || response;
  const batchData = rawBatchDoc?._id ? rawBatchDoc : null;
  const report = batchData?.analysis;
  const metadata = batchData?.metadata || {};

  const navigate = useNavigate();
  useEffect(() => {
    if (response?.isBatch === false || (batchData && !batchData.reports && batchData.sourceType !== 'batch')) {
      navigate(`/report/${id}`, { replace: true });
    }
  }, [response, batchData, id, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <span className="flex h-10 w-10 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prism-cyan opacity-50"></span>
          <span className="relative inline-flex rounded-full h-10 w-10 bg-prism-accent"></span>
        </span>
      </div>
    );
  }

  if (isError || !batchData) {
    return (
      <div className="flex h-[80vh] items-center justify-center py-20 max-w-2xl mx-auto flex-col gap-4">
        <EmptyState 
          icon={AlertCircle}
          title="Failed to load batch report"
          description={error?.message || "Batch report could not be found or loaded from database."}
          actionLabel="Try Loading Again"
          onAction={() => refetch()}
        />
        <button 
          onClick={() => navigate('/archive')}
          className="text-xs font-mono text-prism-text-muted hover:text-prism-text-primary underline uppercase tracking-wider transition-colors"
        >
          Return to Archive
        </button>
      </div>
    );
  }

  const analysis = batchData.analysis || {};
  const individualReports = batchData.reports || [];

  // Map backend schema to what the UI components expect
  const score = analysis.sourceComparisons?.consistencyScore || 0;
  const verdict = analysis.overallCredibility || "Unknown";
  const summary = analysis.overallSummary || "No summary available.";
  const filesAnalyzed = (metadata.batch?.fileCount || 0) - (batchData.failedFiles?.length || 0);
  const filesFailed = batchData.failedFiles?.length || 0;

  // Map corroborated claims safely without inventing fields and STRICTLY require > 1 source
  const corroboratedClaims = (analysis.corroboratedClaims || []).filter(c => c && c.claim && Array.isArray(c.foundIn) && c.foundIn.length > 1);

  // Map contradictions safely without inventing fields
  const contradictions = (analysis.contradictoryClaims || []).filter(c => c && c.claim);
  
  // Map recurring themes
  const themes = analysis.recurringThemes || [];

  const scoreGlow = getScoreGlow(score);

  return (
    <div className="relative max-w-6xl mx-auto pb-20 pt-8">
      
      {/* Dynamic Background Glow based on Score */}
      <motion.div 
        className="fixed inset-0 z-[-1] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{
          background: `radial-gradient(circle at 50% -20%, ${scoreGlow}, transparent 70%)`
        }}
      />

      {/* Navigation Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex flex-wrap items-center justify-between gap-4 mb-8 sm:mb-12"
      >
        <Link to={backTarget} className="flex items-center text-prism-text-secondary hover:text-prism-text-primary transition-colors group">
          <ChevronLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="tracking-wide uppercase text-sm font-medium">{backLabel}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Badge variant="accent" className="hidden md:flex gap-1.5 px-3 py-1">
            <Layers size={14} /> Batch Synthesis
          </Badge>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => pinMutation.mutate()}
            className={`hover:bg-prism-text-primary/10 ${batchData?.isPinned ? 'text-prism-cyan' : 'text-prism-text-secondary'}`}
            title={batchData?.isPinned ? "Unpin Batch" : "Pin Batch"}
          >
            <Pin size={18} className={batchData?.isPinned ? 'fill-prism-cyan' : ''} />
          </Button>


          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSaveMenuOpen(!isSaveMenuOpen)}
              className={`hover:bg-prism-text-primary/10 ${batchData?.isSaved ? 'text-prism-cyan' : 'text-prism-text-secondary'}`}
              title={batchData?.isSaved ? "Saved" : "Save to Collection"}
            >
              <Bookmark size={18} className={batchData?.isSaved ? 'fill-prism-cyan' : ''} />
            </Button>
            <AnimatePresence>
              {isSaveMenuOpen && (
                <CollectionSelector 
                  reportId={id} 
                  isSaved={batchData?.isSaved}
                  isBatch={true}
                  onClose={() => setIsSaveMenuOpen(false)} 
                />
              )}
            </AnimatePresence>
          </div>

          <Button 
            variant="primary" 
            size="sm" 
            disabled={true}
            title="Re-analysis unavailable for batches — original files are not stored."
            className="gap-2 text-xs font-semibold bg-prism-accent/50 text-prism-text-primary/50 border-prism-text-primary/5 cursor-not-allowed hidden md:flex"
          >
            <RefreshCw size={14} />
            Re-analyze
          </Button>

          <Button variant="ghost" size="icon" className="hover:bg-prism-text-primary/10"><Share size={18} /></Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-prism-text-primary/20 hover:bg-prism-text-primary/5"
            onClick={() => {
              activityApi.logExport(id).catch(console.error);
              window.print();
            }}
          >
            <Download size={16} /> Export Batch Report
          </Button>
        </div>
      </motion.div>

      {/* Batch Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring", bounce: 0.4 }}
          className="col-span-1 glass-panel rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden border-t border-prism-text-primary/10"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent z-0 pointer-events-none" />
          <div className="relative z-10 w-full flex flex-col items-center">
            <CredibilityGauge score={score} size={220} strokeWidth={14} isNotApplicable={verdict === 'NOT APPLICABLE' || verdict === 'Not Applicable'} />
            <div className="mt-8 text-center w-full">
              <Badge variant={verdict === 'NOT APPLICABLE' || verdict === 'Not Applicable' ? 'outline' : (score >= 80 ? 'success' : score >= 50 ? 'warning' : 'danger')} className={`text-sm px-4 py-1.5 mb-4 tracking-widest uppercase ${verdict === 'NOT APPLICABLE' || verdict === 'Not Applicable' ? 'text-prism-text-secondary border-prism-text-primary/20' : ''}`}>
                {verdict}
              </Badge>
              { (verdict === 'NOT APPLICABLE' || verdict === 'Not Applicable') && (
                <p className="text-xs text-prism-text-secondary mt-2 px-4">
                  No combined credibility score can be established because the sources are unrelated.
                </p>
              )}
              <div className="mt-4 pt-4 border-t border-prism-text-primary/10 flex justify-center gap-4 w-full text-xs text-prism-text-muted uppercase tracking-wider">
                <span className="text-prism-high">{filesAnalyzed} Files Valid</span>
                {filesFailed > 0 && <span className="text-red-400">{filesFailed} Failed</span>}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="col-span-1 lg:col-span-2 glass-panel-strong rounded-3xl p-10 flex flex-col justify-center border-t border-prism-text-primary/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-prism-accent/5 rounded-full blur-[80px] pointer-events-none" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-prism-accent mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-prism-accent/50" /> Batch Synthesis
          </h2>
          <p className="text-3xl font-light leading-relaxed text-prism-text-primary">
            {summary}
          </p>
        </motion.div>
      </div>

      {/* Deep Dive Grid */}
      <div className="flex flex-col gap-16">
        
        {/* Contradictions Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h3 className="text-2xl font-light tracking-wide text-prism-text-primary mb-8 flex items-center gap-4">
            Contradiction Matrix
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </h3>
          {contradictions.length > 0 ? (
            <ContradictionGraph contradictions={contradictions} />
          ) : (
            <div className="glass-panel p-8 rounded-2xl text-center text-prism-text-secondary border-dashed border-prism-text-primary/5 bg-white/[0.01]">
              No contradictions detected.
            </div>
          )}
        </motion.section>

        {/* Corroborated Claims Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h3 className="text-2xl font-light tracking-wide text-prism-text-primary mb-8 flex items-center gap-4">
            Corroborated Findings
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </h3>
          {corroboratedClaims.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {corroboratedClaims.map((claim, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="glass-panel p-6 rounded-2xl flex flex-col gap-3 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-2 mb-2 relative z-10">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">Corroborated</span>
                  </div>
                  <p className="text-base font-medium text-prism-text-primary/90 leading-relaxed relative z-10">
                    "{claim.claim}"
                  </p>
                  <div className="mt-auto pt-4 border-t border-prism-text-primary/5 relative z-10">
                    <span className="text-[10px] uppercase font-mono text-prism-text-primary/40 block mb-2 tracking-wider">Found In:</span>
                    <div className="flex flex-wrap gap-2">
                      {claim.foundIn?.map((source, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] text-prism-text-primary/60 border-prism-text-primary/10 bg-prism-text-primary/5">{source}</Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl text-center text-prism-text-secondary border-dashed border-prism-text-primary/5 bg-white/[0.01]">
              No corroborated findings detected.
            </div>
          )}
        </motion.section>

        {/* Source Comparisons Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          <h3 className="text-2xl font-light tracking-wide text-prism-text-primary mb-8 flex items-center gap-4">
            Source Comparisons
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </h3>
          {analysis.sourceComparisons?.comparisons?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.sourceComparisons.comparisons.map((comp, idx) => (
                <div key={idx} className="glass-panel p-6 rounded-2xl border-prism-text-primary/5">
                  <div className="text-sm font-medium text-prism-cyan mb-2">Sources: {comp.sources?.join(' & ')}</div>
                  <div className="text-prism-text-primary/80 text-sm leading-relaxed mb-3">{comp.analysis}</div>
                  <div className="text-xs text-prism-text-secondary uppercase tracking-widest">
                    Relationship: <span className={comp.relationship === 'Corroborating' ? 'text-prism-high' : comp.relationship === 'Contradictory' ? 'text-prism-low' : 'text-prism-medium'}>{comp.relationship}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl text-center text-prism-text-secondary border-dashed border-prism-text-primary/5 bg-white/[0.01]">
              No meaningful cross-source comparison available.
            </div>
          )}
        </motion.section>

      </div>

        {/* Recurring Themes Section */}
        {themes.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="text-2xl font-light tracking-wide text-prism-text-primary mb-8 flex items-center gap-4">
              Recurring Themes
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {themes.map((themeObj, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="glass-panel p-6 rounded-2xl flex flex-col gap-3 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-2 mb-2 relative z-10">
                    <MessageSquare size={18} className="text-indigo-400" />
                    <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">Theme</span>
                  </div>
                  <p className="text-base font-medium text-prism-text-primary/90 leading-relaxed relative z-10">
                    {themeObj.theme}
                  </p>
                  <div className="mt-auto pt-4 border-t border-prism-text-primary/5 relative z-10">
                    <span className="text-[10px] uppercase font-mono text-prism-text-primary/40 block mb-2 tracking-wider">Found In:</span>
                    <div className="flex flex-wrap gap-2">
                      {themeObj.foundIn?.map((source, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] text-prism-text-primary/60 border-prism-text-primary/10 bg-prism-text-primary/5">{source}</Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Individual Documents Section */}
        {individualReports.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h3 className="text-2xl font-light tracking-wide text-prism-text-primary mb-8 flex items-center gap-4">
              Documents in this Batch
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {individualReports.map((r, idx) => {
                const docScore = typeof r.analysis?.credibility?.score === 'number' 
                  ? r.analysis.credibility.score 
                  : (typeof r.analysis?.score === 'number' ? r.analysis.score : 75);
                return (
                  <Link to={`/report/${r._id}`} state={{ fromBatch: id }} key={r._id} className="block group">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:border-prism-accent/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:-translate-y-1 h-full"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-prism-cyan" />
                          <Badge variant="outline" className="text-[10px] bg-prism-text-primary/5 text-prism-text-primary/70 border-prism-text-primary/10">
                            {r.sourceType?.toUpperCase()}
                          </Badge>
                        </div>
                        <div className={`text-sm font-bold ${docScore >= 80 ? 'text-emerald-400' : docScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {docScore}%
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-prism-text-primary/90 font-medium line-clamp-2 mb-2 group-hover:text-prism-cyan transition-colors">
                          {r.metadata?.file?.originalname || r.metadata?.urlMetadata?.title || r.originalInput || r.metadata?.url || 'Unnamed Document'}
                        </h4>
                        <p className="text-xs text-prism-text-primary/50 line-clamp-2">
                          {r.analysis?.executiveBriefing?.summary || r.analysis?.articleContext?.oneSentenceSummary || r.analysis?.overallSummary || 'No summary available.'}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        )}
    </div>
  );
};
