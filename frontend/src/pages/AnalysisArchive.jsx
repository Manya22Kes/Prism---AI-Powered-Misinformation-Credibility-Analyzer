import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Pin, ShieldCheck, AlertCircle, Library } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { historyApi } from '../services/api/history.api';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import { cn } from '../utils/cn';
import { useCinematicStore } from '../store/cinematicStore';
import { ReportCard } from '../components/report/ReportCard';



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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      if (data && data.isPinned) {
        toast.success('Report pinned');
      } else {
        toast.success('Report unpinned');
      }
    },
    onError: (err, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['history'], context.previousData);
      }
      toast.error('Failed to update pin status');
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

  const archiveData = (response?.data || []).map((item) => {
    const analysis = item.analysis || {};
    const metadata = item.metadata || {};
    const isBatch = item.isBatch;
    
    let calculatedTitle;
    let subtitle = '';

    if (isBatch) {
      calculatedTitle = 'Batch Analysis Synthesis';
      subtitle = 'Batch Process';
    } else {
      // Use explicit title, or filename, or a snippet of the text, or fallback
      calculatedTitle = metadata.title || metadata.file?.originalname;
      
      if (!calculatedTitle && item.originalInput && item.sourceType === 'text') {
        calculatedTitle = item.originalInput.length > 50 
          ? item.originalInput.substring(0, 50) + '...' 
          : item.originalInput;
      }
      
      calculatedTitle = calculatedTitle || 'Analysis Report';
      
      if (metadata.urlMetadata?.canonicalUrl || metadata.urlMetadata?.domain) {
        subtitle = metadata.urlMetadata.canonicalUrl || metadata.urlMetadata.domain;
      } else if (metadata.file?.originalname && calculatedTitle !== metadata.file.originalname) {
        subtitle = metadata.file.originalname;
      } else if (item.sourceType) {
        subtitle = `${item.sourceType.charAt(0).toUpperCase() + item.sourceType.slice(1)} Analysis`;
      }
    }

    return {
      id: item._id,
      title: calculatedTitle,
      type: isBatch ? 'batch' : (item.sourceType?.toLowerCase() || 'text'),
      sourceUrl: subtitle,
      score: isBatch ? (analysis.sourceComparisons?.consistencyScore || 0) : (analysis.score || (analysis.credibility?.score || 0)),
      verdict: isBatch ? (analysis.overallCredibility || 'Mixed') : (analysis.overallVerdict?.label || analysis.verdict || 'Unknown'),
      date: new Date(item.createdAt).toLocaleDateString(),
      isPinned: !!item.isPinned,
      isBatch: !!isBatch,
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
    <div className="max-w-7xl mx-auto h-full flex flex-col pb-12 pt-6 relative">
      
      {/* Background Vault Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="mb-8 text-center relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full glass-panel-strong border-prism-cyan/30 text-prism-cyan text-xs font-semibold tracking-widest uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          <Library size={16} /> Everything Analyzed
        </motion.div>
        <h2 className="text-5xl font-light tracking-tight text-prism-text-primary mb-4">
          Analysis Archive
        </h2>
        <p className="text-lg text-prism-text-secondary max-w-2xl mx-auto font-light">
          Complete historical record of all single documents, web links, raw texts, and batch runs analyzed by Prism.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 z-20 relative max-w-4xl mx-auto w-full">
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
                  className="relative block h-full group"
                >
                  <ReportCard
                    item={item}
                    variant="card"
                    isDeleting={itemToDelete === item.id}
                    deletePending={deleteMutation.isPending}
                    onPin={() => pinMutation.mutate(item.id)}
                    onDelete={() => setItemToDelete(item.id)}
                    onConfirmDelete={() => deleteMutation.mutate(item.id)}
                    onCancelDelete={() => setItemToDelete(null)}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
        
        {/* Empty States */}
        {!isLoading && !isError && filteredData.length === 0 && (
          <div className="py-6 flex justify-center">
            <EmptyState 
              icon={searchQuery ? Search : ShieldCheck}
              title={searchQuery ? 'No results found' : (filter === 'pinned' ? 'Nothing pinned yet.' : 'No analyses yet.')}
              description={searchQuery 
                ? `No reports matched your search for "${searchQuery}".` 
                : (filter === 'pinned' 
                  ? 'Pin analyses you want to keep close and they will appear here.'
                  : 'Analyze an article, document, URL, or image and your results will appear here.')}
              actionLabel={!searchQuery && filter === 'all' ? 'Analyze Something' : undefined}
              onAction={!searchQuery && filter === 'all' ? () => window.location.href = '/' : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
};
