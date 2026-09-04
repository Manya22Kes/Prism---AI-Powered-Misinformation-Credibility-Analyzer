import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share, Download, ChevronLeft, Check, Terminal, X,
  Globe, AlertCircle, Sparkles, Brain, Lightbulb, Search,
  CheckCircle2, AlertTriangle, Clock, BookOpen, User, FileText,
  Pin, RefreshCw, Bookmark, ShieldCheck, Copy
} from 'lucide-react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { historyApi } from '../services/api/history.api';
import { analysisApi } from '../services/api/analysis.api';
import { activityApi } from '../services/api/activity.api';
import { CredibilityGauge } from '../components/report/CredibilityGauge';
import { FindingCard } from '../components/report/FindingCard';
import { RiskIndicator } from '../components/report/RiskIndicator';
import { FramingBadge } from '../components/report/FramingBadge';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { CollectionSelector } from '../components/report/CollectionSelector';
import { EmptyState } from '../components/shared/EmptyState';
import { useCinematicStore } from '../store/cinematicStore';
import { useExperienceStore } from '../store/experienceStore';
import { useSettingsStore } from '../store/settingsStore';
import { useThemeStore } from '../store/themeStore';
import toast from 'react-hot-toast';
import { generatePDF } from '../utils/pdfExport';
import { cn } from '../utils/cn';

const getScoreGlow = (score) => {
  if (score >= 80) return 'rgba(34, 211, 238, 0.15)';
  if (score >= 50) return 'rgba(250, 204, 21, 0.15)';
  return 'rgba(239, 68, 68, 0.15)';
};

export const ReportView = () => {
  const { id } = useParams();
  const location = useLocation();

  const fromWorkspace = location.state?.fromWorkspace || location.state?.from === 'workspace';
  const fromBatch = location.state?.fromBatch || location.state?.batchId;
  const fromActivity = location.state?.fromActivity || location.state?.from === 'activity';
  const fromSaved = location.state?.fromSaved || location.state?.from === 'saved';
  const fromCollection = location.state?.collectionId;

  const backTarget = fromWorkspace
    ? '/'
    : (fromBatch
        ? `/batch/${fromBatch}`
        : (fromCollection
            ? `/collection/${fromCollection}`
            : (fromSaved
                ? '/saved'
                : (fromActivity
                    ? '/activity'
                    : '/archive'))));

  const backLabel = fromWorkspace
    ? 'Workspace'
    : (fromBatch
        ? 'Batch Synthesis'
        : (fromCollection
            ? 'Collection'
            : (fromSaved
                ? 'Saved Reports'
                : (fromActivity
                    ? 'Recent Activity'
                    : 'Archive'))));

  const setEnvironmentWorkspace = useCinematicStore((state) => state.setEnvironmentWorkspace);
  const setPrismPosition = useCinematicStore((state) => state.setPrismPosition);
  const emitExperienceEvent = useExperienceStore((state) => state.emitExperienceEvent);
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  const [copied, setCopied] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [reanalyzeError, setReanalyzeError] = useState(null);
  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const setEnvironmentProcessing = useCinematicStore((state) => state.setEnvironmentProcessing);
  
  const isReadingMode = useExperienceStore((state) => state.isReadingMode);
  const enterReadingMode = useExperienceStore((state) => state.enterReadingMode);
  const exitReadingMode = useExperienceStore((state) => state.exitReadingMode);
  const reducedMotion = useSettingsStore((state) => state.settings.reducedMotion);

  useEffect(() => {
    setEnvironmentWorkspace();
    setPrismPosition([4, -2, -5]);
    emitExperienceEvent('REPORT_OPENED');
    return () => { emitExperienceEvent('REPORT_CLOSED'); };
  }, [setEnvironmentWorkspace, setPrismPosition, emitExperienceEvent]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isReadingMode) {
        exitReadingMode(reducedMotion);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReadingMode, reducedMotion, exitReadingMode]);

  useEffect(() => {
    return () => {
      if (useExperienceStore.getState().isReadingMode) {
        useExperienceStore.getState().exitReadingMode(true);
      }
    };
  }, []);

  const handleShare = () => {
    if (navigator.clipboard) {
      const shareUrl = `${window.location.origin}/report/${id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Report link copied', {
        style: {
          background: '#1E1E1E',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['report', id],
    queryFn: () => historyApi.getReportById(id),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  const handleExportPDF = async () => { 
    if (!response?.data) return;
    const reportDocToExport = response?.data?.data || response?.data;
    try {
      setIsExporting(true);
      await generatePDF(reportDocToExport);
      activityApi.logExport(id).catch(console.error); // Observational
    } catch (err) {
      console.error('Failed to export PDF:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const pinMutation = useMutation({
    mutationFn: () => historyApi.togglePin(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['report', id] });
      const previousData = queryClient.getQueryData(['report', id]);
      
      queryClient.setQueryData(['report', id], (old) => {
        if (!old?.data?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...old.data.data,
              isPinned: !old.data.data.isPinned
            }
          }
        };
      });
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['report', id], context.previousData);
      toast.error('Failed to update pin status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['report', id] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
    onSuccess: () => {
      toast.success('Pin status updated');
    }
  });

  const handleReanalyze = async () => {
    if (isReanalyzing) return;
    setIsReanalyzing(true);
    setReanalyzeError(null);
    
    // Switch cinematic environment
    emitExperienceEvent('ANALYSIS_STARTED', { workloadIntensity: 4 });
    setPrismPosition([0, 0, 0]);
    setEnvironmentProcessing();
    
    try {
      await analysisApi.reanalyze(id, (event) => {
        if (event.failoverNotice) {
          const isLight = theme === 'light';

          toast(
            (t) => (
              <div className="flex items-start gap-2.5 py-0.5 max-w-full">
                <div className={cn("text-base leading-none mt-0.5", isLight ? "text-blue-400" : "text-amber-400")}>⚡</div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-xs font-semibold font-mono tracking-wide uppercase", isLight ? "text-blue-300" : "text-amber-300")}>
                    {event.failoverNotice.type === 'model_failover' ? 'Model Auto-Failover' : 'Traffic Spike Detected'}
                  </p>
                  <p className="text-[11px] text-slate-200 mt-1 leading-snug break-words">
                    {event.failoverNotice.message}
                  </p>
                  {event.failoverNotice.fromModel && event.failoverNotice.toModel && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] font-mono">
                      <span className={cn("px-1.5 py-0.5 rounded line-through", isLight ? "bg-slate-800 text-slate-400 border border-slate-700" : "bg-black/50 text-amber-300/70")}>
                        {event.failoverNotice.fromModel}
                      </span>
                      <span className={isLight ? "text-blue-400 font-bold" : "text-amber-400 font-bold"}>→</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                        {event.failoverNotice.toModel} (Active)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ),
            {
              id: 'gemini-failover-toast',
              duration: 7000,
              style: {
                background: isLight ? 'rgba(9, 21, 43, 0.98)' : 'rgba(15, 23, 42, 0.95)',
                border: isLight ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                boxShadow: isLight 
                  ? '0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 20px rgba(37, 99, 235, 0.3)' 
                  : '0 10px 30px -5px rgba(0, 0, 0, 0.6), 0 0 20px rgba(245, 158, 11, 0.25)',
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                color: '#fff',
                padding: '12px 16px',
                maxWidth: 'calc(100vw - 32px)',
                margin: '0 auto',
              },
            }
          );
        }

        if (event.stage === 'error') {
          setReanalyzeError(event.message || 'An error occurred during re-analysis.');
          emitExperienceEvent('ANALYSIS_FAILED', { error: event.message });
          setIsReanalyzing(false);
          setEnvironmentWorkspace();
          setPrismPosition([4, -2, -5]);
        } else if (event.stage === 'complete') {
          emitExperienceEvent('ANALYSIS_COMPLETED');
          setIsReanalyzing(false);
          // Invalidate history to reflect new report in Archive
          queryClient.invalidateQueries({ queryKey: ['history'] });
          navigate(`/report/${event.reportId}`);
        } else if (event.stage) {
          emitExperienceEvent('ANALYSIS_STAGE_CHANGED', { stage: event.stage });
        }
      });
    } catch (err) {
      console.error("REANALYZE ERROR:", err);
      setReanalyzeError(err.message || 'Failed to connect to intelligence engine.');
      emitExperienceEvent('ANALYSIS_FAILED', { error: err.message });
      setIsReanalyzing(false);
      setEnvironmentWorkspace();
      setPrismPosition([4, -2, -5]);
    }
  };

  const rawDoc = response?.data?.data || response?.data || response;
  const reportDoc = rawDoc?._id ? rawDoc : null;

  useEffect(() => {
    if (response?.isBatch || rawDoc?.isBatch || rawDoc?.batchName || (Array.isArray(rawDoc?.reports) && rawDoc?.reports.length > 0)) {
      navigate(`/batch/${id}`, { replace: true });
    }
  }, [response, rawDoc, id, navigate]);

  const analysis = reportDoc?.analysis || {};

  const score = typeof analysis.credibility?.score === 'number'
    ? analysis.credibility.score
    : typeof analysis.score === 'number' ? analysis.score : 75;
  const verdict = analysis.overallVerdict?.label || analysis.verdict || 'Unverified';
  const summary = analysis.summary || analysis.executiveBriefing?.conclusion || 'Analysis summary processed.';

  // v4.0 Claim-Centric Data Architecture fields
  const claimInvestigations = Array.isArray(analysis.claimInvestigations) && analysis.claimInvestigations.length > 0
    ? analysis.claimInvestigations
    : (Array.isArray(analysis.analyticalFindings) && analysis.analyticalFindings.length > 0
        ? analysis.analyticalFindings
        : (Array.isArray(analysis.claims) ? analysis.claims : []));

  const articleContext = analysis.articleContext || analysis.articleIntelligence || {};

  const risks = Array.isArray(analysis.riskIndicators) ? analysis.riskIndicators
    : Array.isArray(analysis.risks) ? analysis.risks : [];

  const dimensionScores = analysis.dimensionScores || {};
  const sourceIntel = analysis.sourceIntelligence || {};
  const briefing = analysis.executiveBriefing || {};
  const bias = analysis.bias || {};
  const emotionalManipulation = analysis.emotionalManipulation || {};
  
  const biasAndFraming = analysis.biasAndFraming || {};
  
  const biasIndicators = Array.isArray(biasAndFraming.biasIndicators) && biasAndFraming.biasIndicators.length > 0 
    ? biasAndFraming.biasIndicators 
    : (Array.isArray(bias.detectedBiases) ? bias.detectedBiases : []);

  const framingIndicators = Array.isArray(biasAndFraming.framingIndicators) && biasAndFraming.framingIndicators.length > 0
    ? biasAndFraming.framingIndicators
    : (Array.isArray(emotionalManipulation.detectedTechniques) ? emotionalManipulation.detectedTechniques : []);

  const biasLevel = typeof biasAndFraming.biasLevel === "number" ? biasAndFraming.biasLevel : (bias?.score ?? 30);
  const emotionalManipulationLevel = typeof biasAndFraming.emotionalManipulationLevel === "number" ? biasAndFraming.emotionalManipulationLevel : (emotionalManipulation?.score ?? 20);

  const rawAiOutput = analysis;

  // Context Badges
  const detectedIntent = articleContext.contentType || articleContext.detectedIntent || 'Research Reporting';
  const authorPosition = articleContext.authorStance || articleContext.authorPosition || 'Neutral';
  const primaryTopic = articleContext.primaryTopic || 'General Science';
  const readingTime = articleContext.readingTimeMinutes || 6;

  // Trust Drivers
  const trustDrivers = Array.isArray(briefing.trustDrivers) && briefing.trustDrivers.length > 0
    ? briefing.trustDrivers
    : (Array.isArray(briefing.strongestEvidence) && briefing.strongestEvidence.length > 0
        ? briefing.strongestEvidence
        : ["Published by a recognized source", "References academic researchers", "Cites documented cases"]);

  const cautiousDrivers = Array.isArray(briefing.cautiousDrivers) && briefing.cautiousDrivers.length > 0
    ? briefing.cautiousDrivers
    : (Array.isArray(briefing.mainCredibilityRisks) && briefing.mainCredibilityRisks.length > 0
        ? briefing.mainCredibilityRisks
        : ["Heavy reliance on anecdotal accounts", "Lack of experimental replication"]);

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

  if (isError || !reportDoc) {
    return (
      <div className="flex h-[80vh] items-center justify-center py-20 max-w-2xl mx-auto flex-col gap-4">
        <EmptyState 
          icon={AlertTriangle}
          title="Failed to load report"
          description={error?.message || "Report could not be found or loaded from database."}
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

  const scoreGlow = getScoreGlow(score);

  return (
    <div className={cn(
      "relative mx-auto pb-20 pt-4 sm:pt-6 transition-all duration-700 ease-in-out space-y-6 sm:space-y-8 w-full min-w-0 px-0.5 sm:px-0",
      isReadingMode ? "max-w-4xl" : "max-w-6xl"
    )}>

      {/* Background Glow */}
      <motion.div
        className="fixed inset-0 z-[-1] pointer-events-none transition-opacity duration-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: isReadingMode ? 0.3 : 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{ background: `radial-gradient(circle at 50% -20%, ${scoreGlow}, transparent 70%)` }}
      />

      {/* Reading Mode Active Focus Banner */}
      {isReadingMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-mono shadow-[0_0_25px_rgba(34,211,238,0.15)] w-full"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)] shrink-0" />
            <span className="tracking-wide">
              READING MODE ACTIVE<span className="hidden sm:inline"> &mdash; Environmental distractions minimized</span>
            </span>
          </div>
          <button 
            onClick={() => exitReadingMode(reducedMotion)}
            className="hover:underline text-cyan-400 hover:text-cyan-300 font-sans text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-end sm:self-auto py-1 px-2.5 rounded-lg bg-cyan-500/15 sm:bg-transparent"
          >
            <span>Exit (ESC)</span>
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* Navigation Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 w-full min-w-0"
      >
        <Link 
          to={backTarget} 
          className="flex items-center text-prism-text-secondary hover:text-prism-text-primary transition-colors group shrink-0"
        >
          <ChevronLeft size={20} className="mr-1.5 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="tracking-wide uppercase text-xs sm:text-sm font-medium">
            {backLabel}
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 w-full sm:w-auto">
          {/* Reading Mode Toggle Button */}
          <Button 
            variant={isReadingMode ? "primary" : "ghost"}
            size="sm" 
            onClick={() => {
              if (isReadingMode) {
                exitReadingMode(reducedMotion);
              } else {
                enterReadingMode(reducedMotion);
              }
            }}
            aria-label={isReadingMode ? "Exit Reading Mode (Press Escape)" : "Enter Focused Reading Mode"}
            className={cn(
              "gap-2 text-xs transition-all min-h-[36px] cursor-pointer",
              isReadingMode 
                ? "bg-cyan-400 text-slate-950 font-semibold shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:bg-cyan-300 border-cyan-400" 
                : "text-prism-text-secondary hover:text-prism-text-primary border border-prism-text-primary/10"
            )}
          >
            <BookOpen size={16} />
            <span>{isReadingMode ? "Exit Reading Mode" : "Reading Mode"}</span>
            {isReadingMode && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-slate-950 font-bold ml-1">
                ESC
              </span>
            )}
          </Button>

          <div title={!['text', 'url'].includes(reportDoc?.sourceType) ? "This report cannot be re-analyzed because the original file is not stored. Upload the file again to analyze it." : ""}>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => handleReanalyze(reportDoc?.sourceType)}
              disabled={isReanalyzing || !['text', 'url'].includes(reportDoc?.sourceType)}
              className="gap-2 text-xs font-semibold bg-prism-accent text-prism-text-primary shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] border-prism-text-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} className={isReanalyzing ? "animate-spin" : ""} />
              {isReanalyzing ? "RETRYING..." : "Re-analyze"}
            </Button>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => pinMutation.mutate()}
            disabled={pinMutation.isLoading}
            className={`gap-2 text-xs ${reportDoc?.isPinned ? "text-prism-accent" : "text-prism-text-secondary hover:text-prism-text-primary"}`}
          >
            <Pin size={16} className={reportDoc?.isPinned ? "fill-prism-accent" : ""} />
            <span>{reportDoc?.isPinned ? "Pinned" : "Pin"}</span>
          </Button>

          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsSaveMenuOpen(!isSaveMenuOpen)}
              className={`gap-2 text-xs ${reportDoc?.isSaved ? "text-prism-cyan" : "text-prism-text-secondary hover:text-prism-text-primary"}`}
            >
              <Bookmark size={16} className={reportDoc?.isSaved ? "fill-prism-cyan" : ""} />
              <span>{reportDoc?.isSaved ? "Saved" : "Save"}</span>
            </Button>
            <AnimatePresence>
              {isSaveMenuOpen && (
                <CollectionSelector 
                  reportId={id} 
                  isSaved={reportDoc?.isSaved} 
                  onClose={() => setIsSaveMenuOpen(false)} 
                />
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="ghost" 
            size="sm" 
            onClick={() => setDebugOpen(true)}
            className={cn(
              "gap-1.5 sm:gap-2 text-xs font-mono border transition-colors",
              isLight 
                ? "text-cyan-800 hover:bg-cyan-100/60 bg-cyan-50/80 border-cyan-300 shadow-xs" 
                : "text-cyan-400 hover:bg-cyan-950/40 border-cyan-500/20"
            )}
          >
            <Terminal size={14} className={isLight ? "text-cyan-700" : "text-cyan-400"} /> Deep Analysis
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2 hover:bg-prism-text-primary/10 text-xs">
            {copied ? <Check size={16} className="text-emerald-400" /> : <Share size={16} />}
            <span>{copied ? "Link Copied!" : "Share"}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF} 
            disabled={isExporting}
            className="gap-2 border-prism-text-primary/20 hover:bg-prism-text-primary/5 text-xs"
          >
            {isExporting ? (
              <span className="flex h-4 w-4 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prism-cyan opacity-40"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-prism-cyan"></span>
              </span>
            ) : (
              <Download size={16} />
            )}
            <span>{isExporting ? "Exporting..." : "Export PDF"}</span>
          </Button>
        </div>
      </motion.div>

      {/* Re-analysis Error Alert Banner */}
      {reanalyzeError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-red-400 text-xs"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0" />
            <span>Re-analysis failed: {reanalyzeError}</span>
          </div>
          {['text', 'url'].includes(reportDoc?.sourceType) && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleReanalyze(reportDoc?.sourceType)}
              disabled={isReanalyzing}
              className="bg-red-500 hover:bg-red-600 text-white border-none shrink-0 gap-2 text-xs font-semibold"
            >
              <RefreshCw size={14} className={isReanalyzing ? "animate-spin" : ""} />
              {isReanalyzing ? "RETRYING..." : "Retry Analysis"}
            </Button>
          )}
        </motion.div>
      )}

      {/* Non-persistent File Notice */}
      {!['text', 'url'].includes(reportDoc?.sourceType) && (
        <div className="bg-prism-surface border border-prism-border rounded-2xl p-3 px-4 text-xs text-prism-text-muted flex items-center justify-between">
          <span>This report cannot be re-analyzed because the original file is not stored. Upload the file again to analyze it.</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-prism-text-secondary opacity-60">FILE SOURCE</span>
        </div>
      )}


      {/* ═════════════════════════════════════════════════════════════════════
          SECTION 1: CAN I TRUST THIS? (INSTANT HERO LAYER — 5 to 10 SECONDS)
         ═════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Tile 1: Score & Verdict */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-4 glass-panel rounded-3xl p-5 flex flex-col items-center justify-center relative overflow-hidden border-t border-prism-text-primary/10 text-center"
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400 font-bold mb-3 flex items-center gap-1.5 justify-center">
            <ShieldCheck size={14} className="text-cyan-500 dark:text-cyan-400" /> Credibility Score
          </span>
          <CredibilityGauge score={score} size={170} strokeWidth={12} />
          <Badge
            variant={score >= 80 ? 'success' : score >= 50 ? 'warning' : 'danger'}
            className="text-xs px-4 py-1 mt-4 mb-2 tracking-widest uppercase font-semibold"
          >
            {verdict}
          </Badge>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-1 rounded-full bg-cyan-500/10 dark:bg-cyan-950/30 border border-cyan-500/25 text-[11px] font-mono">
            <span className="text-prism-text-secondary">System Confidence:</span>
            <span className="font-bold text-cyan-700 dark:text-cyan-300">{briefing.confidence || 85}%</span>
          </div>
        </motion.div>

        {/* Tile 2: What is this article? Context Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-4 glass-panel-blue rounded-3xl p-5 flex flex-col justify-between border-t border-prism-text-primary/10 space-y-4"
        >
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 block mb-3">
              What Is This Article?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/[0.03] border border-prism-text-primary/8 p-3 rounded-xl">
                <span className="text-[10px] font-mono uppercase text-prism-text-primary/40 block mb-1 flex items-center gap-1">
                  <FileText size={10} /> Type
                </span>
                <span className="text-xs font-semibold text-prism-text-primary truncate block">{detectedIntent}</span>
              </div>
              <div className="bg-white/[0.03] border border-prism-text-primary/8 p-3 rounded-xl">
                <span className="text-[10px] font-mono uppercase text-prism-text-primary/40 block mb-1 flex items-center gap-1">
                  <BookOpen size={10} /> Topic
                </span>
                <span className="text-xs font-semibold text-prism-text-primary truncate block">{primaryTopic}</span>
              </div>
              <div className="bg-white/[0.03] border border-prism-text-primary/8 p-3 rounded-xl">
                <span className="text-[10px] font-mono uppercase text-prism-text-primary/40 block mb-1 flex items-center gap-1">
                  <User size={10} /> Author Stance
                </span>
                <span className="text-xs font-semibold text-cyan-300 truncate block">{authorPosition}</span>
              </div>
              <div className="bg-white/[0.03] border border-prism-text-primary/8 p-3 rounded-xl">
                <span className="text-[10px] font-mono uppercase text-prism-text-primary/40 block mb-1 flex items-center gap-1">
                  <Clock size={10} /> Read Time
                </span>
                <span className="text-xs font-semibold text-prism-text-primary block">{readingTime} min read</span>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-prism-text-primary/5 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-prism-text-primary/40 block mb-1">
              One-Sentence Takeaway
            </span>
            <p className="text-xs text-prism-text-primary/80 leading-relaxed font-medium">
              "{summary}"
            </p>
          </div>
        </motion.div>

        {/* Tile 3: Why this score? Dimension Ratings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="lg:col-span-4 glass-panel rounded-3xl p-5 flex flex-col justify-between border-t border-prism-text-primary/10 space-y-3"
        >
          <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-prism-accent flex items-center gap-1.5 font-bold">
            <Sparkles size={12} className="text-prism-accent" /> Why This Score?
          </h4>

          <div className="space-y-4">
            <div className="space-y-3">
              <h5 className="text-[9px] uppercase font-mono text-cyan-600 dark:text-cyan-400 tracking-[0.16em] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" /> Core Credibility Dimensions
              </h5>
              {[
                { label: "Evidence Quality", val: dimensionScores.evidenceQuality?.score ?? 0, exp: dimensionScores.evidenceQuality?.explanation ?? "Not assessed." },
                { label: "Source Reliability", val: dimensionScores.sourceReliability?.score ?? 0, exp: dimensionScores.sourceReliability?.explanation ?? "Not assessed." },
                { label: "Logical Consistency", val: dimensionScores.logicalConsistency?.score ?? 0, exp: dimensionScores.logicalConsistency?.explanation ?? "Not assessed." },
                { label: "Scientific Consensus", val: dimensionScores.scientificConsensus?.score ?? 0, exp: dimensionScores.scientificConsensus?.explanation ?? "Not assessed." }
              ].map((dim, i) => {
                const qualityLabel = dim.val >= 80 ? 'Strong' : dim.val >= 60 ? 'Moderate' : dim.val >= 40 ? 'Weak' : 'Poor';
                const colorClass = dim.val >= 75 
                  ? 'text-cyan-600 dark:text-cyan-400' 
                  : dim.val >= 55 
                    ? 'text-amber-600 dark:text-amber-400' 
                    : 'text-rose-600 dark:text-rose-400';
                const barClass = dim.val >= 75 
                  ? 'bg-cyan-400' 
                  : dim.val >= 55 
                    ? 'bg-amber-400' 
                    : 'bg-rose-400';

                return (
                  <div key={`core-${i}`} className="space-y-1.5 group relative">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className={`cursor-help font-medium ${colorClass} border-b border-dotted hover:opacity-80 transition-opacity`} title={dim.exp}>
                        {dim.label}
                      </span>
                      <span className={`font-semibold ${colorClass}`}>
                        {dim.val}% <span className="opacity-75 font-normal text-[10px]">({qualityLabel})</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-prism-text-primary/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${barClass}`}
                        style={{ width: `${dim.val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="space-y-3 pt-3 border-t border-prism-text-primary/10">
              <h5 className="text-[9px] uppercase font-mono text-purple-600 dark:text-purple-400 tracking-[0.16em] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" /> Contextual Presentation Signals
              </h5>
              {[
                { 
                  label: "Bias Neutrality", 
                  val: 100 - (analysis.biasAndFraming?.biasLevel ?? 100), 
                  exp: "Measures neutral framing vs ideological framing. Does not inflate credibility.",
                  textColor: "text-blue-600 dark:text-blue-400",
                  barColor: "bg-gradient-to-r from-blue-600 to-sky-400 dark:from-blue-500 dark:to-sky-300"
                },
                { 
                  label: "Calmness", 
                  val: 100 - (analysis.biasAndFraming?.emotionalManipulationLevel ?? 100), 
                  exp: "Measures absence of rhetorical/emotional triggers. Does not inflate credibility.",
                  textColor: "text-teal-600 dark:text-teal-400",
                  barColor: "bg-gradient-to-r from-teal-600 to-emerald-400 dark:from-teal-500 dark:to-emerald-300"
                }
              ].map((dim, i) => {
                return (
                  <div key={`context-${i}`} className="space-y-1.5 group relative">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className={`cursor-help font-medium ${dim.textColor} border-b border-dotted hover:opacity-80 transition-opacity`} title={dim.exp}>
                        {dim.label}
                      </span>
                      <span className={`font-semibold ${dim.textColor}`}>{dim.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-prism-text-primary/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${dim.barColor}`}
                        style={{ width: `${dim.val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

      </div>


      {/* ═════════════════════════════════════════════════════════════════════
          SECTION 2: TRUST DRIVERS (CONVERSATIONAL WHY TRUSTED VS WHY CAUTIOUS)
         ═════════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {/* Why Prism trusts this article */}
        <div className="glass-panel rounded-3xl p-5 border-t border-emerald-500/20 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-[0.16em] text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={16} /> Why Prism Trusts This Article
          </h3>
          <ul className="space-y-2">
            {trustDrivers.map((item, i) => {
              const text = item.replace(/^[✓⚠]\s*/, '');
              return (
                <li key={i} className="text-xs text-prism-text-primary/85 flex items-start gap-2.5 bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 p-3 rounded-xl">
                  <span className="text-emerald-500 dark:text-emerald-400 font-bold mt-0.5">✓</span>
                  <span className="leading-relaxed">{text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Why Prism is cautious */}
        <div className="glass-panel rounded-3xl p-5 border-t border-amber-500/20 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-[0.16em] text-amber-400 flex items-center gap-2">
            <AlertTriangle size={16} /> Why Prism Is Cautious
          </h3>
          <ul className="space-y-2">
            {cautiousDrivers.map((item, i) => {
              const text = item.replace(/^[✓⚠]\s*/, '');
              return (
                <li key={i} className="text-xs text-prism-text-primary/85 flex items-start gap-2.5 bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 p-3 rounded-xl">
                  <span className="text-amber-500 dark:text-amber-400 font-bold mt-0.5">⚠</span>
                  <span className="leading-relaxed">{text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.section>

      {/* ═════════════════════════════════════════════════════════════════════
          SECTION 4: WHAT DOES THE ARTICLE ACTUALLY CLAIM? (MAJOR CLAIMS)
         ═════════════════════════════════════════════════════════════════════ */}
      {claimInvestigations.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-prism-text-primary/10 pb-4 gap-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h3 className="text-lg sm:text-xl font-light tracking-wide text-prism-text-primary flex items-center gap-2.5">
                <Search size={20} className="text-prism-accent" /> Claims Investigated
              </h3>
              <span className="text-[11px] sm:text-xs font-mono font-medium px-2.5 sm:px-3 py-1 rounded-full bg-prism-surface-active text-prism-accent border border-prism-accent/20">
                {claimInvestigations.length} CLAIMS CHECKED
              </span>
            </div>
            <div className="relative inline-flex items-center gap-2.5 px-4 py-1.5 bg-prism-accent/10 border-y border-prism-accent/40 text-[11px] sm:text-xs font-mono font-medium text-prism-accent tracking-wide shadow-[0_0_15px_rgba(99,102,241,0.12)]">
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-prism-accent" />
              <span className="w-1.5 h-1.5 bg-prism-accent rotate-45 shrink-0 animate-pulse" />
              <span>Click &quot;Investigate&quot; on any claim to explore details</span>
              <span className="absolute right-0 top-0 bottom-0 w-1 bg-prism-accent" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {claimInvestigations.map((finding, idx) => (
              <motion.div
                key={finding.claimId || idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <FindingCard {...finding} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}


      {/* ═════════════════════════════════════════════════════════════════════
          SECTION 5: WHAT SHOULD I BE CAREFUL ABOUT? (CREDIBILITY RISKS)
         ═════════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-5"
      >
        <div className="flex items-center justify-between border-b border-prism-text-primary/10 pb-4">
          <h3 className="text-xl font-light tracking-wide text-prism-text-primary flex items-center gap-2.5">
            <AlertCircle size={22} className={risks.length > 0 ? "text-rose-400" : "text-emerald-400"} /> 
            Credibility Risks & Anomalies
          </h3>
          <span className={`text-xs font-mono px-3 py-1 rounded-full border ${
            risks.length > 0 
              ? "text-rose-600 dark:text-rose-300 bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/20" 
              : "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/20 font-semibold"
          }`}>
            {risks.length > 0 ? `${risks.length} DETECTED` : "CLEAR"}
          </span>
        </div>

        {risks.length === 0 ? (
          <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl text-emerald-900 dark:text-emerald-100">
            <ShieldCheck size={24} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold text-sm">{(analysis.riskSummary && analysis.riskSummary.message) || "No significant credibility anomalies detected."}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {risks.map((risk, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <RiskIndicator {...risk} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>


      {/* ═════════════════════════════════════════════════════════════════════
          SECTION 6: BIAS & FRAMING MATRIX
         ═════════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel rounded-3xl p-6 border-t border-prism-text-primary/10 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-prism-text-primary/10 pb-4">
          <h3 className="text-lg font-light tracking-wide text-prism-text-primary flex items-center gap-2.5">
            <Brain size={20} className="text-amber-400" /> Bias & Framing Analysis
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-amber-600 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/20 px-3 py-1 rounded-full">
              Bias Level: {biasLevel}%
            </span>
            <span className="text-xs font-mono text-rose-600 dark:text-rose-300 bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/20 px-3 py-1 rounded-full">
              Manipulation: {emotionalManipulationLevel}%
            </span>
          </div>
        </div>

        {(biasIndicators.length === 0 && framingIndicators.length === 0) ? (
          <div className="flex items-center gap-4 bg-white/[0.03] border border-prism-text-primary/10 p-5 rounded-xl text-prism-text-primary/60">
            <Brain size={24} className="opacity-50 shrink-0" />
            <span className="font-medium text-sm">No significant bias or manipulative framing detected.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white/[0.02] border border-prism-text-primary/5 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Bias
              </h4>
              <div className="flex flex-col space-y-2">
                {biasIndicators.map((ind, idx) => (
                  <FramingBadge key={idx} indicator={ind} theme="amber" />
                ))}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-prism-text-primary/5 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Presentation & Framing
              </h4>
              <div className="flex flex-col space-y-2">
                {framingIndicators.map((ind, idx) => (
                  <FramingBadge key={idx} indicator={ind} theme="rose" />
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.section>


      {/* ═════════════════════════════════════════════════════════════════════
          SECTION 7: SOURCE INTELLIGENCE
         ═════════════════════════════════════════════════════════════════════ */}
      {sourceIntel && Object.keys(sourceIntel).length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel-blue rounded-2xl p-4 border-t border-prism-text-primary/10 space-y-3"
        >
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-prism-accent flex items-center gap-2">
            <Globe size={14} /> Source Intelligence & Citations
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { label: "Publisher", val: sourceIntel.publisher || "Not established", color: "text-prism-text-primary" },
              { label: "Source Type", val: sourceIntel.sourceType || sourceIntel.contentType || "Not established", color: "text-prism-text-primary" },
              { label: "Author", val: sourceIntel.author || "Not established", color: "text-prism-text-primary" },
              { label: "Date", val: sourceIntel.publicationDate || "Not established", color: "text-prism-text-primary" },
              { label: "Pri/Sec", val: sourceIntel.primaryVsSecondary || "Not established", color: "text-emerald-400" },
              { label: "Peer-Rev", val: Array.isArray(sourceIntel.peerReviewedSources) && sourceIntel.peerReviewedSources.length > 0 ? `${sourceIntel.peerReviewedSources.length} referenced` : "None detected", color: "text-purple-400" },
              { label: "Citations", val: sourceIntel.citationsPresent ? `${sourceIntel.citationsCount} detected` : (sourceIntel.externalCitationsCount ? `${sourceIntel.externalCitationsCount} detected` : "None detected"), color: "text-cyan-400" },
              { label: "Transparency", val: sourceIntel.reportingLevel || sourceIntel.originalReportingLevel || "Not established", color: "text-amber-300" },
            ].map((item, i) => {
              const displayVal = item.val === "Not established from available content." ? "Not established" : item.val;
              const isMissing = displayVal === "Not established";
              return (
                <div key={i} className="bg-white/[0.03] border border-prism-text-primary/10 p-3 rounded-lg flex flex-col justify-center min-h-[60px]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-prism-text-primary/50 block mb-1">{item.label}</span>
                  <span className={`text-[13px] font-medium truncate block ${isMissing ? 'text-prism-text-primary/30 italic font-normal' : item.color}`} title={displayVal}>
                    {displayVal}
                  </span>
                </div>
              );
            })}
          </div>

          {sourceIntel.evidenceProvenance && sourceIntel.evidenceProvenance !== "Not established from available content." && (
            <div className="bg-white/[0.03] border border-prism-text-primary/10 p-3 rounded-lg text-center mt-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-prism-text-primary/50 block mb-1">Evidence Provenance</span>
              <span className="text-[13px] font-medium text-prism-text-primary/80 block">{sourceIntel.evidenceProvenance}</span>
            </div>
          )}

          {(sourceIntel.primarySourcesReferenced?.length > 0 || sourceIntel.namedExperts?.length > 0 || sourceIntel.institutionsMentioned?.length > 0) && (
            <details className="group mt-3 bg-white/[0.02] border border-prism-text-primary/10 rounded-lg">
              <summary className="text-[11px] font-mono uppercase tracking-widest text-cyan-400/80 cursor-pointer hover:text-cyan-400 list-none flex items-center justify-center gap-2 p-3 select-none">
                <span className="group-open:hidden flex items-center gap-2">▼ Show Source Details</span>
                <span className="hidden group-open:flex items-center gap-2">▲ Hide Source Details</span>
              </summary>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 border-t border-prism-text-primary/10 text-[12px] text-prism-text-primary/80 text-left">
                {sourceIntel.primarySourcesReferenced?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400/50 block mb-2 uppercase tracking-widest border-b border-cyan-400/10 pb-1">Primary Sources</span>
                    <ul className="list-disc pl-4 space-y-1.5">
                      {sourceIntel.primarySourcesReferenced.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {sourceIntel.namedExperts?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400/50 block mb-2 uppercase tracking-widest border-b border-cyan-400/10 pb-1">Named Experts</span>
                    <ul className="list-disc pl-4 space-y-1.5">
                      {sourceIntel.namedExperts.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
                {sourceIntel.institutionsMentioned?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400/50 block mb-2 uppercase tracking-widest border-b border-cyan-400/10 pb-1">Institutions</span>
                    <ul className="list-disc pl-4 space-y-1.5">
                      {sourceIntel.institutionsMentioned.map((inst, i) => <li key={i}>{inst}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          )}
        </motion.section>
      )}


      {/* ═════════════════════════════════════════════════════════════════════
          SECTION 8: ACTIONABLE GUIDANCE
         ═════════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel rounded-2xl p-4 border-t border-prism-text-primary/10 space-y-3"
      >
        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2">
          <Lightbulb size={14} /> Next Steps
        </h3>
        <div className="space-y-2">
          {(Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0
            ? analysis.recommendations
            : [briefing.recommendation || "Cross-reference claims with primary academic registries and official publications."]
          ).map((rec, i) => {
            const text = rec.replace(/^[✓⚠]\s*/, '');
            return (
              <div key={i} className="flex items-start gap-3 bg-cyan-500/10 dark:bg-cyan-950/30 border border-cyan-500/20 p-4 rounded-xl text-sm text-prism-text-primary/90">
                <Check size={18} className="text-cyan-500 dark:text-cyan-400 mt-0.5 shrink-0" />
                <span>{text}</span>
              </div>
            );
          })}
        </div>
      </motion.section>


      {/* DEV MODE RAW AI OUTPUT DRAWER / DEEP ANALYSIS MODAL */}
      <AnimatePresence>
        {debugOpen && (
          <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md", isLight ? "bg-slate-900/40" : "bg-black/80")}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border",
                isLight 
                  ? "bg-white border-pink-200/80 shadow-[0_25px_60px_-15px_rgba(244,63,94,0.12)] text-slate-900" 
                  : "bg-neutral-950 border-prism-text-primary/20 text-prism-text-primary"
              )}
            >
              <div className={cn(
                "flex items-center justify-between px-5 sm:px-6 py-4 border-b",
                isLight ? "bg-pink-50/70 border-pink-200/60" : "bg-prism-text-primary/5 border-prism-text-primary/10"
              )}>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <Terminal size={18} className={isLight ? "text-cyan-600" : "text-cyan-400"} />
                  <h3 className={cn("font-mono text-xs sm:text-sm uppercase tracking-wider font-semibold", isLight ? "text-slate-800" : "text-prism-text-primary")}>
                    Deep Analysis: Raw AI Output
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(rawAiOutput, null, 2));
                      toast.success("JSON copied to clipboard");
                    }}
                    className={cn(
                      "px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer",
                      isLight 
                        ? "bg-white hover:bg-slate-50 text-slate-700 border-pink-200/80 shadow-xs" 
                        : "bg-white/5 hover:bg-white/10 text-prism-text-muted hover:text-white border-white/10"
                    )}
                    title="Copy JSON to clipboard"
                  >
                    <Copy size={13} />
                    <span className="hidden sm:inline">Copy JSON</span>
                  </button>
                  <button 
                    onClick={() => setDebugOpen(false)} 
                    className={cn(
                      "p-1.5 rounded-lg transition-colors cursor-pointer",
                      isLight ? "text-slate-500 hover:text-slate-800 hover:bg-pink-100/60" : "text-prism-text-primary/60 hover:text-prism-text-primary hover:bg-prism-text-primary/10"
                    )}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className={cn(
                "p-4 sm:p-6 overflow-y-auto font-mono text-xs leading-relaxed border-t",
                isLight 
                  ? "bg-[#0b101b] text-emerald-400 border-slate-800 selection:bg-emerald-500/30 selection:text-white" 
                  : "bg-black/90 text-emerald-400 border-white/5"
              )}>
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(rawAiOutput, null, 2)}</pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
