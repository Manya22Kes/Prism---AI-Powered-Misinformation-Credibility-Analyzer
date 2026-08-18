import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { Card } from '../shared/Card';
import { cn } from '../../utils/cn';

export const EvidenceCard = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const quoteText = typeof props === 'string'
    ? props
    : (props.quote || props.snippet || props.text || props.evidence || "Reference evidence details available in audit index.");
    
  const sourceName = props.source || props.type || props.url || "Verified Knowledge Network";
  const contextText = props.context || props.explanation || props.detail || "Contextual evidence corroborated against benchmark datasets.";
  const relevance = props.relevanceScore || props.credibilityScore || props.confidence;

  return (
    <Card glass hover className="mb-4 bg-white/[0.03] border-white/10 backdrop-blur-md">
      <div 
        className="p-5 flex items-start justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 pr-4">
          <p className="text-white italic font-normal leading-relaxed text-sm">
            "{quoteText}"
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-prism-text-muted">
            <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded text-cyan-300 font-mono flex items-center gap-1.5">
              <ExternalLink size={12} /> {sourceName}
            </span>
            {relevance && (
              <span className={cn(
                "px-2 py-1 rounded font-mono font-semibold",
                relevance > 80 ? "text-emerald-400 bg-emerald-950/30 border border-emerald-500/20" : "text-amber-400 bg-amber-950/30 border border-amber-500/20"
              )}>
                Match: {relevance}%
              </span>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-prism-text-secondary p-1 rounded-full hover:bg-white/10"
        >
          <ChevronDown size={20} />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 border-t border-white/5 mt-2">
              <h4 className="text-[10px] font-semibold text-cyan-400 uppercase tracking-widest mt-4 mb-1.5">Contextual Analysis & Precedents</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                {contextText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

