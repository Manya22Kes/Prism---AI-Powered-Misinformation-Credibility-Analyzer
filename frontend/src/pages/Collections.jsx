import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Plus, Trash2, Edit3, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { collectionApi } from '../services/api/collection.api';
import { EmptyState } from '../components/shared/EmptyState';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { cn } from '../utils/cn';
import { useCinematicStore } from '../store/cinematicStore';

export const Collections = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  
  const [itemToDelete, setItemToDelete] = useState(null);

  const setEnvironmentVault = useCinematicStore((state) => state.setEnvironmentVault);
  const setPrismPosition = useCinematicStore((state) => state.setPrismPosition);
  
  const queryClient = useQueryClient();

  React.useEffect(() => {
    setEnvironmentVault();
    setPrismPosition([0, 10, -10]);
  }, [setEnvironmentVault, setPrismPosition]);

  React.useEffect(() => {
    if (isCreateModalOpen) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') setIsCreateModalOpen(false);
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isCreateModalOpen]);

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['collections'],
    queryFn: () => collectionApi.getCollections(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => collectionApi.createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setIsCreateModalOpen(false);
      setNewCollectionName('');
      setNewCollectionDesc('');
      toast.success('Collection created');
    },
    onError: () => {
      toast.error('Failed to create collection');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => collectionApi.deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setItemToDelete(null);
      toast.success('Collection deleted');
    },
    onError: () => {
      toast.error('Failed to delete collection');
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    createMutation.mutate({ name: newCollectionName, description: newCollectionDesc });
  };

  const collections = response?.data || [];

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col pb-12 pt-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-prism-cyan/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="mb-6 sm:mb-8 text-center relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full glass-panel-strong border-prism-cyan/30 text-prism-cyan text-xs font-semibold tracking-widest uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          <Folder size={16} /> Intelligence Folders
        </motion.div>
        <h2 className="text-5xl font-light tracking-tight text-prism-text-primary mb-3">
          Collections
        </h2>
        <p className="text-lg text-prism-text-secondary max-w-2xl mx-auto font-light mb-6">
          Grouped investigation folders for multi-file deep dives and cross-referenced campaigns.
        </p>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus size={18} /> New Collection
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full z-10 relative">
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <span className="flex h-12 w-12 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prism-cyan opacity-40"></span>
              <span className="relative inline-flex rounded-full h-12 w-12 bg-prism-accent shadow-[0_0_30px_rgba(34,211,238,0.4)]"></span>
            </span>
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col h-64 items-center justify-center gap-4">
            <AlertCircle size={48} className="text-red-500 mb-2 opacity-80" />
            <div className="text-red-500 font-semibold text-xl">Failed to load collections</div>
            <Button variant="outline" onClick={() => refetch()} className="mt-4">Retry</Button>
          </div>
        )}

        {!isLoading && !isError && collections.length === 0 && (
          <div className="py-4 max-w-3xl mx-auto">
            <EmptyState 
              icon={Folder}
              title="No Collections Yet"
              description="Create your first collection to start organizing related reports and tracking complex narratives."
              actionLabel="Create Collection"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </div>
        )}

        {!isLoading && !isError && collections.length > 0 && (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                  className="relative block h-full group"
                >
                  <AnimatePresence>
                    {itemToDelete === item._id && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-prism-surface/95 backdrop-blur-2xl rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                      >
                        <Trash2 size={32} className="text-red-400 mb-3" />
                        <h4 className="text-lg font-medium text-prism-text-primary mb-1">Delete Collection?</h4>
                        <p className="text-xs text-prism-text-secondary mb-6">The reports inside will not be deleted.</p>
                        <div className="flex gap-3 w-full">
                          <Button variant="secondary" size="sm" className="flex-1 bg-prism-surface-active" onClick={() => setItemToDelete(null)}>Cancel</Button>
                          <Button variant="primary" size="sm" className="flex-1 bg-red-500 text-prism-text-primary border-red-500 hover:bg-red-600" onClick={() => deleteMutation.mutate(item._id)}>
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="absolute top-5 right-5 z-20 flex items-center gap-1">
                    <button 
                      className="p-2 rounded-lg text-prism-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setItemToDelete(item._id); }}
                      title="Delete Collection"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <Link to={`/collection/${item._id}`} className="block h-full relative z-10">
                    <Card glass hover className="h-full p-0 flex flex-col relative overflow-hidden bg-prism-surface-active/20">
                      <div className="p-6 relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 rounded-xl bg-prism-cyan/10 border border-prism-cyan/20 text-prism-cyan group-hover:text-prism-accent transition-colors shadow-inner">
                            <Folder size={24} />
                          </div>
                        </div>

                        <h4 className="text-xl font-medium text-prism-text-primary mb-2 line-clamp-1 group-hover:text-prism-cyan transition-colors">
                          {item.name}
                        </h4>
                        
                        <p className="text-sm font-light text-prism-text-secondary line-clamp-2 mb-6 h-10">
                          {item.description || 'No description provided.'}
                        </p>
                        
                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-prism-text-primary/5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-prism-high font-bold">{item.reports?.length + (item.batchReports?.length || 0)}</span>
                            <span className="text-xs uppercase tracking-widest text-prism-text-muted">Reports</span>
                          </div>
                          
                          <div className="w-8 h-8 rounded-full border border-prism-border flex items-center justify-center bg-prism-surface group-hover:bg-prism-surface-hover group-hover:border-prism-accent/50 transition-all">
                            <ChevronRight size={14} className="text-prism-text-muted group-hover:text-prism-cyan transition-colors" />
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
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCreateModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="relative w-full max-w-lg glass-panel-strong rounded-3xl p-8 border border-prism-text-primary/10 shadow-2xl"
            >
              <h3 className="text-2xl font-light text-prism-text-primary mb-6">Create Collection</h3>
              <form onSubmit={handleCreate}>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-prism-text-secondary mb-2">Name</label>
                    <input 
                      type="text" 
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="e.g. Disinformation Campaign Alpha" 
                      className="w-full h-12 px-4 bg-prism-surface border border-prism-border rounded-xl text-prism-text-primary focus:outline-none focus:ring-1 focus:ring-prism-cyan"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-prism-text-secondary mb-2">Description <span className="opacity-50">(Optional)</span></label>
                    <textarea 
                      value={newCollectionDesc}
                      onChange={(e) => setNewCollectionDesc(e.target.value)}
                      placeholder="Context about this investigation..." 
                      className="w-full h-24 p-4 bg-prism-surface border border-prism-border rounded-xl text-prism-text-primary focus:outline-none focus:ring-1 focus:ring-prism-cyan resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} type="button">Cancel</Button>
                  <Button variant="primary" type="submit" disabled={!newCollectionName.trim() || createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Collection'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
