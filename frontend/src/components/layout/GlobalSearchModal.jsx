import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, FileText, Layers, Link2, ChevronRight, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cn } from '../../utils/cn';
import { useThemeStore } from '../../store/themeStore';
import { useComparisonStore } from '../../store/comparisonStore';
import api from '../../services/api/axios';

const TypeIcon = ({ type }) => {
  switch (type) {
    case 'batch': return <Layers size={14} />;
    case 'url': return <Link2 size={14} />;
    case 'file': return <FileText size={14} />;
    default: return <FileText size={14} />;
  }
};

const getScoreColor = (score) => {
  if (score >= 80) return 'text-prism-cyan';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-500';
};

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const { selectedReports, addReport, removeReport, hasReport } = useComparisonStore();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Only reset query and focus when modal is initially opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setDebouncedQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Stable Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ['globalSearch', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { data: { results: [] } };
      const res = await api.get(`/search`, {
        params: { q: debouncedQuery, limit: 8 }
      });
      return res;
    },
    enabled: !!debouncedQuery.trim(),
  });

  const results = data?.data?.results || [];

  const handleResultClick = (item) => {
    onClose();
    if (item.entityType === 'batch' || item.type === 'batch' || item.sourceType === 'batch') {
      navigate(`/batch/${item.id}`);
    } else {
      navigate(`/report/${item.id}`);
    }
  };

  const handleCompareClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasReport(item.id)) {
      removeReport(item.id);
    } else {
      addReport(item);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className={cn(
              "fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[51] rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[80vh]",
              isLight ? "bg-white border-slate-200" : "bg-prism-surface border-prism-border"
            )}
          >
            {/* Search Input */}
            <div className={cn("flex items-center px-4 py-3 border-b", isLight ? "border-slate-100" : "border-prism-border")}>
              <SearchIcon size={20} className={isLight ? "text-slate-400" : "text-prism-text-muted"} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, url, or content..."
                className="flex-1 bg-transparent border-none outline-none px-4 text-base placeholder:text-prism-text-muted text-prism-text-primary"
              />
              <button 
                onClick={onClose}
                className={cn("p-1.5 rounded-md transition-colors", isLight ? "hover:bg-slate-100 text-slate-500" : "hover:bg-prism-text-primary/10 text-prism-text-muted")}
              >
                <X size={16} />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {!debouncedQuery.trim() ? (
                <div className="py-12 text-center text-prism-text-muted text-sm">
                  Start typing to search the archive...
                </div>
              ) : isLoading ? (
                <div className="py-12 flex justify-center">
                  <span className="flex h-6 w-6 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prism-cyan opacity-40"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-prism-cyan"></span>
                  </span>
                </div>
              ) : results.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {results.map((item) => {
                    const isSelected = hasReport(item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => handleResultClick(item)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors group",
                          isLight ? "hover:bg-slate-50" : "hover:bg-prism-surface-active/50"
                        )}
                      >
                        <div className={cn("p-2 rounded-lg border", isLight ? "bg-white border-slate-200 text-slate-500" : "bg-prism-surface-active border-prism-border text-prism-text-muted")}>
                          <TypeIcon type={item.sourceType} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-prism-text-primary truncate">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-prism-text-muted">{new Date(item.createdAt).toLocaleDateString()}</span>
                            {item.verdict && (
                              <span className="text-[9px] uppercase tracking-wider text-prism-text-secondary border border-prism-border rounded px-1.5 py-0.5">
                                {item.verdict}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={cn("text-base font-bold font-mono tracking-tighter w-8 text-right", getScoreColor(item.score))}>
                            {item.score || '--'}
                          </span>
                          
                          <button 
                            onClick={(e) => handleCompareClick(e, item)}
                            className={cn(
                              "p-1.5 rounded-md transition-colors",
                              isSelected 
                                ? (isLight ? "bg-indigo-100 text-indigo-600" : "bg-prism-cyan/20 text-prism-cyan")
                                : (isLight ? "hover:bg-slate-200 text-slate-400" : "text-prism-text-muted hover:bg-prism-text-primary/10 hover:text-prism-text-primary")
                            )}
                            title="Compare"
                          >
                            {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                          </button>
                          
                          <ChevronRight size={16} className={cn("invisible group-hover:visible", isLight ? "text-slate-400" : "text-prism-text-muted")} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-prism-text-muted text-sm">
                  No results found for "{debouncedQuery}"
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Use Portal so the modal escapes any clipping or stacking contexts from Navbar
  return ReactDOM.createPortal(modalContent, document.body);
};
