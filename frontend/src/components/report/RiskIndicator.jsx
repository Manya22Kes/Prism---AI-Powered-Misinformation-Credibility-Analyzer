import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, AlertOctagon, ChevronDown, MessageSquareWarning } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export const RiskIndicator = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const level = (props.severity || props.level || 'medium').toString().toLowerCase();
  // We prefer riskType as the top-level label if available, fallback to title.
  const riskType = props.riskType || props.type || props.title || "Credibility Anomaly";
  const shortExplanation = props.shortExplanation || props.explanation || props.description || "";
  
  // Claim tracking
  const scope = props.scope || (props.affectedClaimId ? 'claim' : 'article');
  const affectedClaim = scope === 'claim' && props.affectedClaimId ? props.affectedClaimId : 'Article-level';

  const configs = {
    high: {
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]",
      Icon: AlertOctagon
    },
    critical: {
      color: "text-rose-500",
      bg: "bg-rose-600/15",
      border: "border-rose-500/50",
      glow: "shadow-[0_0_25px_rgba(244,63,94,0.3)]",
      Icon: AlertOctagon
    },
    medium: {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
      Icon: AlertTriangle
    },
    low: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
      Icon: ShieldCheck
    }
  };

  const config = configs[level] || configs.medium;
  const { Icon } = config;

  const hasDetails = props.evidenceQuote || props.whyItMatters || (props.issues && props.issues.length > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col p-4 rounded-xl border backdrop-blur-md transition-all bg-white/[0.02]",
        config.bg,
        config.border,
        config.glow
      )}
    >
      <div className="flex items-start gap-4 cursor-pointer group" onClick={() => hasDetails && setIsOpen(!isOpen)}>
        <div className={cn("p-2 rounded-lg bg-black/40 border border-white/5 flex-shrink-0 mt-0.5", config.color)}>
          <Icon size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold tracking-widest", config.bg, config.border, config.color)}>
              {level} RISK
            </span>
            <span className="text-[10px] font-mono text-white/50 bg-black/20 px-2 py-0.5 rounded border border-white/5">
              {affectedClaim}
            </span>
          </div>
          
          <h4 className="text-sm font-semibold text-white tracking-wide mb-1 truncate">
            {riskType}
          </h4>
          
          {shortExplanation && (
            <p className="text-xs text-gray-300 leading-relaxed font-sans pr-4 line-clamp-2">
              {shortExplanation}
            </p>
          )}
        </div>

        {hasDetails && (
          <div className="pt-1">
            <ChevronDown 
              size={18} 
              className={cn("text-white/40 transition-transform duration-300", isOpen && "rotate-180")} 
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-white/10 space-y-4">
              
              {props.evidenceQuote && (
                <div className="bg-black/30 rounded-lg p-3 border border-white/5 relative">
                  <MessageSquareWarning size={14} className="absolute top-3 left-3 text-white/30" />
                  <p className="text-[11px] text-white/70 italic leading-relaxed pl-7 pr-2 font-serif">
                    "{props.evidenceQuote}"
                  </p>
                </div>
              )}

              {props.whyItMatters && (
                <div>
                  <span className={cn("text-[9px] uppercase font-bold tracking-wider mb-1 block", config.color)}>
                    Why it matters
                  </span>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {props.whyItMatters}
                  </p>
                </div>
              )}

              {/* Legacy fallback for older reports */}
              {props.issues && Array.isArray(props.issues) && props.issues.length > 0 && (
                <ul className="space-y-1.5">
                  {props.issues.map((issue, idx) => (
                    <li key={idx} className="text-[11px] text-white/60 flex items-start gap-2">
                      <span className={cn("mt-1 text-[8px]", config.color)}>●</span>
                      <span className="leading-snug">{issue}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

