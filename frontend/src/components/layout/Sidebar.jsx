import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Library, 
  Settings, 
  Hexagon, 
  Bookmark, 
  FolderKanban, 
  Eye, 
  Clock, 
  Code2, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useThemeStore } from '../../store/themeStore';
import { useUserStore } from '../../store/userStore';

export const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const { profileName, setProfileName } = useUserStore();

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleProfileClick = () => {
    const newName = window.prompt("Enter new profile name:", profileName);
    if (newName && newName.trim().length > 0) {
      setProfileName(newName.trim());
    }
  };

  const navCategories = [
    {
      title: 'PLATFORM',
      items: [
        { to: '/', label: 'Workspace', icon: LayoutDashboard },
        { to: '/archive', label: 'Archive', icon: Library, activeColor: 'text-emerald-400', activeBg: 'bg-emerald-500/10 border-emerald-500/20' },
        { to: '/saved', label: 'Saved Reports', icon: Bookmark, activeColor: 'text-emerald-400', activeBg: 'bg-emerald-500/10 border-emerald-500/20' },
        { to: '/collections', label: 'Collections', icon: FolderKanban, activeColor: 'text-prism-cyan', activeBg: 'bg-prism-cyan/10 border-prism-cyan/20' },
        { to: '/watchlist', label: 'Watchlist', icon: Eye },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { to: '/mission-control', label: 'Mission Control', icon: Sparkles },
        { to: '/activity', label: 'Recent Activity', icon: Clock },
        { to: '/api-status', label: 'API Status', icon: Code2 },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { to: '/settings', label: 'Settings', icon: Settings },
        { to: '/docs', label: 'Documentation', icon: HelpCircle },
      ]
    }
  ];

  return (
    <motion.aside 
      className={cn(
        "hidden md:flex flex-col my-4 ml-5 max-h-[calc(100vh-2rem)] rounded-2xl z-20 relative overflow-hidden backdrop-blur-xl border shadow-xl transition-colors duration-300",
        isLight 
          ? "glass-panel border-pink-200/60 shadow-[0_8px_30px_rgba(244,63,94,0.08)] text-slate-800" 
          : "bg-black/50 border-prism-text-primary/10 text-prism-text-primary shadow-black/80"
      )}
      initial={{ width: 72 }}
      animate={{ width: isHovered ? 250 : 72 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand Header */}
      <div className={cn("h-16 flex items-center px-5 whitespace-nowrap border-b flex-shrink-0", isLight ? "border-pink-200/40" : "border-prism-text-primary/5")}>
        <Hexagon className="text-cyan-500 flex-shrink-0" size={26} strokeWidth={1.5} />
        <motion.div 
          className="ml-4 flex flex-col"
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
          transition={{ duration: 0.2 }}
        >
          <span className={cn("text-lg font-semibold tracking-wide", isLight ? "text-slate-900" : "text-prism-text-primary")}>Prism</span>
          <span className={cn("text-[9px] font-mono tracking-widest uppercase font-semibold", isLight ? "text-emerald-600" : "text-emerald-400/80")}>VERIFIED HQ</span>
        </motion.div>
      </div>
      
      {/* Scrollable Navigation Groups */}
      <div className="mt-3 px-3 flex-1 overflow-y-auto space-y-4 scrollbar-none py-1">
        {navCategories.map((group) => (
          <div key={group.title} className="space-y-1">
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn("px-3 text-[9px] font-mono tracking-[0.2em] uppercase font-bold mb-1.5", isLight ? "text-slate-400" : "text-gray-500")}
              >
                {group.title}
              </motion.div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center h-9 px-3 rounded-xl transition-all duration-200 relative",
                    isActive 
                      ? isLight 
                        ? "text-rose-950 bg-pink-100/80 border border-pink-300/70 font-semibold shadow-sm" 
                        : cn("text-prism-text-primary font-semibold", item.activeBg || "bg-white/[0.1] border border-prism-text-primary/15")
                      : isLight 
                        ? "text-slate-600 hover:text-slate-900 hover:bg-pink-50/70" 
                        : "text-gray-400 hover:text-prism-text-primary hover:bg-white/[0.05]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                      <item.icon 
                        size={17} 
                        strokeWidth={isActive ? 2 : 1.5} 
                        className={isActive ? (isLight ? "text-rose-600" : (item.activeColor || "text-cyan-400")) : (isLight ? "text-slate-500" : "text-gray-400")} 
                      />
                    </div>
                    <motion.span 
                      className="ml-3.5 text-xs font-medium whitespace-nowrap tracking-wide"
                      animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* User Profile Info at Bottom */}
      <div 
        className={cn("py-3 border-t mx-2 flex-shrink-0 cursor-pointer rounded-xl transition-colors", isLight ? "border-pink-200/40 hover:bg-pink-50/70" : "border-prism-text-primary/5 hover:bg-prism-text-primary/5")}
        onClick={handleProfileClick}
        title="Click to change profile name"
      >
        <div className="flex items-center px-2">
          <div className={cn("w-8 h-8 flex-shrink-0 rounded-full border flex items-center justify-center", isLight ? "bg-pink-100 border-pink-300 text-rose-700" : "bg-prism-text-primary/10 border-prism-text-primary/10 text-cyan-400")}>
            <span className="text-[11px] font-mono font-semibold tracking-wider">{getInitials(profileName)}</span>
          </div>
          <motion.div 
            className="flex flex-col ml-3"
            animate={{ opacity: isHovered ? 1 : 0, display: isHovered ? "flex" : "none" }}
            transition={{ duration: 0.2 }}
          >
            <span className={cn("text-xs font-medium whitespace-nowrap", isLight ? "text-slate-800" : "text-prism-text-primary")}>{profileName}</span>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className={cn("text-[9px] font-mono whitespace-nowrap font-semibold", isLight ? "text-emerald-600" : "text-emerald-400")}>Enterprise Tier</span>
              <span className="text-[9px] font-mono text-prism-text-muted opacity-60">• v4.2</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.aside>
  );
};



