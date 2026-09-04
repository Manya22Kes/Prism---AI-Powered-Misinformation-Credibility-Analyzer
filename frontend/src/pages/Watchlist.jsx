import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, RefreshCw, Trash2, PauseCircle, PlayCircle, AlertCircle, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { watchlistApi } from '../services/api/watchlist.api';
import { Button } from '../components/shared/Button';
import { EmptyState } from '../components/shared/EmptyState';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';
import { useCinematicStore } from '../store/cinematicStore';
import { AddWatchlistModal } from '../components/watchlist/AddWatchlistModal';
import { WatchlistHistory } from '../components/watchlist/WatchlistHistory';

const getScoreColor = (score) => {
  if (score == null) return 'text-prism-text-muted';
  if (score >= 80) return 'text-prism-cyan';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-500';
};

export const Watchlist = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const setEnvironmentVault = useCinematicStore((state) => state.setEnvironmentVault);
  const setPrismPosition = useCinematicStore((state) => state.setPrismPosition);
  
  const queryClient = useQueryClient();

  React.useEffect(() => {
    setEnvironmentVault();
    setPrismPosition([0, 10, -10]);
  }, [setEnvironmentVault, setPrismPosition]);

  React.useEffect(() => {
    if (isAddModalOpen || itemToDelete) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          setIsAddModalOpen(false);
          setItemToDelete(null);
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isAddModalOpen, itemToDelete]);

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => watchlistApi.getWatchlistItems(),
  });

  const items = response?.data || [];

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => watchlistApi.deleteWatchlistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      setItemToDelete(null);
      toast.success('Watchlist item deleted');
    },
    onError: () => {
      toast.error('Failed to delete watchlist item');
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => watchlistApi.updateWatchlistItem(id, { isActive: !isActive }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      if (variables.isActive) {
        toast.success('Watchlist item paused');
      } else {
        toast.success('Watchlist item resumed');
      }
    },
    onError: () => {
      toast.error('Failed to update watchlist item');
    }
  });

  const checkMutation = useMutation({
    mutationFn: (id) => watchlistApi.checkWatchlistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Watchlist check initiated');
    },
    onError: () => {
      toast.error('Failed to initiate watchlist check');
    }
  });

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col pb-12 pt-4 sm:pt-6 relative w-full min-w-0">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-prism-cyan/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="mb-6 sm:mb-8 text-center relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full glass-panel-strong border-prism-cyan/30 text-prism-cyan text-xs font-semibold tracking-widest uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          <Activity size={16} /> Live Intelligence
        </motion.div>
        <h2 className="text-4xl font-light tracking-tight text-prism-text-primary mb-3">
          Watchlist
        </h2>
        <p className="text-base text-prism-text-secondary max-w-2xl mx-auto font-light mb-6">
          Monitor specific URLs, publishers, and topics over time for changes in credibility and bias.
        </p>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus size={18} /> Add Watch Item
        </Button>
      </div>

      <div className="flex-1 w-full z-10 relative">
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <span className="flex h-8 w-8 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prism-cyan opacity-40"></span>
              <span className="relative inline-flex rounded-full h-8 w-8 bg-prism-accent shadow-[0_0_20px_rgba(34,211,238,0.4)]"></span>
            </span>
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col h-64 items-center justify-center gap-4">
            <AlertCircle size={48} className="text-red-500 mb-2 opacity-80" />
            <div className="text-red-500 font-semibold text-xl">Failed to load watchlist</div>
            <Button variant="outline" onClick={() => refetch()} className="mt-4">Retry</Button>
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div className="flex flex-col gap-3">
            {items.map((item) => {
              const isExpanded = expandedItems.has(item._id);
              const hasChange = item.history && item.history.length > 0 && item.history[item.history.length - 1].scoreChange !== null && item.history[item.history.length - 1].scoreChange !== 0;
              const lastChange = hasChange ? item.history[item.history.length - 1].scoreChange : null;
              
              let statusLabel = item.isActive ? "ACTIVE" : "PAUSED";
              if (item.isActive && !item.lastCheckedAt) statusLabel = "NEVER CHECKED";
              
              return (
                <div key={item._id} className="rounded-xl border border-prism-border bg-prism-surface overflow-hidden shadow-prism-md">
                  
                  {/* Main Row */}
                  <div className={cn(
                    "flex flex-col md:flex-row items-stretch md:items-center p-3.5 sm:p-4 gap-3 sm:gap-4 transition-colors relative min-w-0 w-full",
                    hasChange ? "bg-prism-surface-active/30" : "bg-prism-surface"
                  )}>
                    {hasChange && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-prism-cyan" />
                    )}
                    
                    {/* Expand Toggle & Basic Info */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full">
                      <button 
                        onClick={() => toggleExpand(item._id)}
                        className="p-1 rounded hover:bg-prism-surface-active text-prism-text-muted hover:text-prism-text-primary transition-colors shrink-0"
                      >
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </button>
                      
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-medium text-prism-text-primary truncate min-w-0 flex-1">{item.name}</h4>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-widest shrink-0",
                            statusLabel === 'ACTIVE' ? "bg-prism-cyan/10 border-prism-cyan/30 text-prism-cyan" :
                            statusLabel === 'PAUSED' ? "bg-prism-surface-hover border-prism-text-muted/50 text-prism-text-muted" :
                            "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                          )}>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-prism-text-secondary min-w-0 w-full">
                          <span className="font-semibold uppercase text-prism-text-muted tracking-wider shrink-0">{item.targetType}</span>
                          <span className="opacity-50 shrink-0">•</span>
                          <span className="truncate min-w-0 flex-1" title={item.target}>{item.target}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 px-3.5 py-2.5 bg-prism-surface-active/20 rounded-lg md:bg-transparent md:px-0 md:py-0 w-full md:w-auto min-w-0">
                      <div className="flex flex-col items-center md:items-start shrink-0">
                        <span className="text-[10px] uppercase tracking-widest text-prism-text-muted mb-1">Latest Score</span>
                        <div className="flex items-center justify-center gap-2">
                          <span className={cn("text-xl font-bold font-mono tracking-tighter leading-none", getScoreColor(item.lastScore))}>
                            {item.lastScore != null ? item.lastScore : '--'}
                          </span>
                          {lastChange != null && (
                            <span className={cn("text-xs font-mono", lastChange > 0 ? "text-prism-high" : "text-prism-low")}>
                              ({lastChange > 0 ? '+' : ''}{lastChange})
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center md:items-start text-center md:text-left min-w-0 flex-1 md:flex-initial md:min-w-[120px]">
                        <span className="text-[10px] uppercase tracking-widest text-prism-text-muted mb-1">Verdict</span>
                        <span className="text-xs sm:text-sm text-prism-text-primary truncate max-w-full">
                          {item.lastVerdict || 'Pending'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col min-w-[100px] hidden lg:flex items-center text-center">
                        <span className="text-[10px] uppercase tracking-widest text-prism-text-muted mb-1">Last Checked</span>
                        <span className="text-sm text-prism-text-secondary font-mono">
                          {item.lastCheckedAt ? new Date(item.lastCheckedAt).toLocaleDateString('en-GB') : 'Never'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 border-t border-prism-border/40 md:border-none pt-3 md:pt-0 w-full md:w-auto">
                      <div className="flex items-center gap-1">
                        {item.lastAnalysisId && (
                          <Link to={`/report/${item.lastAnalysisId}`} className="p-2 rounded-lg text-prism-text-muted hover:text-prism-cyan hover:bg-prism-surface-hover transition-colors" title="View Latest Report">
                            <ExternalLink size={18} />
                          </Link>
                        )}
                        
                        <button 
                          onClick={() => toggleActiveMutation.mutate({ id: item._id, isActive: item.isActive })}
                          className="p-2 rounded-lg text-prism-text-muted hover:text-prism-text-primary hover:bg-prism-surface-hover transition-colors"
                          title={item.isActive ? "Pause Monitoring" : "Resume Monitoring"}
                        >
                          {item.isActive ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                        </button>
                        
                        <button 
                          onClick={() => setItemToDelete(item._id)}
                          className="p-2 rounded-lg text-prism-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          title="Delete Watch Item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <Button 
                        variant="secondary" 
                        size="sm"
                        disabled={checkMutation.isPending && checkMutation.variables === item._id}
                        onClick={() => checkMutation.mutate(item._id)}
                        className={cn("gap-1.5 sm:gap-2 ml-auto md:ml-2 text-xs", item.targetType !== 'URL' && "opacity-50 cursor-not-allowed")}
                        title={item.targetType !== 'URL' ? "Manual checking only supported for URLs currently" : "Check now"}
                      >
                        <RefreshCw size={14} className={cn(checkMutation.isPending && checkMutation.variables === item._id && "animate-spin")} />
                        {checkMutation.isPending && checkMutation.variables === item._id ? 'Checking...' : 'Check Now'}
                      </Button>
                    </div>
                  </div>

                  {/* Delete Confirmation Overlay */}
                  <AnimatePresence>
                    {itemToDelete === item._id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 bg-prism-surface-active/90 border-t border-prism-border flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Trash2 size={20} className="text-red-400 shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-prism-text-primary block">Remove item from Watchlist?</span>
                            <span className="text-xs text-prism-text-secondary">Historical checks and analytics for this target will be removed.</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="secondary" size="sm" onClick={() => setItemToDelete(null)}>Cancel</Button>
                          <Button variant="primary" size="sm" className="bg-red-500 text-white border-red-500 hover:bg-red-600" onClick={() => deleteMutation.mutate(item._id)}>
                            {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Status Banner for meaning changes or errors */}
                  {(checkMutation.isError && checkMutation.variables === item._id) && (
                    <div className="bg-red-500/10 border-t border-red-500/20 px-4 py-2 text-xs text-red-400 flex items-center gap-2">
                      <AlertCircle size={14} /> Failed to check item: {checkMutation.error?.response?.data?.message || checkMutation.error?.message}
                    </div>
                  )}
                  {(checkMutation.isSuccess && checkMutation.variables === item._id && !hasChange && item.history?.length > 1) && (
                    <div className="bg-prism-surface-active border-t border-prism-border/40 px-4 py-2 text-xs text-prism-text-muted flex items-center gap-2">
                      <Activity size={14} /> No significant change detected in the latest analysis.
                    </div>
                  )}

                  {/* History View */}
                  <WatchlistHistory history={item.history} isExpanded={isExpanded} />
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="py-4 flex justify-center">
            <EmptyState 
              icon={Activity}
              title="Your watchlist is empty"
              description="Add URLs, publishers, or topics to monitor their credibility over time."
              actionLabel="Add First Watch Item"
              onAction={() => setIsAddModalOpen(true)}
            />
          </div>
        )}
      </div>

      <AddWatchlistModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
};
