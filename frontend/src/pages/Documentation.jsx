import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Info
} from 'lucide-react';
import { documentation } from '../data/documentation';
import { Button } from '../components/shared/Button';
import { cn } from '../utils/cn';

// Simple markdown renderer
const MarkdownContent = ({ content }) => {
  const blocks = content.split('\n\n');
  return (
    <div className="space-y-4 text-prism-text-secondary leading-relaxed">
      {blocks.map((block, idx) => {
        if (block.startsWith('> [!WARNING]')) {
          const text = block.replace('> [!WARNING]', '').replace(/>/g, '').trim();
          return (
            <div key={idx} className="my-6 border border-yellow-500/20 bg-yellow-500/5 p-4 rounded-xl flex gap-3 text-yellow-200">
              <Info className="shrink-0 mt-0.5 text-yellow-400" size={18} />
              <div className="space-y-2">
                {text.split('\n').map((line, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: parseInline(line.trim()) }} />
                ))}
              </div>
            </div>
          );
        }

        if (block.startsWith('- ')) {
          const items = block.split('\n').map(b => b.replace(/^- /, '').trim());
          return (
            <ul key={idx} className="list-disc pl-5 space-y-2 text-prism-text-secondary">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
              ))}
            </ul>
          );
        }

        if (block.match(/^\d+\./)) {
          const items = block.split('\n').map(b => b.replace(/^\d+\.\s/, '').trim());
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-2 text-prism-text-secondary">
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
              ))}
            </ol>
          );
        }

        return <p key={idx} dangerouslySetInnerHTML={{ __html: parseInline(block) }} />;
      })}
    </div>
  );
};

const parseInline = (text) => {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-prism-text-primary font-medium">$1</strong>');
};

export const Documentation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeArticleId, setActiveArticleId] = useState(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    return hash || 'system-architecture';
  });

  // Flatten articles for easy navigation and search
  const flatArticles = useMemo(() => {
    return documentation.flatMap(section => 
      section.items.map(item => ({ ...item, sectionTitle: section.title }))
    );
  }, []);

  // Filter based on search query
  const filteredDocumentation = useMemo(() => {
    if (!searchQuery.trim()) return documentation;
    
    const query = searchQuery.toLowerCase();
    
    return documentation.map(section => {
      const matchingItems = section.items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        section.title.toLowerCase().includes(query)
      );
      
      if (matchingItems.length > 0) {
        return { ...section, items: matchingItems };
      }
      return null;
    }).filter(Boolean);
  }, [searchQuery]);

  // Handle URL Hash navigation
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    const validTarget = flatArticles.find(a => a.id === hash);
    if (validTarget && validTarget.id !== activeArticleId) {
      setActiveArticleId(validTarget.id);
    } else if (!hash && flatArticles.length > 0 && activeArticleId !== flatArticles[0].id) {
      setActiveArticleId(flatArticles[0].id);
      navigate(`#${flatArticles[0].id}`, { replace: true });
    }
  }, [location.hash, flatArticles, navigate, activeArticleId]);

  const activeArticle = flatArticles.find(a => a.id === activeArticleId) || flatArticles[0];
  const activeArticleIndex = flatArticles.findIndex(a => a.id === activeArticleId);
  const prevArticle = activeArticleIndex > 0 ? flatArticles[activeArticleIndex - 1] : null;
  const nextArticle = activeArticleIndex < flatArticles.length - 1 ? flatArticles[activeArticleIndex + 1] : null;

  const handleNavigate = (id) => {
    navigate(`#${id}`);
    setMobileMenuOpen(false);
    
    // Scroll to top of content container smoothly if possible
    const mainContent = document.getElementById('docs-main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-6xl mx-auto pb-20 pt-4 px-4"
    >
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start relative w-full">
        
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-4 h-auto">
          <div className="flex items-center gap-3 shrink-0">
             <BookOpen className="text-prism-cyan" size={24} />
             <h2 className="text-xl font-medium text-prism-text-primary">Documentation</h2>
          </div>
          
          <div className="relative shrink-0 z-10 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-prism-text-secondary" size={16} />
            <input 
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-prism-surface border border-prism-text-primary/10 rounded-lg pl-9 pr-4 py-2 text-sm text-prism-text-primary placeholder:text-prism-text-secondary focus:outline-none focus:border-prism-cyan/50 focus:ring-1 focus:ring-prism-cyan/50 transition-all box-border"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2 pb-4 max-h-[40vh] lg:max-h-[calc(100vh-16rem)]">
          {filteredDocumentation.length === 0 ? (
            <div className="text-center py-8 text-prism-text-secondary">
              <p className="text-sm">No documentation found.</p>
              <button 
                onClick={() => setSearchQuery("")}
                className="text-prism-cyan text-xs mt-2 hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            filteredDocumentation.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-xs font-semibold text-prism-text-primary tracking-wider uppercase pl-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map(item => {
                    const isActive = activeArticleId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group",
                          isActive 
                            ? "bg-prism-cyan/10 text-prism-cyan font-medium" 
                            : "text-prism-text-secondary hover:bg-prism-text-primary/5 hover:text-prism-text-primary"
                        )}
                      >
                        <span className="truncate">{item.title}</span>
                        {isActive && (
                          <motion.div layoutId="activeDocIndicator" className="w-1.5 h-1.5 rounded-full bg-prism-cyan shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        id="docs-main-content"
        className="flex-1 w-full min-w-0"
      >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeArticle?.id || 'empty'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-12"
            >
              {activeArticle ? (
                <>
                  <div>
                    <div className="flex items-center text-prism-text-secondary text-sm mb-4">
                      <span>{activeArticle.sectionTitle}</span>
                      <ChevronRight size={14} className="mx-2" />
                      <span className="text-prism-text-primary">{activeArticle.title}</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-light text-prism-text-primary tracking-tight mb-8">
                      {activeArticle.title}
                    </h1>
                    
                    <div className="prose prose-invert max-w-none">
                      <MarkdownContent content={activeArticle.content} />
                    </div>
                  </div>

                  {/* Previous / Next Navigation */}
                  <div className="pt-8 border-t border-prism-text-primary/5 flex items-center justify-between gap-4">
                    {prevArticle ? (
                      <Button 
                        variant="glass" 
                        className="flex-1 flex justify-start gap-3 h-16 group"
                        onClick={() => handleNavigate(prevArticle.id)}
                      >
                        <ChevronLeft size={18} className="text-prism-text-secondary group-hover:text-prism-text-primary transition-colors" />
                        <div className="text-left flex flex-col items-start leading-tight min-w-0">
                          <span className="text-xs text-prism-text-secondary group-hover:text-prism-text-primary transition-colors">Previous</span>
                          <span className="text-sm font-medium text-prism-text-primary group-hover:text-prism-cyan transition-colors truncate w-full">{prevArticle.title}</span>
                        </div>
                      </Button>
                    ) : (
                      <div className="flex-1"></div>
                    )}
                    
                    {nextArticle ? (
                      <Button 
                        variant="glass" 
                        className="flex-1 flex justify-end text-right gap-3 h-16 group"
                        onClick={() => handleNavigate(nextArticle.id)}
                      >
                        <div className="text-right flex flex-col items-end leading-tight min-w-0">
                          <span className="text-xs text-prism-text-secondary group-hover:text-prism-text-primary transition-colors">Next</span>
                          <span className="text-sm font-medium text-prism-text-primary group-hover:text-prism-cyan transition-colors truncate w-full">{nextArticle.title}</span>
                        </div>
                        <ChevronRight size={18} className="text-prism-text-secondary group-hover:text-prism-text-primary transition-colors" />
                      </Button>
                    ) : (
                      <div className="flex-1"></div>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-[50vh] flex flex-col items-center justify-center text-prism-text-secondary">
                  <p>Article not found.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
