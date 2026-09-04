import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Search, Menu, X, Hexagon, Sun, Moon,
  LayoutDashboard, Library, Settings, Bookmark, FolderKanban, Eye, Clock, Code2, HelpCircle, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../store/themeStore';
import { useUserStore } from '../../store/userStore';
import { GlobalSearchModal } from './GlobalSearchModal';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/', label: 'Workspace', icon: LayoutDashboard },
  { to: '/archive', label: 'Archive', icon: Library },
  { to: '/saved', label: 'Saved Reports', icon: Bookmark },
  { to: '/collections', label: 'Collections', icon: FolderKanban },
  { to: '/watchlist', label: 'Watchlist', icon: Eye },
  { to: '/mission-control', label: 'Mission Control', icon: Sparkles },
  { to: '/activity', label: 'Recent Activity', icon: Clock },
  { to: '/api-status', label: 'API Status', icon: Code2 },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/docs', label: 'Documentation', icon: HelpCircle },
];

export const Navbar = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { profileName, setProfileName } = useUserStore();
  const isLight = theme === 'light';
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getInitials = (name) => {
    if (!name) return 'PR';
    return name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || 'PR';
  };

  const handleProfileClick = () => {
    const newName = window.prompt("Enter new profile name:", profileName);
    if (newName && newName.trim().length > 0) {
      setProfileName(newName.trim());
    }
  };

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleToggleTheme = () => {
    toggleTheme();
  };

  // Close mobile drawer on route change & handle body scroll lock cleanup
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-20 flex items-center px-4 sm:px-6 md:px-12 justify-between z-10 w-full px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]"
      >
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 text-prism-text-secondary hover:text-prism-text-primary rounded-xl hover:bg-prism-text-primary/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center">
            <Hexagon className="text-prism-cyan mr-1.5" size={22} />
            <span className="font-bold tracking-tighter text-lg sm:text-xl text-gradient">Prism</span>
          </div>

          {/* Global Search */}
          <div 
            className="hidden md:flex items-center relative w-64 lg:w-96 group cursor-pointer"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="absolute left-4 text-prism-text-muted group-hover:text-prism-accent transition-colors" size={18} />
            <div className="w-full h-10 pl-11 pr-4 bg-prism-text-primary/5 border border-prism-text-primary/5 rounded-full flex items-center text-sm text-prism-text-muted group-hover:bg-prism-text-primary/10 transition-all">
              Search archive (Ctrl+K)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4 md:gap-6">
          {/* Mobile search button */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 rounded-full bg-prism-text-primary/5 hover:bg-prism-text-primary/10 text-prism-text-secondary hover:text-prism-text-primary transition-colors"
            title="Search"
          >
            <Search size={18} />
          </button>

          {/* Functional Theme Toggle */}
          <button 
            onClick={handleToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-2 sm:p-2.5 rounded-full bg-prism-text-primary/5 hover:bg-prism-text-primary/10 border border-prism-text-primary/10 text-prism-text-secondary hover:text-prism-text-primary transition-all flex items-center gap-2"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-amber-300" />
            ) : (
              <Moon size={18} className="text-indigo-400" />
            )}
            <span className="text-xs font-mono uppercase tracking-wider hidden lg:inline">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Mobile Profile Avatar Button */}
          <button
            onClick={handleProfileClick}
            className={cn(
              "md:hidden w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm",
              isLight 
                ? "bg-pink-100 border-pink-300 text-rose-700 hover:bg-pink-200" 
                : "bg-prism-text-primary/10 border-prism-cyan/30 text-prism-cyan hover:border-prism-cyan"
            )}
            title={`Profile: ${profileName} (Tap to change)`}
            aria-label="User Profile"
          >
            <span className="text-[11px] font-mono font-bold tracking-wider">{getInitials(profileName)}</span>
          </button>

          <div className="text-xs text-prism-text-muted tracking-widest uppercase font-semibold hidden sm:block">
            System Secure
          </div>
        </div>

        <GlobalSearchModal 
          isOpen={isSearchOpen} 
          onClose={handleCloseSearch} 
        />
      </motion.header>

      {/* Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-4/5 max-w-xs h-full bg-prism-surface border-r border-prism-border p-6 flex flex-col shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-prism-border">
                <div className="flex items-center gap-2.5">
                  <Hexagon className="text-prism-cyan" size={24} />
                  <span className="font-bold text-lg text-prism-text-primary">Prism Intelligence</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-prism-text-muted hover:text-prism-text-primary hover:bg-prism-text-primary/5"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 py-4 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        isActive
                          ? "bg-prism-surface-active text-prism-cyan border border-prism-border font-semibold"
                          : "text-prism-text-secondary hover:text-prism-text-primary hover:bg-prism-surface-active/50"
                      )
                    }
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Dynamic User Profile Card in Drawer */}
              <div 
                onClick={handleProfileClick}
                className={cn(
                  "p-3 mb-2 rounded-xl border flex items-center gap-3 cursor-pointer transition-all",
                  isLight
                    ? "bg-pink-50/70 border-pink-200 hover:bg-pink-100/70 shadow-sm"
                    : "bg-prism-surface-active/50 border-prism-border hover:border-prism-cyan/40"
                )}
                title="Tap to change profile name"
              >
                <div className={cn(
                  "w-9 h-9 rounded-full border flex items-center justify-center shrink-0 font-mono font-bold text-xs shadow-sm",
                  isLight
                    ? "bg-pink-100 border-pink-300 text-rose-700"
                    : "bg-prism-text-primary/10 border-cyan-400/40 text-cyan-400"
                )}>
                  {getInitials(profileName)}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={cn("text-xs font-semibold truncate", isLight ? "text-slate-800" : "text-prism-text-primary")}>
                      {profileName}
                    </span>
                    <span className={cn("text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0", isLight ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-emerald-950/60 border border-emerald-500/30 text-emerald-400")}>
                      Enterprise
                    </span>
                  </div>
                  <span className={cn("text-[10px] mt-0.5", isLight ? "text-slate-500" : "text-prism-text-muted")}>
                    Tap to edit profile name
                  </span>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-prism-border flex items-center justify-between text-xs text-prism-text-muted font-mono">
                <span>PRISM v4.2</span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

