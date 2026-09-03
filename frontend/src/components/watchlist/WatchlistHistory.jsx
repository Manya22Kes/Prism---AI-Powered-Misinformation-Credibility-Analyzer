import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const getScoreColor = (score) => {
  if (score == null) return 'text-prism-text-muted';
  if (score >= 80) return 'text-prism-cyan';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-500';
};

export const WatchlistHistory = ({ history, isExpanded }) => {
  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden border-t border-prism-border/40 bg-prism-surface-active/10"
        >
          <div className="p-4 pl-16">
            <h5 className="text-xs font-semibold uppercase tracking-widest text-prism-text-muted flex items-center gap-2 mb-4">
              <History size={14} /> History Log
            </h5>
            
            {(!history || history.length === 0) ? (
              <p className="text-sm text-prism-text-secondary italic">No history available for this item yet.</p>
            ) : (
              <div className="space-y-3">
                {[...history].reverse().map((entry, index) => {
                  const isLatest = index === 0;
                  const dateStr = new Date(entry.date).toLocaleDateString('en-GB');
                  
                  return (
                    <div key={entry._id || index} className={cn(
                      "flex items-center gap-6 p-3 rounded-lg border transition-colors",
                      isLatest ? "bg-prism-surface-active/30 border-prism-cyan/20" : "bg-prism-surface/50 border-prism-border/30 hover:border-prism-border"
                    )}>
                      {/* Date */}
                      <div className="w-24 text-sm font-mono text-prism-text-secondary shrink-0">
                        {dateStr}
                      </div>
                      
                      {/* Score */}
                      <div className="w-16 flex items-center gap-2 shrink-0">
                        <span className={cn("text-lg font-bold font-mono tracking-tighter", getScoreColor(entry.score))}>
                          {entry.score != null ? entry.score : '--'}
                        </span>
                      </div>
                      
                      {/* Verdict */}
                      <div className="flex-1 text-sm text-prism-text-primary">
                        {entry.verdict || 'Unknown'}
                      </div>
                      
                      {/* Change */}
                      <div className="w-24 text-right shrink-0">
                        {entry.scoreChange != null ? (
                          <span className={cn("text-xs font-mono px-2 py-1 rounded", 
                            entry.scoreChange > 0 ? "bg-prism-high/10 text-prism-high" : 
                            entry.scoreChange < 0 ? "bg-prism-low/10 text-prism-low" : 
                            "text-prism-text-muted"
                          )}>
                            {entry.scoreChange > 0 ? '+' : ''}{entry.scoreChange}
                          </span>
                        ) : (
                          <span className="text-xs text-prism-text-muted">—</span>
                        )}
                      </div>
                      
                      {/* Link */}
                      <div className="w-8 flex justify-end shrink-0">
                        {entry.analysisId ? (
                          <Link to={`/report/${entry.analysisId}`} className="p-1.5 rounded-md hover:bg-prism-surface-active text-prism-text-muted hover:text-prism-cyan transition-colors" title="View Full Report">
                            <ExternalLink size={14} />
                          </Link>
                        ) : (
                          <div className="w-8" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
