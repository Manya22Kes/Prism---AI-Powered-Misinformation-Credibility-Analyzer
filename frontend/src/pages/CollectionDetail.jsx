import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit3, Trash2, Folder, FileText } from 'lucide-react';
import { collectionApi } from '../services/api/collection.api';
import { Button } from '../components/shared/Button';
import { ReportCard } from '../components/report/ReportCard';
import toast from 'react-hot-toast';

export const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  React.useEffect(() => {
    if (isEditModalOpen) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') setIsEditModalOpen(false);
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isEditModalOpen]);

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['collection', id],
    queryFn: () => collectionApi.getCollectionById(id),
  });

  const collection = response?.data;

  const updateMutation = useMutation({
    mutationFn: (data) => collectionApi.updateCollection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', id] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setIsEditModalOpen(false);
      toast.success('Collection updated');
    },
    onError: () => {
      toast.error('Failed to update collection');
    }
  });

  const removeReportMutation = useMutation({
    mutationFn: (reportId) => collectionApi.removeReportFromCollection(id, reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', id] });
      toast.success('Report removed from collection');
    },
    onError: () => {
      toast.error('Failed to remove report from collection');
    }
  });

  const handleEdit = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateMutation.mutate({ name: editName, description: editDesc });
  };

  const openEditModal = () => {
    setEditName(collection?.name || '');
    setEditDesc(collection?.description || '');
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center pt-20">
        <span className="flex h-12 w-12 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prism-cyan opacity-40"></span>
          <span className="relative inline-flex rounded-full h-12 w-12 bg-prism-accent shadow-[0_0_30px_rgba(34,211,238,0.4)]"></span>
        </span>
      </div>
    );
  }

  if (isError || !collection) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4 pt-20">
        <div className="text-red-500 font-semibold text-xl">Failed to load collection</div>
        <Button variant="outline" onClick={() => navigate('/collections')} className="mt-4">Go Back</Button>
      </div>
    );
  }

  // Map reports for display
  const allReports = [
    ...(collection.reports || []).map(r => ({ ...r, isBatch: false })),
    ...(collection.batchReports || []).map(r => ({ ...r, isBatch: true }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const displayData = allReports.map((item) => {
    const analysis = item.analysis || {};
    const metadata = item.metadata || {};
    const isBatch = item.isBatch;

    let calculatedTitle;
    let subtitle = '';

    if (isBatch) {
      calculatedTitle = item.batchName || 'Batch Analysis';
      const fileCount = metadata.batch?.fileCount || 0;
      subtitle = `${fileCount} Document${fileCount !== 1 ? 's' : ''}`;
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

    return {
      id: item._id,
      title: calculatedTitle,
      type: isBatch ? 'batch' : (item.sourceType?.toLowerCase() || 'text'),
      sourceUrl: subtitle,
      score: isBatch ? (analysis.sourceComparisons?.consistencyScore || 0) : (analysis.score || (analysis.credibility?.score || 0)),
      verdict: isBatch ? (analysis.overallCredibility || 'Mixed') : (analysis.overallVerdict?.label || analysis.verdict || 'Unknown'),
      date: new Date(item.createdAt).toLocaleDateString(),
    };
  });

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col pb-20 pt-24 relative px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-prism-cyan/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="mb-12 relative z-10 flex flex-col items-start">
        <Link to="/collections" className="flex items-center gap-2 text-prism-text-muted hover:text-prism-cyan transition-colors mb-6 group text-sm font-medium">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Collections
        </Link>
        <div className="flex justify-between w-full items-start">
          <div>
            <h1 className="text-4xl lg:text-5xl font-light text-prism-text-primary mb-4 tracking-tight flex items-center gap-4">
              <Folder size={32} className="text-prism-cyan" /> {collection.name}
            </h1>
            <p className="text-prism-text-secondary text-lg max-w-2xl font-light mb-4">
              {collection.description || 'No description provided.'}
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-prism-text-muted">
              <span>CREATED: {new Date(collection.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{allReports.length} REPORTS</span>
            </div>
          </div>
          <Button variant="outline" onClick={openEditModal} className="gap-2 shrink-0">
            <Edit3 size={16} /> Edit Details
          </Button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="flex-1 w-full z-10 relative">
        {displayData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 glass-panel p-12 rounded-3xl border-dashed border-prism-text-primary/10 text-center max-w-3xl mx-auto">
            <FileText size={48} className="text-prism-text-muted mb-6 opacity-50" />
            <h3 className="text-2xl font-light text-prism-text-primary mb-2">Collection is Empty</h3>
            <p className="text-prism-text-secondary font-light max-w-md">
              You can add reports to this collection from the Archive or directly from a report view.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayData.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative block h-full group"
              >
                <ReportCard
                  item={item}
                  variant="card"
                  onDelete={() => removeReportMutation.mutate(item.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsEditModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="relative w-full max-w-lg glass-panel-strong rounded-3xl p-8 border border-prism-text-primary/10 shadow-2xl"
            >
              <h3 className="text-2xl font-light text-prism-text-primary mb-6">Edit Collection</h3>
              <form onSubmit={handleEdit}>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-prism-text-secondary mb-2">Name</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full h-12 px-4 bg-prism-surface border border-prism-border rounded-xl text-prism-text-primary focus:outline-none focus:ring-1 focus:ring-prism-cyan"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-prism-text-secondary mb-2">Description</label>
                    <textarea 
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full h-24 p-4 bg-prism-surface border border-prism-border rounded-xl text-prism-text-primary focus:outline-none focus:ring-1 focus:ring-prism-cyan resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)} type="button">Cancel</Button>
                  <Button variant="primary" type="submit" disabled={!editName.trim() || updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
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
