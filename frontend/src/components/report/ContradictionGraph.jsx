import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Link as LinkIcon, Network, AlertTriangle } from 'lucide-react';
import { Card } from '../shared/Card';
import { cn } from '../../utils/cn';

export const ContradictionGraph = ({ contradictions }) => {
  const [activeId, setActiveId] = useState(null);

  return (
    <Card glass className="p-8 border-prism-low/30 relative overflow-hidden bg-prism-surface">
      {/* Warning ambient glow */}
      <div className="absolute inset-0 bg-prism-low/5 blur-[50px] pointer-events-none" />

      <div className="relative z-10 flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-prism-low/10 text-prism-low">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-prism-text-primary">
          Cross-Source Contradictions
        </h3>
      </div>

      <div className="relative z-10 space-y-4">
        {contradictions.map((item, idx) => {
          const isActive = activeId === idx;
          
          return (
            <motion.div
              key={idx}
              layout
              onMouseEnter={() => setActiveId(idx)}
              onMouseLeave={() => setActiveId(null)}
              className={cn(
                "p-5 rounded-xl border transition-all duration-300 cursor-default",
                isActive ? "bg-prism-surface-hover border-prism-low/50 shadow-prism-glow-danger" : "bg-prism-bg/50 border-prism-border"
              )}
            >
              <div className="flex flex-col md:flex-row gap-6 md:items-center">
                
                {/* Source A */}
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-prism-text-muted">
                    <FileText size={14} />
                    <span className="uppercase tracking-wider font-semibold">{item.sourceA.name}</span>
                  </div>
                  <p className="text-sm font-medium text-prism-text-primary italic">
                    "{item.sourceA.claim}"
                  </p>
                </div>

                {/* Connection Node */}
                <div className="flex items-center justify-center relative px-4">
                  <div className={cn(
                    "w-full absolute top-1/2 -translate-y-1/2 h-px -z-10 transition-colors",
                    isActive ? "bg-prism-low" : "bg-prism-border"
                  )} />
                  <motion.div 
                    animate={{ rotate: isActive ? 90 : 0, scale: isActive ? 1.1 : 1 }}
                    className={cn(
                      "p-2 rounded-full border bg-prism-bg z-10 transition-colors",
                      isActive ? "text-prism-low border-prism-low" : "text-prism-text-muted border-prism-border"
                    )}
                  >
                    <Network size={16} />
                  </motion.div>
                </div>

                {/* Source B */}
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-prism-text-muted">
                    <FileText size={14} />
                    <span className="uppercase tracking-wider font-semibold">{item.sourceB.name}</span>
                  </div>
                  <p className="text-sm font-medium text-prism-text-primary italic">
                    "{item.sourceB.claim}"
                  </p>
                </div>

              </div>

              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-prism-border/50 text-sm text-prism-text-secondary leading-relaxed">
                      <span className="text-prism-low font-semibold">AI Synthesis: </span>
                      {item.synthesis}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};
