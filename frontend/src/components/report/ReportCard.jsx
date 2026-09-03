import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, Trash2, ChevronRight, Layers, Link2, FileText, CheckSquare, Square } from 'lucide-react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { cn } from '../../utils/cn';
import { useComparisonStore } from '../../store/comparisonStore';

const TypeIcon = ({ type }) => {
  switch (type) {
    case 'batch': return <Layers size={18} />;
    case 'url': return <Link2 size={18} />;
    case 'file': return <FileText size={18} />;
    default: return <FileText size={18} />;
  }
};

const getScoreColor = (score) => {
  if (score >= 80) return 'text-prism-cyan';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-500';
};

const getScoreBgGlow = (score) => {
  if (score >= 80) return 'from-prism-cyan/20 to-transparent';
  if (score >= 50) return 'from-yellow-400/20 to-transparent';
  return 'from-red-500/20 to-transparent';
};

export const ReportCard = ({ 
  item, 
  variant = 'card', 
  onDelete, 
  onPin,
  isDeleting = false,
  deletePending = false,
  onCancelDelete,
  onConfirmDelete,
  from = 'archive'
}) => {
  const { hasReport, addReport, removeReport, selectedReports } = useComparisonStore();
  const isSelectedForComparison = hasReport(item.id);

  const handleCompareToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelectedForComparison) {
      removeReport(item.id);
    } else {
      const res = addReport(item);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const linkTarget = item.entityType === 'batch' || item.type === 'batch' || item.isBatch ? `/batch/${item.id}` : `/report/${item.id}`;
  const linkState = { fromArchive: from === 'archive', fromSaved: from === 'saved', fromActivity: from === 'activity', collectionId: from === 'collection' ? item.collectionId : undefined };

  if (variant === 'dense') {
    return (
      <div className="relative group">
        <Link to={linkTarget} state={linkState} className="block h-full">
          <div className={cn(
            "flex items-center gap-4 p-4 rounded-xl border transition-all overflow-hidden relative",
            isSelectedForComparison 
              ? "bg-prism-cyan/5 border-prism-cyan/40" 
              : "border-prism-border bg-prism-surface-active/20 hover:bg-prism-surface-active hover:border-prism-border/80"
          )}>
            <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b opacity-50 group-hover:opacity-100 transition-opacity", getScoreBgGlow(item.score).replace('to-transparent', 'to-transparent w-full opacity-10'))} />
            
            <button 
              onClick={handleCompareToggle}
              className={cn("absolute top-3 right-3 p-1.5 rounded-md transition-colors z-20 flex items-center gap-1.5 text-xs font-medium",
                isSelectedForComparison ? "bg-prism-cyan text-black hover:bg-prism-cyan/90" : "bg-prism-text-primary/5 text-prism-text-secondary hover:bg-prism-text-primary/10 hover:text-prism-text-primary"
              )}
            >
              {isSelectedForComparison ? <CheckSquare size={14} /> : <Square size={14} />}
              Compare
            </button>

            <div className="flex-shrink-0 p-3 rounded-xl bg-prism-surface border border-prism-border text-prism-text-secondary">
              <TypeIcon type={item.type || item.sourceType} />
            </div>
            
            <div className="flex-1 min-w-0 pr-24">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-mono text-prism-text-muted">{item.date || new Date(item.createdAt).toLocaleDateString()}</span>
                {item.isPinned && <Pin size={12} className="text-prism-accent fill-current" />}
              </div>
              <h4 className="text-base font-medium text-prism-text-primary truncate group-hover:text-prism-cyan transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-prism-text-muted truncate">
                {item.sourceUrl || item.originalInput || ''}
              </p>
            </div>

            <div className="flex-shrink-0 flex items-center gap-6 pr-4">
              <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase tracking-widest text-prism-text-muted mb-1">Verdict</span>
                <span className="text-xs font-semibold text-prism-text-primary tracking-wide uppercase">{item.verdict}</span>
              </div>
              <div className={cn("text-xl font-bold font-mono tracking-tighter w-10 text-center", getScoreColor(item.score))}>
                {item.score}
              </div>
              <ChevronRight size={18} className="text-prism-text-muted group-hover:text-prism-cyan transition-colors" />
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative block h-full group">
      {/* Delete Confirmation Overlay */}
      <AnimatePresence>
        {isDeleting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-prism-surface/95 backdrop-blur-2xl rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          >
            <Trash2 size={32} className="text-red-400 mb-3" />
            <h4 className="text-lg font-medium text-prism-text-primary mb-1">Delete Analysis?</h4>
            <p className="text-xs text-prism-text-secondary mb-6">This action is permanent and cannot be undone.</p>
            <div className="flex gap-3 w-full">
              <Button variant="secondary" size="sm" className="flex-1 bg-prism-surface-active" onClick={onCancelDelete}>Cancel</Button>
              <Button variant="primary" size="sm" className="flex-1 bg-red-500 text-prism-text-primary border-red-500 hover:bg-red-600" onClick={onConfirmDelete}>
                {deletePending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-5 right-5 z-20 flex items-center gap-1">
        {onPin && (
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPin(item.id); }}
            className={cn("p-2 rounded-lg transition-colors", item.isPinned ? "text-prism-accent bg-prism-accent/10 hover:bg-prism-accent/20" : "text-prism-text-muted hover:text-prism-text-primary hover:bg-prism-surface-hover")}
            title={item.isPinned ? "Unpin report" : "Pin report"}
          >
            <Pin size={16} className={item.isPinned ? "fill-current" : ""} />
          </button>
        )}
        {onDelete && (
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item.id); }}
            className="p-2 rounded-lg text-prism-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Delete report"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <Link to={linkTarget} state={linkState} className="block h-full relative z-10">
        <Card glass hover className={cn("h-full p-0 flex flex-col relative overflow-hidden transition-all", isSelectedForComparison ? "border-prism-cyan shadow-[0_0_15px_rgba(34,211,238,0.15)] bg-prism-surface" : "bg-prism-surface-active/20")}>
          
          <div className={cn("absolute top-0 left-0 w-full h-32 bg-gradient-to-b opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none", getScoreBgGlow(item.score))} />
          
          <div className="p-6 relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-xl bg-prism-surface border border-prism-border text-prism-text-secondary group-hover:text-prism-text-primary transition-colors shadow-inner">
                <TypeIcon type={item.type || item.sourceType} />
              </div>
              <div className="flex items-center pr-20">
                <span className="text-xs font-mono text-prism-text-muted">{item.date || new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <h4 className="text-lg font-medium text-prism-text-primary mb-2 line-clamp-2 leading-snug group-hover:text-prism-cyan transition-colors">
              {item.title}
            </h4>
            
            {(item.sourceUrl || item.originalInput) && (
              <p className="text-xs font-mono text-prism-text-muted line-clamp-1 mb-2 truncate group-hover:text-prism-text-primary transition-colors">
                {item.sourceUrl || item.originalInput}
              </p>
            )}
            
            <div className="mt-auto pt-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full border border-prism-border bg-prism-surface/50">
                  <span className={cn("text-lg font-bold font-mono tracking-tighter", getScoreColor(item.score))}>{item.score}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-prism-text-muted mb-0.5">Verdict</span>
                  <span className="text-xs font-semibold text-prism-text-primary tracking-wide uppercase">{item.verdict}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleCompareToggle}
                  className={cn("px-3 h-8 rounded-full border flex items-center gap-1.5 justify-center transition-all z-20 text-xs font-medium", 
                    isSelectedForComparison ? "border-prism-cyan bg-prism-cyan/10 text-prism-cyan hover:bg-prism-cyan/20" : "border-prism-border bg-prism-surface group-hover:border-prism-accent/30 text-prism-text-secondary hover:text-prism-cyan"
                  )}
                  title="Compare"
                >
                  {isSelectedForComparison ? <CheckSquare size={14} /> : <Square size={14} />}
                  <span>Compare</span>
                </button>
                <div className="w-8 h-8 rounded-full border border-prism-border flex items-center justify-center bg-prism-surface group-hover:bg-prism-surface-hover group-hover:border-prism-accent/50 transition-all shrink-0">
                  <ChevronRight size={14} className="text-prism-text-muted group-hover:text-prism-cyan transition-colors translate-x-[-1px] group-hover:translate-x-[1px]" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
};
