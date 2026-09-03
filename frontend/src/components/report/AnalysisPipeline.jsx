import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Activity, Search, ShieldCheck, Cpu, Database, Zap, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useExperienceStore } from '../../store/experienceStore';

const PIPELINE_NODES = [
  { id: 'input', label: 'INPUT INGESTION', icon: Database, stageMatch: ['extracting', 'analyzing', 'finalize', 'complete'] },
  { id: 'extraction', label: 'TEXT EXTRACTION', icon: Search, stageMatch: ['extracting', 'analyzing', 'finalize', 'complete'] },
  { id: 'claims', label: 'CLAIM DETECTION', icon: Cpu, stageMatch: ['analyzing', 'finalize', 'complete'] },
  { id: 'evidence', label: 'EVIDENCE RETRIEVAL', icon: Activity, stageMatch: ['analyzing', 'finalize', 'complete'] },
  { id: 'bias', label: 'BIAS & MANIPULATION', icon: Search, stageMatch: ['finalize', 'complete'] },
  { id: 'credibility', label: 'CREDIBILITY SCORING', icon: ShieldCheck, stageMatch: ['finalize', 'complete'] },
  { id: 'report', label: 'FINAL SYNTHESIS', icon: Database, stageMatch: ['complete'] }
];

const STAGE_MESSAGES = {
  extracting: [
    "Normalizing document structure...",
    "Extracting textual assertions & entities...",
    "Parsing metadata vectors..."
  ],
  analyzing: [
    "Cross-referencing claim databases...",
    "Evaluating evidence match confidence...",
    "Detecting emotional manipulation techniques..."
  ],
  finalize: [
    "Synthesizing overall credibility score...",
    "Formulating executive summary...",
    "Generating report payload..."
  ],
  complete: [
    "Analysis complete! Rendering workspace..."
  ]
};

const NodeComponent = ({ node, isActive, isCompleted }) => {
  const Icon = node.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full flex items-center gap-3.5 relative my-1 px-2.5 py-1.5 rounded-lg transition-colors"
    >
      <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
        <motion.div 
          className={cn(
            "absolute inset-0 rounded-md transform rotate-45 transition-all duration-500",
            isActive ? "border-2 border-prism-cyan bg-prism-surface-active shadow-[0_0_20px_rgba(34,211,238,0.6)]" :
            isCompleted ? "border border-prism-cyan/60 bg-prism-surface shadow-[0_0_8px_rgba(34,211,238,0.25)]" :
            "border border-prism-border bg-prism-surface-active/60 dark:bg-white/5"
          )}
        />
        <Icon size={14} className={cn(
          "relative z-10 transition-colors duration-300",
          isActive ? "text-prism-cyan dark:text-prism-text-primary animate-pulse" :
          isCompleted ? "text-prism-cyan" :
          "text-prism-text-secondary/60 dark:text-prism-text-muted"
        )} />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <h3 className={cn(
          "text-[10px] tracking-widest uppercase font-mono transition-colors duration-500 whitespace-nowrap text-left",
          isActive ? "text-prism-cyan font-bold" :
          isCompleted ? "text-prism-cyan/90 font-medium" :
          "text-prism-text-secondary/70 dark:text-prism-text-muted font-medium"
        )}>
          {node.label}
        </h3>
      </div>
    </motion.div>
  );
};

export const AnalysisPipeline = ({ 
  isProcessing, 
  currentStage, 
  error, 
  onCancel,
  onRetry,
  isRetrying = false,
  canRetry = true,
  failoverNotice = null
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [analyzingStep, setAnalyzingStep] = useState(2); // 2: claims, 3: evidence, 4: bias, 5: credibility

  // Message rotation interval
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Continuous active analysis flow through sub-steps during 'analyzing'
  useEffect(() => {
    if (currentStage !== 'analyzing') return;

    const interval = setInterval(() => {
      setAnalyzingStep((prev) => {
        // Step dynamically through claims (2) -> evidence (3) -> bias (4) -> credibility (5) -> loop back to evidence (3)
        if (prev >= 5) return 3;
        return prev + 1;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [currentStage]);

  // When model failover happens, immediately reset pipeline progression back to claims so user sees the new analysis flow actively run
  useEffect(() => {
    if (failoverNotice?.toModel) {
      setAnalyzingStep(2);
      setMessageIndex(0);
    }
  }, [failoverNotice?.toModel, failoverNotice?.type]);

  if (!isProcessing && !error) return null;

  // Determine active vs completed status for each node dynamically
  const getNodeState = (nodeIndex) => {
    if (currentStage === 'complete') {
      return { isCompleted: true, isActive: false };
    }

    let activeIndex = 0;
    if (currentStage === 'extracting') {
      activeIndex = 1; // TEXT EXTRACTION
    } else if (currentStage === 'analyzing') {
      activeIndex = analyzingStep; // 2 (claims), 3 (evidence), 4 (bias), 5 (credibility)
    } else if (currentStage === 'finalize') {
      activeIndex = 5; // CREDIBILITY SCORING -> FINAL SYNTHESIS
    }

    return {
      isCompleted: nodeIndex < activeIndex,
      isActive: nodeIndex === activeIndex
    };
  };

  // Dynamic active message reflecting the current or newly failed-over model
  const getActiveMessage = () => {
    if (currentStage === 'extracting') {
      const msgs = STAGE_MESSAGES.extracting;
      return msgs[messageIndex % msgs.length];
    }
    if (currentStage === 'finalize') {
      const msgs = STAGE_MESSAGES.finalize;
      return msgs[messageIndex % msgs.length];
    }
    if (currentStage === 'complete') {
      return STAGE_MESSAGES.complete[0];
    }
    
    // Analyzing stage:
    if (failoverNotice?.toModel) {
      const modelTag = failoverNotice.toModel;
      const modelMsgs = [
        `[${modelTag}] Detecting factual claims & key assertions...`,
        `[${modelTag}] Querying evidence sources & verification signals...`,
        `[${modelTag}] Evaluating rhetorical bias & manipulation techniques...`,
        `[${modelTag}] Synthesizing multi-dimensional credibility weights...`,
      ];
      const stepOffset = Math.max(0, analyzingStep - 2);
      return modelMsgs[stepOffset % modelMsgs.length] || modelMsgs[messageIndex % modelMsgs.length];
    }

    const defaultMsgs = STAGE_MESSAGES.analyzing;
    return defaultMsgs[messageIndex % defaultMsgs.length];
  };

  const activeMessage = getActiveMessage();

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex flex-col items-center justify-center p-3 sm:p-4 overflow-y-auto pointer-events-none"
      >
        {error ? (
          <div className="text-center pointer-events-auto max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-prism-surface/95 dark:bg-black/80 backdrop-blur-xl border border-red-500/30 shadow-2xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block p-4 sm:p-5 rounded-full bg-red-950/50 border border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)] mb-4"
            >
              <AlertTriangle size={40} className="text-red-500 animate-pulse sm:w-12 sm:h-12" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-light tracking-tight text-prism-text-primary mb-2">Analysis Encountered an Issue</h2>
            <p className="text-xs text-prism-text-secondary mb-6 leading-relaxed">{error}</p>
            
            {!canRetry && (
              <p className="text-xs text-amber-400/90 font-mono mb-6 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                This input cannot be retried because the original file is no longer in memory. Please select a file and try again.
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {onRetry && canRetry && (
                <button 
                  onClick={onRetry}
                  disabled={isRetrying}
                  className={cn(
                    "w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                    isRetrying 
                      ? "bg-prism-cyan/20 text-prism-cyan border border-prism-cyan/30 cursor-not-allowed opacity-70"
                      : "bg-prism-cyan text-black font-semibold hover:bg-prism-cyan/90 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                  )}
                >
                  {isRetrying && <Activity size={14} className="animate-spin" />}
                  {isRetrying ? 'RETRYING...' : 'Retry Analysis'}
                </button>
              )}

              {onCancel && (
                <button 
                  onClick={onCancel}
                  disabled={isRetrying}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider bg-prism-text-primary/10 hover:bg-prism-text-primary/20 text-prism-text-primary border border-prism-text-primary/20 transition-all disabled:opacity-50"
                >
                  Return to Workspace
                </button>
              )}
            </div>
          </div>
        ) : (
          <div 
            className={cn(
              "flex flex-col items-center justify-start pointer-events-auto max-h-[86vh] sm:max-h-[88vh] pt-5 pb-6 px-4 sm:px-7 max-w-[calc(100vw-1.5rem)] sm:max-w-[450px] w-full bg-prism-surface/95 dark:bg-black/90 backdrop-blur-2xl rounded-3xl border border-prism-border shadow-2xl relative transition-all duration-300",
              failoverNotice 
                ? "overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(59,130,246,0.6)_transparent] dark:[scrollbar-color:rgba(245,158,11,0.5)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-600/70 dark:[&::-webkit-scrollbar-thumb]:bg-amber-500/60 hover:[&::-webkit-scrollbar-thumb]:bg-blue-500 dark:hover:[&::-webkit-scrollbar-thumb]:bg-amber-400 [&::-webkit-scrollbar-thumb]:rounded-full pr-2.5 sm:pr-4"
                : "overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            )}
          >
            
            {/* Stage Micro-Status Bar */}
            <div className="mb-3 text-center shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400 font-bold block mb-1">
                ANALYSIS ENGINE ACTIVE
              </span>
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeMessage}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-prism-text-secondary dark:text-gray-300 font-mono px-2"
                >
                  {activeMessage}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Model Failover / Traffic Spike Live Notification Card - Navy Blue in Light Mode, Yellow/Amber in Dark Mode */}
            <AnimatePresence>
              {failoverNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="w-full max-w-[340px] sm:max-w-[380px] mx-auto mb-2.5 p-3.5 sm:p-4 rounded-2xl bg-[#09152b] dark:bg-amber-950/40 border border-blue-600/40 dark:border-amber-500/30 text-left shadow-[0_10px_25px_rgba(9,21,43,0.35)] dark:shadow-[0_0_25px_rgba(245,158,11,0.18)] backdrop-blur-xl relative overflow-hidden shrink-0"
                >
                  {/* Subtle top ambient sheen */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 dark:via-amber-400 to-transparent" />

                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-blue-400 dark:text-amber-400">
                      <Zap size={14} className="text-blue-400 dark:text-amber-400 animate-bounce" />
                      <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-bold text-blue-300 dark:text-amber-300">
                        {failoverNotice.type === 'model_failover' ? 'Model Auto-Failover' : 'Traffic Spike Detected'}
                      </span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-amber-400 animate-ping" />
                      Live Adapt
                    </span>
                  </div>

                  <p className="text-[11px] sm:text-xs text-slate-200 dark:text-gray-200 leading-relaxed font-normal">
                    {failoverNotice.message}
                  </p>

                  {failoverNotice.fromModel && failoverNotice.toModel && (
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-2.5 pt-2.5 border-t border-blue-900/60 dark:border-amber-500/20 text-[10px] sm:text-[11px] font-mono whitespace-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-400 dark:bg-black/50 dark:text-amber-400/60 line-through border border-slate-700/60 dark:border-transparent shrink-0">
                        {failoverNotice.fromModel}
                      </span>
                      <span className="text-blue-400 dark:text-amber-400 font-bold shrink-0">→</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.2)] shrink-0">
                        <Sparkles size={11} className="animate-spin text-emerald-400" />
                        {failoverNotice.toModel} (Active)
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scroll Indicator: Displayed only when failover pop-up is active */}
            {failoverNotice && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-1.5 mb-2.5 text-[10px] sm:text-[11px] font-mono text-blue-600 dark:text-amber-400/90 font-medium tracking-wide shrink-0"
              >
                <span className="inline-block animate-bounce">↓</span>
                <span>Scroll to view pipeline progress</span>
              </motion.div>
            )}

            {/* Pipeline Stage Nodes - Actively runs through steps */}
            <div className="flex flex-col items-center mb-5 w-full">
              <div className="w-full max-w-[240px] sm:max-w-[260px] flex flex-col items-start">
                {PIPELINE_NODES.map((node, index) => {
                  const { isCompleted, isActive } = getNodeState(index);
                  
                  return (
                    <React.Fragment key={node.id}>
                      <NodeComponent 
                        node={node} 
                        isActive={isActive} 
                        isCompleted={isCompleted || (node.id === 'report' && currentStage === 'complete')} 
                      />
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Cancel Button */}
            {onCancel && currentStage !== 'complete' && (
              <button
                onClick={onCancel}
                className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-500 hover:text-rose-500 border border-rose-500/40 hover:border-rose-500/80 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-1.5 rounded-full transition-all shadow-[0_0_12px_rgba(244,63,94,0.15)] shrink-0 min-h-[32px] sm:min-h-[34px] flex items-center justify-center"
              >
                Cancel Analysis
              </button>
            )}

          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
