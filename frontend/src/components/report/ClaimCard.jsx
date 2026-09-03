import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ShieldAlert, BookOpen } from 'lucide-react';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';

export const ClaimCard = (props) => {
  const [expanded, setExpanded] = useState(true);

  const claimStatement = props.statement || props.claim || props.text || "Extracted assertion details unavailable.";
  const rawStatus = (props.verificationStatus || props.status || props.importance || "unverified").toString().toLowerCase();

  const statusConfig = {
    corroborated: { Icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", badge: "success", label: "Corroborated" },
    verified: { Icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", badge: "success", label: "Verified" },
    contradicted: { Icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10", badge: "danger", label: "Contradicted" },
    falsehood: { Icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10", badge: "danger", label: "Falsehood" },
    unsupported: { Icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10", badge: "warning", label: "Unsupported" },
    unverified: { Icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10", badge: "warning", label: "Unverified" }
  };

  const config = statusConfig[rawStatus] || (rawStatus.includes('corroborat') ? statusConfig.corroborated : rawStatus.includes('false') || rawStatus.includes('contradict') ? statusConfig.contradicted : statusConfig.unverified);
  const { Icon } = config;
  const confidence = props.confidenceScore || props.confidence || props.credibilityScore || 75;

  const supporting = Array.isArray(props.supportingEvidence) ? props.supportingEvidence : [];
  const contradicting = Array.isArray(props.contradictingEvidence) ? props.contradictingEvidence : [];
  const logicalFlaws = Array.isArray(props.logicalFlaws) ? props.logicalFlaws : [];

  return (
    <Card glass hover className="mb-4 overflow-visible bg-white/[0.03] border-prism-text-primary/10 backdrop-blur-md">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`mt-1 p-2.5 rounded-xl ${config.bg} ${config.color} shrink-0`}>
            <Icon size={22} />
          </div>
          <div className="flex-1 min-w-0">
            {/* Header badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Badge variant={config.badge} className="uppercase px-2.5 py-0.5 text-[10px] font-mono tracking-wider">
                  {config.label}
                </Badge>
                {props.category && (
                  <span className="text-[10px] uppercase tracking-wider font-mono text-prism-text-primary/50 bg-prism-text-primary/5 px-2 py-0.5 rounded border border-prism-text-primary/10">
                    {props.category}
                  </span>
                )}
                {props.scientificConsensus && props.scientificConsensus !== 'N/A' && (
                  <span className="text-[10px] uppercase tracking-wider font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 dark:bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                    Consensus: {props.scientificConsensus}
                  </span>
                )}
              </div>
              <span className="text-xs text-cyan-700 dark:text-cyan-300 font-mono bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-0.5 rounded">
                Confidence: {confidence}%
              </span>
            </div>

            {/* Claim text */}
            <p className="text-prism-text-primary text-base font-medium leading-relaxed mb-3">
              "{claimStatement}"
            </p>

            {/* Reasoning summary */}
            {(props.reasoning || props.explanation) && (
              <p className="text-xs text-prism-text-primary/70 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-prism-text-primary/5 mb-3">
                <strong className="text-prism-text-primary/90 font-mono text-[11px] uppercase tracking-wider block mb-1">Analytical Reasoning:</strong>
                {props.reasoning || props.explanation}
              </p>
            )}

            {/* Expand Reasoning Chain button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-prism-accent hover:text-prism-text-primary transition-colors mt-2"
            >
              <span>{expanded ? "Collapse Evidence Graph" : "Expand Evidence Graph"}</span>
              <ChevronDown size={14} className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Expanded Evidence & Flaws Chain */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-prism-text-primary/10 space-y-4 overflow-hidden"
                >
                  {/* Supporting Evidence */}
                  {supporting.length > 0 && (
                    <div>
                      <h5 className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                        <BookOpen size={14} /> Supporting Evidence Signals ({supporting.length})
                      </h5>
                      <div className="space-y-1.5">
                        {supporting.map((ev, i) => (
                          <div key={i} className="text-xs text-prism-text-primary/80 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg">
                            "{typeof ev === 'string' ? ev : ev.text}"
                            {ev.source && <span className="block text-[10px] text-emerald-600 dark:text-emerald-400/80 mt-1 font-mono">Source: {ev.source}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contradicting Evidence */}
                  {contradicting.length > 0 && (
                    <div>
                      <h5 className="text-[11px] font-mono uppercase tracking-wider text-rose-500 dark:text-rose-400 mb-2 flex items-center gap-1.5">
                        <ShieldAlert size={14} /> Contradictory Signals & Context ({contradicting.length})
                      </h5>
                      <div className="space-y-1.5">
                        {contradicting.map((ev, i) => (
                          <div key={i} className="text-xs text-prism-text-primary/80 bg-rose-500/10 dark:bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-lg">
                            "{typeof ev === 'string' ? ev : ev.text}"
                            {ev.source && <span className="block text-[10px] text-rose-600 dark:text-rose-400/80 mt-1 font-mono">Source: {ev.source}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Logical Flaws */}
                  {logicalFlaws.length > 0 && (
                    <div>
                      <h5 className="text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                        Detected Logical Flaws & Weaknesses
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {logicalFlaws.map((flaw, i) => (
                          <span key={i} className="text-[11px] font-mono bg-amber-500/15 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded">
                            {flaw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Card>
  );
};
