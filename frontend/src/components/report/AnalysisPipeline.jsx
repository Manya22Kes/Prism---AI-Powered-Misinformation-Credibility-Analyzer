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
      className="flex items-center gap-3 relative my-1 px-3 py-1.5 rounded-lg transition-colors"
    >
      <div className="relative flex items-center justify-center w-8 h-8">
        <motion.div 
          className={cn(
            "absolute inset-0 rounded-md transform rotate-45 transition-all duration-500",
            isActive ? "border-2 border-prism-cyan bg-prism-surface-active shadow-[0_0_20px_rgba(34,211,238,0.6)]" :
            isCompleted ? "border border-prism-cyan/60 bg-prism-surface shadow-[0_0_8px_rgba(34,211,238,0.25)]" :
            "border border-white/10 bg-black/40"
          )}
        />
        <Icon size={14} className={cn(
          "relative z-10 transition-colors duration-300",
          isActive ? "text-white animate-pulse" :
          isCompleted ? "text-prism-cyan" :
          "text-prism-text-muted"
        )} />
      </div>

      <div className="flex flex-col">
        <h3 className={cn(
          "text-[10px] tracking-widest uppercase font-mono transition-colors duration-500",
          isActive ? "text-white font-bold" :
          isCompleted ? "text-prism-cyan/90 font-medium" :
          "text-prism-text-muted"
        )}>
          {node.label}
        </h3>
      </div>
    </motion.div>
  );
};

export const AnalysisPipeline = ({ isProcessing, currentStage, error, onCancel }) => {
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
          <div className="text-center pointer-events-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block p-5 rounded-full bg-red-950/50 border border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)] mb-4"
            >
              <AlertTriangle size={48} className="text-red-500 animate-pulse" />
            </motion.div>
            <h2 className="text-3xl font-light tracking-tight text-white mb-2">Analysis Encountered an Issue</h2>
            <p className="text-sm text-prism-text-secondary max-w-md mx-auto mb-6">{error}</p>
            {onCancel && (
              <button 
                onClick={onCancel}
                className="px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
              >
                Return to Workspace
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pointer-events-auto max-h-[85vh] py-6 px-8 bg-black/50 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl relative">
            
            {/* Stage Micro-Status Bar */}
            <div className="mb-4 text-center">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold block mb-1">
                ANALYSIS ENGINE ACTIVE
              </span>
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeMessage}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-prism-text-secondary font-mono"
                >
                  {activeMessage}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Pipeline Stage Nodes */}
            <div className="flex flex-col items-center mb-6">
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

            {/* Cancel Button */}
            {onCancel && currentStage !== 'complete' && (
              <button
                onClick={onCancel}
                className="text-[11px] font-mono uppercase tracking-wider text-white/50 hover:text-white/90 border border-white/10 hover:border-white/20 px-4 py-1.5 rounded-full transition-all"
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
