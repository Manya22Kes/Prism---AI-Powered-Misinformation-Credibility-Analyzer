import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Monitor, Shield, Database, Key } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { Card } from '../components/shared/Card';
import { cn } from '../utils/cn';

export const SettingsView = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-4xl mx-auto pb-20 pt-8"
    >
      <div className="mb-12">
        <h2 className="text-4xl font-light tracking-tight text-prism-text-primary mb-4">
          Settings & Preferences
        </h2>
        <p className="text-prism-text-secondary">
          Configure your intelligence workspace environment and system connections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Navigation Sidebar inside Settings */}
        <div className="col-span-1 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-prism-surface-active text-prism-text-primary font-medium shadow-prism-sm border border-white/5">
            <Monitor size={18} className="text-prism-accent" />
            Appearance
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-prism-surface-active/50 text-prism-text-secondary hover:text-prism-text-primary transition-colors">
            <Shield size={18} />
            Security & Privacy
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-prism-surface-active/50 text-prism-text-secondary hover:text-prism-text-primary transition-colors">
            <Database size={18} />
            Data Sources
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-prism-surface-active/50 text-prism-text-secondary hover:text-prism-text-primary transition-colors">
            <Key size={18} />
            API Keys
          </button>
        </div>

        {/* Settings Content */}
        <div className="col-span-1 md:col-span-2 space-y-8">
          
          <Card glass className="p-8">
            <div className="mb-8 border-b border-prism-border pb-6">
              <h3 className="text-xl font-medium text-prism-text-primary mb-2">Atmospheric Environment</h3>
              <p className="text-sm text-prism-text-secondary">Select the lighting mode for your workspace.</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Dark Theme Button */}
              <button 
                onClick={() => setTheme('dark')}
                className={cn(
                  "relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300",
                  theme === 'dark' 
                    ? "border-prism-accent bg-prism-surface-active shadow-prism-glow" 
                    : "border-prism-border bg-prism-surface hover:border-prism-text-muted"
                )}
              >
                <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center border border-white/10 shadow-[inset_0_0_20px_rgba(34,211,238,0.2)]">
                  <Moon size={24} className={theme === 'dark' ? "text-prism-cyan" : "text-white/50"} />
                </div>
                <span className={cn("font-medium", theme === 'dark' ? "text-prism-cyan" : "text-prism-text-secondary")}>Deep Space</span>
                {theme === 'dark' && (
                  <motion.div layoutId="theme-active" className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-prism-cyan border-4 border-prism-bg" />
                )}
              </button>

              {/* Light Theme Button */}
              <button 
                onClick={() => setTheme('light')}
                className={cn(
                  "relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300",
                  theme === 'light' 
                    ? "border-prism-accent bg-prism-surface-active shadow-prism-glow" 
                    : "border-prism-border bg-prism-surface hover:border-prism-text-muted"
                )}
              >
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border border-black/10 shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                  <Sun size={24} className={theme === 'light' ? "text-amber-500" : "text-black/50"} />
                </div>
                <span className={cn("font-medium", theme === 'light' ? "text-amber-500" : "text-prism-text-secondary")}>Daylight</span>
                {theme === 'light' && (
                  <motion.div layoutId="theme-active" className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-prism-accent border-4 border-prism-bg" />
                )}
              </button>
            </div>
          </Card>

        </div>

      </div>
    </motion.div>
  );
};
