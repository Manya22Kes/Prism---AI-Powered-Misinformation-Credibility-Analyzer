import React, { useState } from 'react';
import { ChevronDown, MessageSquareWarning } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export const FramingBadge = ({ indicator, theme = "amber" }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const colors = {
    amber: "text-amber-300 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20",
    rose: "text-rose-300 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20",
  };

  const activeColors = {
    amber: "bg-amber-500/20 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    rose: "bg-rose-500/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]",
  };

  const hasDetails = indicator.evidenceQuote || indicator.whyItMatters || indicator.shortDescription || indicator.explanation;

  return (
    <div className="flex flex-col mb-2 w-full max-w-sm">
      <button 
        onClick={() => hasDetails && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between text-xs font-mono px-3 py-2 rounded-lg border transition-all duration-300 text-left",
          colors[theme],
          isOpen && activeColors[theme],
          !hasDetails && "cursor-default"
        )}
      >
        <span className="font-semibold tracking-wide">
          {indicator.type || indicator.technique || "Indicator"}
        </span>
        {hasDetails && (
          <ChevronDown size={14} className={cn("transition-transform duration-300 opacity-60", isOpen && "rotate-180")} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={cn("p-3 mt-1.5 rounded-lg border bg-prism-surface-active/60 dark:bg-black/40 space-y-3", theme === "amber" ? "border-amber-500/10" : "border-rose-500/10")}>
              {(indicator.shortDescription || indicator.explanation) && (
                <p className="text-xs text-prism-text-primary/70 leading-relaxed font-sans">
                  {indicator.shortDescription || indicator.explanation}
                </p>
              )}
              
              {indicator.evidenceQuote && (
                <div className="bg-prism-surface-active/60 dark:bg-black/40 rounded p-2.5 border border-prism-text-primary/10 relative">
                  <MessageSquareWarning size={12} className="absolute top-2.5 left-2 text-prism-text-primary/30" />
                  <p className="text-[11px] text-prism-text-primary/70 italic leading-relaxed pl-6 font-serif">
                    "{indicator.evidenceQuote}"
                  </p>
                </div>
              )}

              {indicator.whyItMatters && (
                <div>
                  <span className={cn("text-[9px] uppercase font-bold tracking-wider mb-0.5 block", theme === "amber" ? "text-amber-400/80" : "text-rose-400/80")}>
                    Why it matters
                  </span>
                  <p className="text-[11px] text-prism-text-primary/50 leading-relaxed">
                    {indicator.whyItMatters}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
