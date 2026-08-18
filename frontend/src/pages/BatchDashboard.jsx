import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share, Download, ChevronLeft, Layers } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { historyApi } from '../services/api/history.api';
import { CredibilityGauge } from '../components/report/CredibilityGauge';
import { ContradictionGraph } from '../components/report/ContradictionGraph';
import { ClaimCard } from '../components/report/ClaimCard';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { useCinematicStore } from '../store/cinematicStore';

// Utility to get glow color based on score
const getScoreGlow = (score) => {
  if (score >= 80) return 'rgba(34, 211, 238, 0.15)'; // Cyan
  if (score >= 50) return 'rgba(250, 204, 21, 0.15)'; // Yellow
  return 'rgba(239, 68, 68, 0.15)'; // Red
};

export const BatchDashboard = () => {
  const { id } = useParams();
  const setEnvironmentWorkspace = useCinematicStore((state) => state.setEnvironmentWorkspace);
  const setPrismPosition = useCinematicStore((state) => state.setPrismPosition);

  useEffect(() => {
    // Report environment: Prism is in the background, subtly glowing
    setEnvironmentWorkspace();
    setPrismPosition([4, -2, -5]);
  }, [setEnvironmentWorkspace, setPrismPosition]);

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['batch', id],
    queryFn: () => historyApi.getBatchReportById(id),
  });

  const report = response?.data?.analysis; // AI synthesis of batch
  const metadata = response?.data?.metadata || {}; // Make sure this is captured for safely extracting batch numbers

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

  if (isError || !response?.data) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <div className="text-red-500 font-semibold text-xl">Failed to load batch report</div>
        <p className="text-prism-text-secondary">{error?.message || "Batch report could not be found."}</p>
        <Link to="/">
          <Button variant="outline">Return to Workspace</Button>
        </Link>
      </div>
    );
  }

  const batchData = response.data;
  const analysis = batchData.analysis || {};

  // Map backend schema to what the UI components expect
  const score = analysis.sourceComparisons?.consistencyScore || 0;
  const verdict = analysis.overallCredibility || "Unknown";
  const summary = analysis.overallSummary || "No summary available.";
  const filesAnalyzed = (metadata.batch?.fileCount || 0) - (batchData.failedFiles?.length || 0);
  const filesFailed = batchData.failedFiles?.length || 0;

  // Map corroborated claims
  const corroboratedClaims = (analysis.corroboratedClaims || []).map(c => ({
    claim: c.claim,
    status: "corroborated",
    confidence: 90 // Mocked confidence for batch currently, could be added to backend later
  }));

  // Map contradictions
  const contradictions = (analysis.contradictoryClaims || []).map((c, i) => ({
    sourceA: { name: `Source 1`, claim: c.claim },
    sourceB: { name: `Source 2`, claim: "Conflicting evidence" },
    synthesis: c.conflict
  }));

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
        className="flex items-center justify-between mb-12"
      >
        <Link to="/" className="flex items-center text-prism-text-secondary hover:text-white transition-colors group">
          <ChevronLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="tracking-wide uppercase text-sm font-medium">Intelligence Workspace</span>
        </Link>
        <div className="flex items-center gap-4">
          <Badge variant="accent" className="hidden md:flex gap-1.5 px-3 py-1">
            <Layers size={14} /> Batch Synthesis
          </Badge>
          <Button variant="ghost" size="icon" className="hover:bg-white/10"><Share size={18} /></Button>
          <Button variant="outline" size="sm" className="gap-2 border-white/20 hover:bg-white/5">
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
          className="col-span-1 glass-panel rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden border-t border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent z-0 pointer-events-none" />
          <div className="relative z-10 w-full flex flex-col items-center">
            <CredibilityGauge score={score} size={220} strokeWidth={14} />
            <div className="mt-8 text-center w-full">
              <Badge variant={score >= 80 ? 'success' : score >= 50 ? 'warning' : 'danger'} className="text-sm px-4 py-1.5 mb-4 tracking-widest uppercase">
                {verdict}
              </Badge>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-center gap-4 w-full text-xs text-prism-text-muted uppercase tracking-wider">
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
          className="col-span-1 lg:col-span-2 glass-panel-strong rounded-3xl p-10 flex flex-col justify-center border-t border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-prism-accent/5 rounded-full blur-[80px] pointer-events-none" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-prism-accent mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-prism-accent/50" /> Batch Synthesis
          </h2>
          <p className="text-3xl font-light leading-relaxed text-white">
            {summary}
          </p>
        </motion.div>
      </div>

      {/* Deep Dive Grid */}
      <div className="flex flex-col gap-16">
        
        {/* Contradictions Section */}
        {contradictions.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-2xl font-light tracking-wide text-white mb-8 flex items-center gap-4">
              Contradiction Matrix
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </h3>
            <ContradictionGraph contradictions={contradictions} />
          </motion.section>
        )}

        {/* Corroborated Claims Section */}
        {corroboratedClaims.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h3 className="text-2xl font-light tracking-wide text-white mb-8 flex items-center gap-4">
              Corroborated Facts
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {corroboratedClaims.map((claim, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <ClaimCard {...claim} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

      </div>
    </div>
  );
};
