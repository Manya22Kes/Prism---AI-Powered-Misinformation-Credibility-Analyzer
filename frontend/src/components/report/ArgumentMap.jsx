import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, ArrowDown } from 'lucide-react';

/**
 * Executive Argument Map
 * 
 * A narrative hierarchy placed immediately after the Executive Analyst Briefing.
 * NOT a node graph — reads like a story.
 * 
 * Main Thesis → Supporting Arguments → Counterarguments → Overall Assessment
 */
export const ArgumentMap = ({ articleIntelligence, argumentStructure, analyticalFindings, overallVerdict, score }) => {
  if (!articleIntelligence?.mainThesis && !argumentStructure?.narrativeSummary) return null;

  const mainThesis = articleIntelligence?.mainThesis || argumentStructure?.narrativeSummary || '';
  const narrativeSummary = argumentStructure?.narrativeSummary || '';
  const detectedIntent = articleIntelligence?.detectedIntent || '';
  const intentConfidence = articleIntelligence?.intentConfidence || 0;
  const authorPosition = articleIntelligence?.authorPosition || '';

  // Get supporting and counter findings by ID
  const findingById = (id) => analyticalFindings?.find(f => f.claimId === id);

  const supportingIds = argumentStructure?.supportingClaimIds || [];
  const counterIds = argumentStructure?.counterArgumentClaimIds || [];

  const supportingFindings = supportingIds.map(findingById).filter(Boolean);
  const counterFindings = counterIds.map(findingById).filter(Boolean);

  // If no explicit structure, auto-derive from findings
  const allFindings = analyticalFindings || [];
  const autoSupporting = supportingFindings.length > 0
    ? supportingFindings
    : allFindings.filter(f =>
        ['Verified', 'Corroborated'].includes(f.verificationStatus)
      ).slice(0, 4);
  const autoCounter = counterFindings.length > 0
    ? counterFindings
    : allFindings.filter(f =>
        ['Unsupported', 'Contradicted', 'Contested'].includes(f.verificationStatus)
      ).slice(0, 3);

  const verdictColor = score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400';
  const verdictBg = score >= 70 ? 'bg-emerald-950/30 border-emerald-500/20' : score >= 50 ? 'bg-amber-950/30 border-amber-500/20' : 'bg-rose-950/30 border-rose-500/20';

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="glass-panel rounded-3xl border-t border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div className="px-8 pt-7 pb-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-prism-accent flex items-center gap-2.5">
            <span className="w-6 h-px bg-prism-accent/50" /> Argument Map
          </h2>
          <p className="text-[11px] text-white/40 font-mono mt-1">How the article argues its position</p>
        </div>
        {detectedIntent && (
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Document Intent</span>
            <span className="text-xs font-mono text-cyan-300 font-medium">{detectedIntent}</span>
            {intentConfidence > 0 && (
              <span className="text-[10px] text-white/30 font-mono ml-1.5">({intentConfidence}%)</span>
            )}
          </div>
        )}
      </div>

      <div className="px-8 py-7 space-y-0">

        {/* Main Thesis */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-2xl bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-center">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-prism-accent block mb-2">
              Main Thesis
            </span>
            <p className="text-white text-sm font-light leading-relaxed">
              {mainThesis}
            </p>
            {authorPosition && (
              <span className={`inline-block mt-3 text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                authorPosition === 'Critical' ? 'text-rose-400 bg-rose-950/30 border-rose-500/20' :
                authorPosition === 'Sympathetic' ? 'text-cyan-400 bg-cyan-950/30 border-cyan-500/20' :
                'text-white/50 bg-white/5 border-white/10'
              }`}>
                Author Position: {authorPosition}
              </span>
            )}
          </div>

          <ArrowDown size={18} className="text-white/20 my-3" />
        </div>

        {/* Two-column: Supporting / Counter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Supporting Arguments */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                Supporting Arguments ({autoSupporting.length})
              </span>
            </div>
            {autoSupporting.length > 0 ? (
              autoSupporting.map((f, i) => (
                <motion.div
                  key={f.claimId || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-start gap-2.5 bg-emerald-950/20 border border-emerald-500/15 rounded-xl p-3.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono text-emerald-300/60 uppercase tracking-wider block mb-0.5">
                      {f.theme || f.category}
                    </span>
                    <p className="text-xs text-white/80 leading-relaxed">{f.answer || f.statement}</p>
                    {f.supportingEvidence?.length > 0 && (
                      <span className="text-[10px] text-emerald-400/50 font-mono mt-1.5 block">
                        {f.supportingEvidence.length} evidence item{f.supportingEvidence.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-xs text-white/30 italic px-1">No distinct supporting arguments identified.</p>
            )}
          </div>

          {/* Counter Arguments */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-rose-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400">
                Counterarguments ({autoCounter.length})
              </span>
            </div>
            {autoCounter.length > 0 ? (
              autoCounter.map((f, i) => (
                <motion.div
                  key={f.claimId || i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-start gap-2.5 bg-rose-950/20 border border-rose-500/15 rounded-xl p-3.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono text-rose-300/60 uppercase tracking-wider block mb-0.5">
                      {f.theme || f.category}
                    </span>
                    <p className="text-xs text-white/80 leading-relaxed">{f.answer || f.statement}</p>
                    {f.contradictingEvidence?.length > 0 && (
                      <span className="text-[10px] text-rose-400/50 font-mono mt-1.5 block">
                        {f.contradictingEvidence.length} counter-evidence item{f.contradictingEvidence.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-xs text-white/30 italic px-1">No distinct counter-arguments identified.</p>
            )}
          </div>
        </div>

        {/* Arrow + Overall Assessment */}
        <div className="flex flex-col items-center mt-4">
          <ArrowDown size={18} className="text-white/20 my-3" />
          <div className={`w-full max-w-sm ${verdictBg} border rounded-2xl p-4 text-center`}>
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/40 block mb-1.5">
              Overall Assessment
            </span>
            <span className={`text-base font-semibold tracking-wide ${verdictColor}`}>
              {overallVerdict?.label || 'Proceed With Caution'}
            </span>
            {narrativeSummary && narrativeSummary !== mainThesis && (
              <p className="text-xs text-white/50 mt-2 leading-relaxed">{narrativeSummary}</p>
            )}
          </div>
        </div>

      </div>
    </motion.section>
  );
};
