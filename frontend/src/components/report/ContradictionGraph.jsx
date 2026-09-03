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
          return (
            <motion.div
              key={idx}
              className="p-6 rounded-xl border transition-all duration-300 bg-prism-bg/50 border-prism-border hover:border-prism-low/30 hover:bg-prism-surface-hover"
            >
              <div className="flex flex-col gap-4">
                
                {/* Disputed Claim */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-prism-text-muted">
                    <AlertTriangle size={14} className="text-prism-low" />
                    <span className="uppercase tracking-wider font-semibold text-prism-low">Disputed Claim</span>
                  </div>
                  <p className="text-base font-medium text-prism-text-primary italic border-l-2 border-prism-low/30 pl-4 py-1">
                    "{item.claim}"
                  </p>
                </div>

                {/* Conflict Explanation */}
                <div className="mt-2 pt-4 border-t border-prism-border/50 text-sm text-prism-text-secondary leading-relaxed">
                  <span className="text-prism-low font-semibold text-[10px] uppercase tracking-wider block mb-1">Nature of Conflict: </span>
                  {item.conflict}
                </div>

              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};
