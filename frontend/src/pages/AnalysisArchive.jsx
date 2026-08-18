import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Pin, Layers, Link2, FileText, ChevronRight, ShieldCheck, Trash2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyApi } from '../services/api/history.api';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { cn } from '../utils/cn';
import { useCinematicStore } from '../store/cinematicStore';

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

export const AnalysisArchive = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [itemToDelete, setItemToDelete] = useState(null);

  const setEnvironmentVault = useCinematicStore((state) => state.setEnvironmentVault);
  const setPrismPosition = useCinematicStore((state) => state.setPrismPosition);
  
  const queryClient = useQueryClient();

  React.useEffect(() => {
    setEnvironmentVault();
    // Hide or shift Prism away slightly
    setPrismPosition([0, 10, -10]);
  }, [setEnvironmentVault, setPrismPosition]);

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['history'],
    queryFn: () => historyApi.getHistory(),
  });

  const pinMutation = useMutation({
    mutationFn: (id) => historyApi.togglePin(id),
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['history'] });
      const previousData = queryClient.getQueryData(['history']);
      
      queryClient.setQueryData(['history'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map(item => 
            item._id === id ? { ...item, isPinned: !item.isPinned } : item
          )
        };
      });
      return { previousData };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['history'], context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => historyApi.deleteReport(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['history'] });
      const previousData = queryClient.getQueryData(['history']);
      
      queryClient.setQueryData(['history'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(item => item._id !== id)
        };
      });
      setItemToDelete(null); // Close modal
      return { previousData };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['history'], context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    }
  });

  const handlePin = (e, id) => {
    e.preventDefault(); // prevent link navigation
    e.stopPropagation();
    pinMutation.mutate(id);
  };

  const handleDeleteClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  const archiveData = (response?.data || []).map((item) => {
    const analysis = item.analysis || {};
    const metadata = item.metadata || {};
    const isBatch = item.isBatch;
    
    // Attempt to extract source URL/domain for searching and display
    const url = metadata.urlMetadata?.canonicalUrl || metadata.urlMetadata?.domain || '';

    return {
      id: item._id,
      title: isBatch ? 'Batch Analysis Synthesis' : (metadata.title || metadata.file?.originalname || metadata.sourceType || 'Analysis Report'),
      type: isBatch ? 'batch' : (metadata.sourceType?.toLowerCase() || 'text'),
      sourceUrl: url,
      score: isBatch ? (analysis.sourceComparisons?.consistencyScore || 0) : (analysis.score || (analysis.credibility?.score || 0)),
      verdict: isBatch ? (analysis.overallCredibility || 'Mixed') : (analysis.overallVerdict?.label || analysis.verdict || 'Unknown'),
      date: new Date(item.createdAt).toLocaleDateString(),
      isPinned: !!item.isPinned,
    };
  });

  const filteredData = archiveData.filter(item => {
    if (filter === 'pinned' && !item.isPinned) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchUrl = item.sourceUrl.toLowerCase().includes(q);
      const matchType = item.type.toLowerCase().includes(q);
      if (!matchTitle && !matchUrl && !matchType) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col pb-20 pt-8 relative">
      
      {/* Background Vault Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-prism-accent/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="mb-12 text-center relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full glass-panel-strong border-prism-accent/30 text-prism-accent text-xs font-semibold tracking-widest uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          <ShieldCheck size={16} /> Secure Vault
        </motion.div>
        <h2 className="text-5xl font-light tracking-tight text-prism-text-primary mb-4">
          Analysis Archive
        </h2>
        <p className="text-lg text-prism-text-secondary max-w-2xl mx-auto font-light">
          Review, search, and synthesize past credibility reports stored securely in the intelligence vault.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12 z-20 relative max-w-4xl mx-auto w-full">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-prism-text-muted group-focus-within:text-prism-accent transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search reports by title, source domain, or type..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-14 pr-6 bg-prism-surface border border-prism-border rounded-2xl text-base text-prism-text-primary placeholder:text-prism-text-muted focus:outline-none focus:ring-2 focus:ring-prism-accent/50 focus:border-transparent transition-all shadow-[inset_0_2px_20px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)]"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={cn("px-6 py-2 rounded-2xl text-sm font-medium transition-all duration-300 border", filter === 'all' ? "bg-prism-surface-active border-prism-accent/50 text-prism-text-primary shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "bg-prism-surface border-prism-border text-prism-text-muted hover:text-prism-text-primary hover:bg-prism-surface-active/60")}
          >
            All Reports
          </button>
          <button 
            onClick={() => setFilter('pinned')}
            className={cn("px-6 py-2 flex items-center gap-2 rounded-2xl text-sm font-medium transition-all duration-300 border", filter === 'pinned' ? "bg-prism-surface-active border-prism-accent/50 text-prism-text-primary shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "bg-prism-surface border-prism-border text-prism-text-muted hover:text-prism-text-primary hover:bg-prism-surface-active/60")}
          >
            <Pin size={16} /> Pinned
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full z-10 relative">
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <span className="flex h-12 w-12 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prism-cyan opacity-40"></span>
              <span className="relative inline-flex rounded-full h-12 w-12 bg-prism-accent shadow-[0_0_30px_rgba(34,211,238,0.4)]"></span>
            </span>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="flex flex-col h-64 items-center justify-center gap-4">
            <AlertCircle size={48} className="text-red-500 mb-2 opacity-80" />
            <div className="text-red-500 font-semibold text-xl">Failed to load archive</div>
            <p className="text-prism-text-secondary">Could not securely connect to the intelligence vault.</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-4">Retry Connection</Button>
          </div>
        )}

        {/* Grid List */}
        {!isLoading && !isError && (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                >
                  <Link to={item.type === 'batch' ? `/batch/${item.id}` : `/report/${item.id}`} className="block h-full relative">
                    
                    {/* Delete Confirmation Overlay (Local) */}
                    <AnimatePresence>
                      {itemToDelete === item.id && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-50 glass-panel-strong backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center p-6 text-center border-red-500/30"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        >
                          <Trash2 size={32} className="text-red-400 mb-3" />
                          <h4 className="text-lg font-medium text-prism-text-primary mb-1">Delete Analysis?</h4>
                          <p className="text-xs text-prism-text-secondary mb-6">This action is permanent and cannot be undone.</p>
                          <div className="flex gap-3 w-full">
                            <Button variant="outline" size="sm" className="flex-1" onClick={cancelDelete}>Cancel</Button>
                            <Button variant="primary" size="sm" className="flex-1 bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30" onClick={confirmDelete}>
                              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Card glass hover className="h-full p-0 flex flex-col relative overflow-hidden group bg-prism-surface-active/20">
                      
                      {/* Glowing Accent based on score */}
                      <div className={cn("absolute top-0 left-0 w-full h-32 bg-gradient-to-b opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none", getScoreBgGlow(item.score))} />
                      
                      <div className="p-6 relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 rounded-xl bg-prism-surface border border-prism-border text-prism-text-secondary group-hover:text-prism-text-primary transition-colors shadow-inner">
                            <TypeIcon type={item.type} />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-prism-text-muted">{item.date}</span>
                            <button 
                              onClick={(e) => handlePin(e, item.id)}
                              className={cn("p-1.5 rounded-md transition-colors", item.isPinned ? "text-prism-accent bg-prism-accent/10" : "text-prism-text-muted hover:bg-prism-surface-hover")}
                              title={item.isPinned ? "Unpin report" : "Pin report"}
                            >
                              <Pin size={16} className={item.isPinned ? "fill-current" : ""} />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteClick(e, item.id)}
                              className="p-1.5 rounded-md text-prism-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                              title="Delete report"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-lg font-medium text-prism-text-primary mb-2 line-clamp-2 leading-snug group-hover:text-prism-cyan transition-colors">
                          {item.title}
                        </h4>
                        
                        {item.sourceUrl && (
                          <p className="text-xs font-mono text-prism-text-muted line-clamp-1 mb-2 truncate">
                            {item.sourceUrl}
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
                          
                          <div className="w-8 h-8 rounded-full border border-prism-border flex items-center justify-center bg-prism-surface group-hover:bg-prism-surface-hover group-hover:border-prism-accent/50 transition-all">
                            <ChevronRight size={14} className="text-prism-text-muted group-hover:text-prism-cyan transition-colors translate-x-[-1px] group-hover:translate-x-[1px]" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
        
        {/* Empty States */}
        {!isLoading && !isError && filteredData.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 flex flex-col items-center"
          >
            <ShieldCheck size={56} className="text-prism-text-muted/30 mb-6" />
            <h3 className="text-2xl font-light text-prism-text-primary mb-3">
              {filter === 'pinned' ? 'Nothing pinned yet.' : 'No analyses yet.'}
            </h3>
            <p className="text-prism-text-secondary font-light max-w-sm mb-8">
              {filter === 'pinned' 
                ? 'Pin analyses you want to keep close and they will appear here.'
                : 'Analyze an article, document, URL, or image and your results will appear here.'}
            </p>
            {filter === 'all' && (
              <Link to="/">
                <Button variant="primary" className="px-8">Analyze Something</Button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
