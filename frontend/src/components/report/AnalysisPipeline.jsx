import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Activity, Search, ShieldCheck, Cpu, Database } from 'lucide-react';
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
  canRetry = true
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const storePipelineStage = useExperienceStore((state) => state.pipelineStage);
  const activeStage = currentStage || storePipelineStage;

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % 3);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  if (!isProcessing && !error) return null;

  const currentMessages = STAGE_MESSAGES[currentStage] || STAGE_MESSAGES.extracting;
  const activeMessage = currentMessages[messageIndex % currentMessages.length];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto pointer-events-none"
      >
        {error ? (
          <div className="text-center pointer-events-auto max-w-md mx-auto p-8 rounded-3xl bg-prism-surface/95 dark:bg-black/80 backdrop-blur-xl border border-red-500/30 shadow-2xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block p-5 rounded-full bg-red-950/50 border border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)] mb-4"
            >
              <AlertTriangle size={48} className="text-red-500 animate-pulse" />
            </motion.div>
            <h2 className="text-2xl font-light tracking-tight text-prism-text-primary mb-2">Analysis Encountered an Issue</h2>
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
          <div className="flex flex-col items-center justify-center pointer-events-auto max-h-[90vh] py-5 px-5 sm:px-8 max-w-[calc(100vw-2rem)] bg-prism-surface/95 dark:bg-black/85 backdrop-blur-xl rounded-3xl border border-prism-border shadow-2xl relative overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            
            {/* Stage Micro-Status Bar */}
            <div className="mb-4 text-center">
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
                  className="text-xs text-prism-text-secondary dark:text-gray-300 font-mono"
                >
                  {activeMessage}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Pipeline Stage Nodes */}
            <div className="flex flex-col items-center mb-6 w-full">
              <div className="w-full max-w-[240px] flex flex-col items-start">
                {PIPELINE_NODES.map((node, index) => {
                  const isActive = node.stageMatch.includes(currentStage) && !PIPELINE_NODES[index + 1]?.stageMatch.includes(currentStage);
                  const isCompleted = PIPELINE_NODES.slice(index + 1).some(n => n.stageMatch.includes(currentStage)) || currentStage === 'complete';
                  
                  return (
                    <React.Fragment key={node.id}>
                      <NodeComponent node={node} isActive={isActive && currentStage !== 'complete'} isCompleted={isCompleted || (node.id === 'report' && currentStage === 'complete')} />
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Cancel Button */}
            {onCancel && currentStage !== 'complete' && (
              <button
                onClick={onCancel}
                className="text-[11px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-500 hover:text-rose-500 border border-rose-500/40 hover:border-rose-500/80 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-1.5 rounded-full transition-all shadow-[0_0_12px_rgba(244,63,94,0.15)]"
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
