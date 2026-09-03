import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, AlertCircle, ChevronDown,
  BookOpen, ShieldAlert, Link2, Minus, AlertTriangle
} from 'lucide-react';
import { Badge } from '../shared/Badge';

const EVIDENCE_TYPE_COLORS = {
  'Quote': 'text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 dark:bg-cyan-950/30 border-cyan-500/20',
  'Case Study': 'text-purple-700 dark:text-purple-300 bg-purple-500/10 dark:bg-purple-950/30 border-purple-500/20',
  'Statistic': 'text-blue-700 dark:text-blue-300 bg-blue-500/10 dark:bg-blue-950/30 border-blue-500/20',
  'Expert Opinion': 'text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/20',
  'Example': 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/20',
  'Reference': 'text-prism-text-primary/70 bg-prism-text-primary/5 border-prism-text-primary/10',
  'Acknowledgment': 'text-rose-700 dark:text-rose-300 bg-rose-500/10 dark:bg-rose-950/30 border-rose-500/20',
};

const RELATIONSHIP_COLORS = {
  'supports': 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/20',
  'contradicts': 'text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/10 dark:bg-rose-950/20',
  'depends on': 'text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-500/10 dark:bg-amber-950/20',
};

const EvidenceItem = ({ item, variant = 'supporting' }) => {
  const colorClass = EVIDENCE_TYPE_COLORS[item.type] || EVIDENCE_TYPE_COLORS['Reference'];
  const bgClass = variant === 'supporting'
    ? 'bg-emerald-500/[0.07] dark:bg-emerald-950/10 border-emerald-500/20'
    : 'bg-rose-500/[0.07] dark:bg-rose-950/10 border-rose-500/20';

  return (
    <div className={`rounded-xl border p-3.5 space-y-2 ${bgClass}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${colorClass}`}>
          {item.type}
        </span>
        {item.subject && (
          <span className="text-[11px] font-medium text-prism-text-primary/70 truncate max-w-[180px]">
            {item.subject}
          </span>
        )}
      </div>
      {item.text && (
        <p className="text-xs text-prism-text-primary/85 italic leading-relaxed border-l-2 border-prism-text-primary/15 pl-3">
          "{item.text}"
        </p>
      )}
      {item.interpretation && (
        <p className="text-[11px] text-prism-text-primary/55 leading-relaxed">
          ↳ {item.interpretation}
        </p>
      )}
      {item.source && item.source !== 'Article text' && (
        <span className="text-[10px] font-mono text-prism-text-primary/30 block">
          Source: {item.source}
        </span>
      )}
    </div>
  );
};

/**
 * FindingCard — Clean Major Claim Card
 * 
 * Collapsed View (Ultra-lean):
 * 1. Theme Tag + Status Pill + Confidence Score
 * 2. Major Claim (Declarative statement)
 * 3. Short Assessment (1 sentence takeaway)
 * 4. "Show Evidence ▼" button
 * 
 * Expanded View (Progressive Disclosure):
 * - Evidence from the article
 * - Evidence against this claim
 * - Things to be careful about (Logical flaws)
 * - Deep Assessment & Relationships
 */
export const FindingCard = (props) => {
  const [expanded, setExpanded] = useState(false);

  const {
    claimId,
    theme,
    answer,
    verificationStatus,
    confidenceScore,
    category,
    supportingEvidence = [],
    contradictingEvidence = [],
    missingEvidence = [],
    logicalFlaws = [],
    scientificConsensus,
    analyticalAssessment,
    relationships = [],
    whyPrismThinksThis,

    // Legacy fallbacks
    statement, text, claim, reasoning, explanation, analystReasoning
  } = props;

  // Declarative Major Claim
  const majorClaimText = answer || statement || text || claim || 'Major claim synthesized from article analysis.';
  const shortAssessment = analyticalAssessment || analystReasoning || reasoning || explanation || 'Evidence evaluated across source data.';
  const rawStatus = (verificationStatus || 'unverified').toString().toLowerCase();

  const statusConfig = {
    corroborated: { Icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', badge: 'success', label: 'Corroborated' },
    verified:     { Icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', badge: 'success', label: 'Verified' },
    contradicted: { Icon: XCircle,      color: 'text-rose-400',    bg: 'bg-rose-500/10',    badge: 'danger',  label: 'Contradicted' },
    unsupported:  { Icon: AlertCircle,  color: 'text-amber-400',   bg: 'bg-amber-500/10',   badge: 'warning', label: 'Unsupported' },
    contested:    { Icon: AlertCircle,  color: 'text-amber-400',   bg: 'bg-amber-500/10',   badge: 'warning', label: 'Contested' },
    unverified:   { Icon: AlertCircle,  color: 'text-amber-400',   bg: 'bg-amber-500/10',   badge: 'warning', label: 'Unverified' },
  };

  const config = statusConfig[rawStatus] || statusConfig.unverified;
  const { Icon } = config;
  const confidence = confidenceScore ?? 70;

  const totalEvidenceCount = supportingEvidence.length + contradictingEvidence.length;

  return (
    <div className="bg-white/[0.025] border border-prism-text-primary/10 backdrop-blur-md rounded-2xl overflow-hidden hover:border-prism-text-primary/20 transition-all duration-300">

      {/* ── Collapsed View ─────────────────────────────────────────── */}
      <div className="p-5 space-y-3">
        {/* Header: Theme + Status + Confidence */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${config.bg} ${config.color} shrink-0`}>
              <Icon size={14} />
            </div>
            {theme && (
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-prism-accent/80 bg-prism-accent/10 border border-prism-accent/20 px-2.5 py-0.5 rounded-full">
                {theme}
              </span>
            )}
            {category && (
              <span className="text-[10px] font-mono text-prism-text-primary/40 bg-prism-text-primary/5 border border-prism-text-primary/8 px-2 py-0.5 rounded">
                {category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={config.badge} className="uppercase px-2.5 py-0.5 text-[10px] font-mono tracking-wider">
              {config.label}
            </Badge>
            <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 dark:bg-cyan-950/30 border border-cyan-500/20 px-2 py-0.5 rounded">
              {confidence}%
            </span>
          </div>
        </div>

        {/* Declarative Major Claim Statement */}
        <div className="pt-2 pb-1">
          <p className="text-prism-text-primary text-[15px] font-semibold leading-relaxed tracking-wide">
            {majorClaimText}
          </p>
        </div>

        {/* Lightweight Evidence Indicators & Expand */}
        <div className="flex items-center justify-between pt-2 border-t border-prism-text-primary/5">
          <div className="flex items-center gap-2">
             <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">{supportingEvidence.length} SUPPORTING</span>
             {contradictingEvidence.length > 0 && <span className="text-[9px] font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-950/30 px-2 py-0.5 rounded border border-rose-500/20">{contradictingEvidence.length} COUNTER</span>}
             {logicalFlaws.length > 0 && <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/20">{logicalFlaws.length} FLAWS</span>}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.15em] text-cyan-400 hover:text-cyan-300 transition-colors group"
          >
            <span>{expanded ? "Close Case" : "Investigate"}</span>
            <ChevronDown size={14} className={`transition-transform duration-300 group-hover:translate-y-0.5 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Expanded View (Progressive Disclosure) ──────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-prism-text-primary/10 bg-prism-surface-active/30 dark:bg-black/20"
          >
            <div className="p-5 space-y-6">

              {/* Assessment Moved Inside */}
              <div className="bg-prism-surface-active/40 dark:bg-white/[0.02] border border-prism-text-primary/10 rounded-xl p-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block mb-2 border-b border-cyan-500/20 pb-2">
                  Analytical Assessment
                </span>
                <p className="text-[13px] text-prism-text-primary/80 leading-relaxed font-light">
                  {shortAssessment}
                </p>
              </div>

              {/* Evidence Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Supporting */}
                <div className="space-y-3">
                  <h5 className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                    <CheckCircle2 size={13} /> Evidence From The Article ({supportingEvidence.length})
                  </h5>
                  {supportingEvidence.length > 0 ? (
                    supportingEvidence.map((ev, i) => (
                      <EvidenceItem key={i} item={ev} variant="supporting" />
                    ))
                  ) : (
                    <p className="text-xs text-prism-text-primary/30 italic">No explicit supporting evidence items cited.</p>
                  )}
                </div>

                {/* Contradicting */}
                <div className="space-y-3">
                  <h5 className="text-[11px] font-mono uppercase tracking-wider text-rose-400 flex items-center gap-2 border-b border-rose-500/20 pb-2">
                    <XCircle size={13} /> Evidence Against This Claim ({contradictingEvidence.length})
                  </h5>
                  {contradictingEvidence.length > 0 ? (
                    contradictingEvidence.map((ev, i) => (
                      <EvidenceItem key={i} item={ev} variant="contradicting" />
                    ))
                  ) : (
                    <p className="text-xs text-prism-text-primary/30 italic">No explicit counter-evidence items cited in text.</p>
                  )}
                </div>
              </div>

              {/* Things To Be Careful About (Logical Flaws) */}
              {logicalFlaws.length > 0 && (
                <div className="bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 space-y-2">
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <AlertTriangle size={12} /> Things To Be Careful About
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {logicalFlaws.map((flaw, i) => (
                      <span key={i} className="text-[11px] font-mono bg-amber-500/15 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2.5 py-0.5 rounded-md">
                        {flaw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Evidence */}
              {missingEvidence.length > 0 && (
                <div className="bg-white/[0.02] border border-prism-text-primary/5 rounded-xl p-4 space-y-2">
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-prism-text-primary/50 flex items-center gap-2">
                    <Minus size={12} /> Missing Verification & Data Gaps
                  </h5>
                  <ul className="space-y-1">
                    {missingEvidence.map((item, i) => (
                      <li key={i} className="text-xs text-prism-text-primary/60 flex items-start gap-2">
                        <span className="text-cyan-400/50 mt-1">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Why Prism Thinks This (Detailed Reasoning) */}
              {whyPrismThinksThis && (whyPrismThinksThis.trustBullets?.length > 0 || whyPrismThinksThis.cautionBullets?.length > 0) && (
                <div className="bg-white/[0.02] border border-prism-text-primary/5 rounded-xl p-4 space-y-3">
                  <h5 className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-cyan-500/20 pb-2">
                    Why Prism Thinks This
                  </h5>
                  <div className="space-y-2">
                    {whyPrismThinksThis.trustBullets?.map((b, i) => (
                      <div key={`t-${i}`} className="text-xs text-prism-text-primary/75 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                        <span className="leading-relaxed">{b}</span>
                      </div>
                    ))}
                    {whyPrismThinksThis.cautionBullets?.map((b, i) => (
                      <div key={`c-${i}`} className="text-xs text-prism-text-primary/75 flex items-start gap-2">
                        <span className="text-amber-400 font-bold mt-0.5">⚠</span>
                        <span className="leading-relaxed">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scientific Consensus & Relationships */}
              <div className="flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-prism-text-primary/5 text-[11px] font-mono text-prism-text-primary/40">
                {scientificConsensus && scientificConsensus !== 'N/A' && (
                  <div>
                    <span>Scientific Consensus: </span>
                    <span className="text-prism-text-primary font-medium">{scientificConsensus}</span>
                  </div>
                )}
                {relationships.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Link2 size={12} />
                    <span>Relationships: </span>
                    {relationships.map((rel, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded border uppercase text-[10px] ${RELATIONSHIP_COLORS[rel.type] || 'text-prism-text-primary/50'}`}>
                        {rel.type} → {rel.targetTheme || rel.targetClaimId}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
