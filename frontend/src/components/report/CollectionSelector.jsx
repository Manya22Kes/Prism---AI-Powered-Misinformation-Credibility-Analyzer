import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, FolderPlus, Folder, Check, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { historyApi } from '../../services/api/history.api';
import { collectionApi } from '../../services/api/collection.api';
import { Button } from '../shared/Button';
import { cn } from '../../utils/cn';

export const CollectionSelector = ({ reportId, isSaved: initialIsSaved, isBatch = false, onClose }) => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Fetch all collections
  const { data: response, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => collectionApi.getCollections(),
  });

  const collections = response?.data || [];

  // Determine if this report is in a given collection
  const isInCollection = (collection) => {
    if (isBatch) {
      return collection.batchReports?.includes(reportId);
    }
    return collection.reports?.includes(reportId);
  };

  const saveMutation = useMutation({
    mutationFn: () => historyApi.toggleSave(reportId),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['savedReports'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      // If we are in ReportView or BatchDashboard, we might need to invalidate their specific query
      if (isBatch) {
        queryClient.invalidateQueries({ queryKey: ['batch', reportId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      }
      if (data?.isSaved) {
        toast.success('Saved to Saved Reports');
      } else {
        toast.success('Removed from Saved Reports');
      }
    },
    onError: () => {
      toast.error('Failed to update saved status');
    }
  });

  const addReportMutation = useMutation({
    mutationFn: (collectionId) => collectionApi.addReportToCollection(collectionId, reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection'] });
      toast.success('Added to collection');
    },
    onError: () => {
      toast.error('Failed to add to collection');
    }
  });

  const removeReportMutation = useMutation({
    mutationFn: (collectionId) => collectionApi.removeReportFromCollection(collectionId, reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collection'] });
      toast.success('Removed from collection');
    },
    onError: () => {
      toast.error('Failed to remove from collection');
    }
  });

  const createCollectionMutation = useMutation({
    mutationFn: (name) => collectionApi.createCollection({ name }),
    onSuccess: (res) => {
      const newCol = res.data;
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      // Automatically add this report to the new collection
      addReportMutation.mutate(newCol._id);
      setIsCreating(false);
      setNewCollectionName('');
      toast.success('Collection created');
      // Also ensure it is saved
      if (!initialIsSaved && !saveMutation.isPending) {
        saveMutation.mutate();
      }
    },
    onError: () => {
      toast.error('Failed to create collection');
    }
  });

  const toggleCollection = (collection) => {
    if (isInCollection(collection)) {
      removeReportMutation.mutate(collection._id);
    } else {
      addReportMutation.mutate(collection._id);
      // Automatically save if adding to collection
      if (!initialIsSaved && !saveMutation.isPending) {
        saveMutation.mutate();
      }
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      createCollectionMutation.mutate(newCollectionName);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-full right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] glass-panel-strong rounded-2xl border border-prism-text-primary/10 shadow-2xl overflow-hidden z-50 origin-top-right flex flex-col"
    >
      <div className="p-4 border-b border-prism-text-primary/10 flex items-center justify-between bg-prism-surface-active/30">
        <h4 className="text-sm font-medium text-prism-text-primary flex items-center gap-2">
          <Bookmark size={16} className={initialIsSaved ? "fill-prism-cyan text-prism-cyan" : "text-prism-text-muted"} />
          Save to...
        </h4>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-prism-text-primary/10 text-prism-text-muted hover:text-prism-text-primary transition-colors">
          <X size={14} />
        </button>
      </div>
      
      <div className="p-2">
        <button 
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-prism-surface-active transition-colors text-left"
          onClick={() => saveMutation.mutate()}
        >
          <span className="text-sm text-prism-text-primary">Saved Reports</span>
          <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", initialIsSaved ? "bg-prism-cyan border-prism-cyan" : "border-prism-text-muted/50")}>
            {initialIsSaved && <Check size={12} className="text-black" />}
          </div>
        </button>
      </div>

      <div className="h-px bg-prism-text-primary/10 mx-4 my-1" />

      <div className="max-h-48 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {isLoading ? (
          <div className="text-xs text-center text-prism-text-muted py-4">Loading collections...</div>
        ) : collections.length === 0 ? (
          <div className="text-xs text-center text-prism-text-muted py-4">No collections yet</div>
        ) : (
          collections.map(col => {
            const inCol = isInCollection(col);
            return (
              <button 
                key={col._id}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-prism-surface-active transition-colors text-left group"
                onClick={() => toggleCollection(col)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Folder size={16} className={inCol ? "text-prism-cyan" : "text-prism-text-muted"} />
                  <span className="text-sm text-prism-text-primary truncate">{col.name}</span>
                </div>
                <div className={cn("w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors", inCol ? "bg-prism-cyan border-prism-cyan" : "border-prism-text-muted/50")}>
                  {inCol && <Check size={12} className="text-black" />}
                </div>
              </button>
            )
          })
        )}
      </div>

      <div className="p-3 border-t border-prism-text-primary/10 bg-prism-surface-active/20">
        {isCreating ? (
          <form onSubmit={handleCreate} className="flex gap-2">
            <input 
              type="text" 
              autoFocus
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name" 
              className="flex-1 h-8 px-3 text-xs bg-prism-surface border border-prism-border rounded-lg text-prism-text-primary focus:outline-none focus:border-prism-cyan"
            />
            <Button variant="primary" size="sm" type="submit" disabled={!newCollectionName.trim() || createCollectionMutation.isPending} className="h-8 px-3 shrink-0">
              {createCollectionMutation.isPending ? '...' : 'Add'}
            </Button>
          </form>
        ) : (
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-prism-cyan hover:bg-prism-cyan/10 transition-colors"
          >
            <Plus size={16} /> Create Collection
          </button>
        )}
      </div>
    </motion.div>
  );
};
