import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Link2, FileText, Hash, AlertCircle } from 'lucide-react';
import { Button } from '../shared/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistApi } from '../../services/api/watchlist.api';
import { cn } from '../../utils/cn';

export const AddWatchlistModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [targetType, setTargetType] = useState('URL');
  const [target, setTarget] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => watchlistApi.createWatchlistItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      setName('');
      setTarget('');
      setDescription('');
      setTargetType('URL');
      setError(null);
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.message || err.message || 'Failed to add watch item');
    }
  });

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !target.trim()) {
      setError("Name and Target are required.");
      return;
    }
    setError(null);
    createMutation.mutate({ name, targetType, target, description });
  };

  const typeOptions = [
    { id: 'URL', label: 'URL', icon: Link2, desc: 'Monitor a specific webpage or article' },
    { id: 'SOURCE', label: 'Source', icon: FileText, desc: 'Monitor a domain or publisher (Future)' },
    { id: 'TOPIC', label: 'Topic', icon: Hash, desc: 'Monitor a keyword or theme (Future)' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="relative w-full max-w-lg max-w-[calc(100vw-2rem)] glass-panel-strong rounded-3xl p-4 sm:p-8 border border-prism-text-primary/10 shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-light text-prism-text-primary flex items-center gap-2">
                <Plus size={24} className="text-prism-cyan" /> Add Watch Item
              </h3>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-prism-text-primary/10 text-prism-text-muted hover:text-prism-text-primary transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <form id="add-watchlist-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Target Type Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {typeOptions.map(opt => {
                    const Icon = opt.icon;
                    const isSelected = targetType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTargetType(opt.id)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all text-center",
                          isSelected 
                            ? "bg-prism-cyan/10 border-prism-cyan text-prism-cyan" 
                            : "bg-prism-surface border-prism-border text-prism-text-muted hover:bg-prism-surface-hover hover:text-prism-text-primary"
                        )}
                      >
                        <Icon size={20} />
                        <div>
                          <div className="text-sm font-semibold">{opt.label}</div>
                          {opt.id !== 'URL' && <div className="text-[9px] opacity-70 uppercase tracking-widest mt-1">Future</div>}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {targetType !== 'URL' && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3 text-yellow-400">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed">
                      Monitoring for <strong>{targetType}</strong> is not yet fully supported. You can save this item to your watchlist, but manual checking will require future search integrations.
                    </p>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-prism-text-secondary mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={targetType === 'URL' ? "e.g., WHO Mask Mandate Update" : targetType === 'SOURCE' ? "e.g., NYT Tech" : "e.g., AI Regulation"} 
                    className="w-full h-12 px-4 bg-prism-surface border border-prism-border rounded-xl text-prism-text-primary focus:outline-none focus:ring-1 focus:ring-prism-cyan"
                    autoFocus
                  />
                </div>
                
                {/* Target */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-prism-text-secondary mb-2">
                    {targetType === 'URL' ? "URL to Monitor" : targetType === 'SOURCE' ? "Domain / Publisher" : "Keyword / Theme"}
                  </label>
                  <input 
                    type="text" 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder={targetType === 'URL' ? "https://..." : targetType === 'SOURCE' ? "nytimes.com" : "Quantum computing breakthrough"} 
                    className="w-full h-12 px-4 bg-prism-surface border border-prism-border rounded-xl text-prism-text-primary focus:outline-none focus:ring-1 focus:ring-prism-cyan"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-prism-text-secondary mb-2">Notes <span className="opacity-50">(Optional)</span></label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Why are we tracking this?" 
                    className="w-full h-24 p-4 bg-prism-surface border border-prism-border rounded-xl text-prism-text-primary focus:outline-none focus:ring-1 focus:ring-prism-cyan resize-none"
                  />
                </div>
                
                {error && (
                  <div className="text-red-400 text-sm">{error}</div>
                )}
              </form>
            </div>

            <div className="pt-6 mt-4 border-t border-prism-text-primary/10 flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
              <Button form="add-watchlist-form" variant="primary" type="submit" disabled={!name.trim() || !target.trim() || createMutation.isPending}>
                {createMutation.isPending ? 'Adding...' : 'Add to Watchlist'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
