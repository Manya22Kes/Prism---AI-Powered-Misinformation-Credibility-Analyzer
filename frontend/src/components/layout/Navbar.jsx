import React from 'react';
import { Search, Menu, Hexagon, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../store/themeStore';

export const Navbar = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-20 flex items-center px-6 md:px-12 justify-between z-10 w-full"
    >
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-prism-text-secondary hover:text-prism-text-primary rounded-md transition-colors">
          <Menu size={20} />
        </button>
        
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center">
          <Hexagon className="text-prism-cyan mr-2" size={24} />
          <span className="font-bold tracking-tighter text-xl text-gradient">Prism</span>
        </div>

        {/* Global Search */}
        <div className="hidden md:flex items-center relative w-64 lg:w-96 group">
          <Search className="absolute left-4 text-prism-text-muted group-focus-within:text-prism-accent transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search archive (Cmd+K)" 
            className="w-full h-10 pl-11 pr-4 bg-white/5 border border-white/5 rounded-full text-sm text-prism-text-primary placeholder:text-prism-text-muted focus:outline-none focus:ring-1 focus:ring-prism-accent/50 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Functional Theme Toggle */}
        <button 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-prism-text-secondary hover:text-prism-text-primary transition-all flex items-center gap-2"
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

        <div className="text-xs text-prism-text-muted tracking-widest uppercase font-semibold hidden sm:block">
          System Secure
        </div>
      </div>
    </motion.header>
  );
};

