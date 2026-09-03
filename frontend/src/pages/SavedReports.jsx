import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bookmark, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyApi } from '../services/api/history.api';
import { collectionApi } from '../services/api/collection.api';
import toast from 'react-hot-toast';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import { ReportCard } from '../components/report/ReportCard';
import { useCinematicStore } from '../store/cinematicStore';

export const SavedReports = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const setEnvironmentVault = useCinematicStore((state) => state.setEnvironmentVault);
  const setPrismPosition = useCinematicStore((state) => state.setPrismPosition);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    setEnvironmentVault();
    setPrismPosition([0, 10, -10]);
  }, [setEnvironmentVault, setPrismPosition]);

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['savedReports'],
    queryFn: () => historyApi.getSavedReports(),
  });

  const { data: collectionsResponse } = useQuery({
    queryKey: ['collections'],
    queryFn: () => collectionApi.getCollections(),
  });
  
  const collections = collectionsResponse?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id) => historyApi.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Report removed successfully');
      setItemToDelete(null);
    },
    onError: () => {
      toast.error('Failed to remove report');
    }
  });

  const pinMutation = useMutation({
    mutationFn: (id) => historyApi.togglePin(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['savedReports'] });
      const previousData = queryClient.getQueryData(['savedReports']);
      
      queryClient.setQueryData(['savedReports'], (old) => {
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
      queryClient.setQueryData(['savedReports'], context.previousData);
      toast.error('Failed to update pin status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
    },
    onSuccess: (data) => {
      if (data && data.isPinned) {
        toast.success('Report pinned');
      } else {
        toast.success('Report unpinned');
      }
    }
  });

  const savedData = (response?.data || []).map((item) => {
    const analysis = item.analysis || {};
    const metadata = item.metadata || {};
    const isBatch = item.isBatch;
    
    let calculatedTitle;
    let subtitle = '';

    if (isBatch) {
      calculatedTitle = item.batchName || 'Batch Analysis Synthesis';
      subtitle = 'Batch Process';
    } else {
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

    const itemCollections = collections.filter(c => {
      if (isBatch) return c.batchReports?.includes(item._id);
      return c.reports?.includes(item._id);
    });

    return {
      id: item._id,
      title: calculatedTitle,
      type: isBatch ? 'batch' : (item.sourceType?.toLowerCase() || 'text'),
      sourceUrl: subtitle,
      score: isBatch ? (analysis.sourceComparisons?.consistencyScore || 0) : (analysis.score || (analysis.credibility?.score || 0)),
      verdict: isBatch ? (analysis.overallCredibility || 'Mixed') : (analysis.overallVerdict?.label || analysis.verdict || 'Unknown'),
      date: new Date(item.createdAt).toLocaleDateString(),
      isPinned: !!item.isPinned,
      isBatch,
      collections: itemCollections,
    };
  });

  const filteredData = savedData.filter(item => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchUrl = item.sourceUrl?.toLowerCase().includes(q);
      const matchType = item.type?.toLowerCase().includes(q);
      if (!matchTitle && !matchUrl && !matchType) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col pb-12 pt-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-prism-accent/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="mb-6 text-center relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full glass-panel-strong border-prism-accent/30 text-prism-cyan text-xs font-semibold tracking-widest uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          <Bookmark size={16} /> Saved Analyses
        </motion.div>
        <h2 className="text-4xl font-light tracking-tight text-prism-text-primary mb-3">
          Saved Analyses Workspace
        </h2>
        <p className="text-base text-prism-text-secondary max-w-2xl mx-auto font-light">
          Analyses intentionally kept for later reference, organization, and synthesis.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 z-20 relative max-w-2xl mx-auto w-full">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-prism-text-muted group-focus-within:text-prism-accent transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search saved reports by title, domain, or type..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-6 bg-prism-surface border border-prism-border rounded-xl text-sm text-prism-text-primary placeholder:text-prism-text-muted focus:outline-none focus:ring-1 focus:ring-prism-accent/50 focus:border-transparent transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]"
          />
        </div>
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
            <div className="text-red-500 font-semibold text-xl">Failed to load saved reports</div>
            <p className="text-prism-text-secondary">Could not retrieve saved items.</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-4">Retry</Button>
          </div>
        )}

        {!isLoading && !isError && filteredData.length > 0 && (
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
                    from="saved"
                    isDeleting={itemToDelete === item.id}
                    deletePending={deleteMutation.isPending}
                    onPin={() => pinMutation.mutate(item.id)}
                    onDelete={() => setItemToDelete(item.id)}
                    onConfirmDelete={() => {
                      deleteMutation.mutate(item.id);
                      setItemToDelete(null);
                    }}
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
              icon={searchQuery ? Search : Bookmark}
              title={searchQuery ? 'No results found' : 'No saved analyses yet.'}
              description={searchQuery
                ? `No saved reports matched your search for "${searchQuery}".`
                : "Save important investigations here for quick access and future organization into collections."}
              actionLabel={!searchQuery ? "Return to Workspace" : undefined}
              onAction={!searchQuery ? () => window.location.href = '/' : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
};
