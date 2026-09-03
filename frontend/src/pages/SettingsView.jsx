import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Monitor, Shield, Database, Key, CheckCircle2, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';
import { useCinematicStore } from '../store/cinematicStore';
import { healthApi } from '../services/api/health.api';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

export const SettingsView = () => {
  const navigate = useNavigate();
  const replaySequence = useCinematicStore((state) => state.replaySequence);
  const [activeTab, setActiveTab] = useState('appearance');
  const { settings, updateSetting, resetToDefaults, isInitialized, initialize } = useSettingsStore();
  const { theme = 'dark', reducedMotion = false, autoRefresh = true, autoRefreshInterval = 60 } = settings || {};

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const { data: healthData, isLoading: isHealthLoading } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: healthApi.getHealth,
    enabled: activeTab === 'data_sources',
  });

  const handleUpdate = async (key, value) => {
    try {
      await updateSetting(key, value);
      toast.success('Settings updated');
    } catch {
      toast.error('Failed to update settings');
    }
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset all preferences to their defaults?")) {
      try {
        await resetToDefaults();
        toast.success('Preferences reset');
      } catch {
        toast.error('Failed to reset preferences');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-8">
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
        <div className="col-span-1 flex flex-row overflow-x-auto pb-2 md:pb-0 md:flex-col gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab('appearance')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors border shrink-0 whitespace-nowrap min-h-[44px]",
              activeTab === 'appearance' 
                ? "bg-prism-surface-active text-prism-text-primary shadow-prism-sm border-prism-text-primary/5 font-semibold" 
                : "border-transparent text-prism-text-secondary hover:bg-prism-surface-active/50 hover:text-prism-text-primary"
            )}
          >
            <Monitor size={18} className={activeTab === 'appearance' ? "text-prism-accent" : ""} />
            Appearance
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors border shrink-0 whitespace-nowrap min-h-[44px]",
              activeTab === 'security' 
                ? "bg-prism-surface-active text-prism-text-primary shadow-prism-sm border-prism-text-primary/5 font-semibold" 
                : "border-transparent text-prism-text-secondary hover:bg-prism-surface-active/50 hover:text-prism-text-primary"
            )}
          >
            <Shield size={18} className={activeTab === 'security' ? "text-prism-accent" : ""} />
            Security & Privacy
          </button>
          <button 
            onClick={() => setActiveTab('data_sources')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors border shrink-0 whitespace-nowrap min-h-[44px]",
              activeTab === 'data_sources' 
                ? "bg-prism-surface-active text-prism-text-primary shadow-prism-sm border-prism-text-primary/5 font-semibold" 
                : "border-transparent text-prism-text-secondary hover:bg-prism-surface-active/50 hover:text-prism-text-primary"
            )}
          >
            <Database size={18} className={activeTab === 'data_sources' ? "text-prism-accent" : ""} />
            Data Sources
          </button>
          <button 
            onClick={() => setActiveTab('api_keys')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors border shrink-0 whitespace-nowrap min-h-[44px]",
              activeTab === 'api_keys' 
                ? "bg-prism-surface-active text-prism-text-primary shadow-prism-sm border-prism-text-primary/5 font-semibold" 
                : "border-transparent text-prism-text-secondary hover:bg-prism-surface-active/50 hover:text-prism-text-primary"
            )}
          >
            <Key size={18} className={activeTab === 'api_keys' ? "text-prism-accent" : ""} />
            API Keys
          </button>
        </div>

        {/* Settings Content */}
        <div className="col-span-1 md:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'appearance' && (
              <motion.div key="appearance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card glass className="p-8 space-y-8">
                  <div>
                    <div className="mb-6 border-b border-prism-border pb-4">
                      <h3 className="text-xl font-medium text-prism-text-primary mb-1">Atmospheric Environment</h3>
                      <p className="text-sm text-prism-text-secondary">Select the lighting mode for your workspace.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <button 
                        onClick={() => handleUpdate('theme', 'dark')}
                        className={cn(
                          "relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300",
                          theme === 'dark' ? "border-prism-accent bg-prism-surface-active shadow-prism-glow" : "border-prism-border bg-prism-surface hover:border-prism-text-muted"
                        )}
                      >
                        <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center border border-prism-text-primary/10 shadow-[inset_0_0_20px_rgba(34,211,238,0.2)]">
                          <Moon size={24} className={theme === 'dark' ? "text-prism-cyan" : "text-prism-text-primary/50"} />
                        </div>
                        <span className={cn("font-medium", theme === 'dark' ? "text-prism-cyan" : "text-prism-text-secondary")}>Deep Space</span>
                      </button>
                      <button 
                        onClick={() => handleUpdate('theme', 'light')}
                        className={cn(
                          "relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300",
                          theme === 'light' ? "border-prism-accent bg-prism-surface-active shadow-prism-glow" : "border-prism-border bg-prism-surface hover:border-prism-text-muted"
                        )}
                      >
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border border-black/10 shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                          <Sun size={24} className={theme === 'light' ? "text-amber-500" : "text-black/50"} />
                        </div>
                        <span className={cn("font-medium", theme === 'light' ? "text-amber-500" : "text-prism-text-secondary")}>Daylight</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="mb-6 border-b border-prism-border pb-4">
                      <h3 className="text-xl font-medium text-prism-text-primary mb-1">General Preferences</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-prism-text-primary font-medium">Reduced Motion</p>
                          <p className="text-sm text-prism-text-secondary">Reduce background particles and transitions.</p>
                        </div>
                        <button 
                          className={cn("w-12 h-6 rounded-full transition-colors relative", reducedMotion ? "bg-prism-cyan" : "bg-prism-surface-active")}
                          onClick={() => handleUpdate('reducedMotion', !reducedMotion)}
                        >
                          <div className={cn("absolute top-1 bg-white w-4 h-4 rounded-full transition-all", reducedMotion ? "left-7" : "left-1")} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-prism-text-primary font-medium">Automatic Refresh</p>
                          <p className="text-sm text-prism-text-secondary">Automatically refresh live intelligence pages.</p>
                        </div>
                        <button 
                          className={cn("w-12 h-6 rounded-full transition-colors relative", autoRefresh ? "bg-prism-cyan" : "bg-prism-surface-active")}
                          onClick={() => handleUpdate('autoRefresh', !autoRefresh)}
                        >
                          <div className={cn("absolute top-1 bg-white w-4 h-4 rounded-full transition-all", autoRefresh ? "left-7" : "left-1")} />
                        </button>
                      </div>

                      {autoRefresh && (
                        <div className="flex items-center justify-between bg-white/[0.02] p-4 rounded-xl border border-prism-text-primary/5">
                          <p className="text-sm text-prism-text-primary">Refresh Interval</p>
                          <div className="flex gap-2">
                            {[15, 30, 60].map(val => (
                              <button 
                                key={val}
                                onClick={() => handleUpdate('autoRefreshInterval', val)}
                                className={cn("px-3 py-1 rounded text-xs font-mono transition-colors", autoRefreshInterval === val ? "bg-prism-cyan text-black" : "bg-prism-text-primary/10 text-prism-text-primary hover:bg-prism-text-primary/20")}
                              >
                                {val}s
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-prism-border/40">
                        <div>
                          <p className="text-prism-text-primary font-medium">Cinematic Intro</p>
                          <p className="text-sm text-prism-text-secondary">Replay the full 3D refractive opening sequence.</p>
                        </div>
                        <button 
                          onClick={() => {
                            replaySequence();
                            navigate('/');
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider bg-prism-cyan/15 hover:bg-prism-cyan/25 text-prism-cyan border border-prism-cyan/30 transition-all flex items-center gap-2 font-semibold shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                        >
                          <Sparkles size={14} className="animate-spin text-prism-cyan" />
                          Replay Intro
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card glass className="p-8 space-y-8">
                  <div>
                    <div className="mb-6 border-b border-prism-border pb-4">
                      <h3 className="text-xl font-medium text-prism-text-primary mb-1">Session & Local Data</h3>
                    </div>
                    <div className="bg-prism-surface-active border border-prism-text-primary/5 p-6 rounded-xl space-y-3">
                      <div className="flex items-center gap-3 text-prism-cyan">
                        <Shield size={20} />
                        <span className="font-medium">Local / Single-User Environment</span>
                      </div>
                      <p className="text-sm text-prism-text-secondary">
                        Prism is currently running in local architecture. Authentication and enterprise RBAC are not required.
                        All intelligence is stored in the local database instance.
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-6 border-b border-prism-border pb-4">
                      <h3 className="text-xl font-medium text-prism-text-primary mb-1">Authentication (Working on it)</h3>
                    </div>
                    <div className="bg-prism-surface-active border border-prism-text-primary/5 p-6 rounded-xl space-y-3 opacity-50">
                      <div className="flex items-center gap-3 text-prism-text-primary">
                        <Key size={20} />
                        <span className="font-medium">Enterprise SSO & Role-Based Access</span>
                      </div>
                      <p className="text-sm text-prism-text-secondary">
                        We are currently implementing enterprise authentication features. This setting is unavailable.
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-6 border-b border-prism-border pb-4">
                      <h3 className="text-xl font-medium text-red-400 mb-1">Clear Local Preferences</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-prism-text-secondary">Reset all workspace configuration to system defaults.</p>
                      <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={handleReset}>
                        Reset Preferences
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'data_sources' && (
              <motion.div key="data_sources" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card glass className="p-8 space-y-8">
                  <div className="mb-6 border-b border-prism-border pb-4">
                    <h3 className="text-xl font-medium text-prism-text-primary mb-1">Data Sources</h3>
                    <p className="text-sm text-prism-text-secondary">Connected providers and intelligence engines.</p>
                  </div>
                  
                  {isHealthLoading ? (
                    <div className="py-10 flex justify-center"><RefreshCw className="animate-spin text-prism-cyan" /></div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-5 bg-white/[0.02] border border-prism-text-primary/5 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-medium text-prism-text-primary mb-1">AI Provider: Gemini</p>
                          <p className="text-xs text-prism-text-secondary">Multimodal intelligence engine</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={cn("text-sm font-medium flex items-center gap-2", healthData?.services?.aiProvider?.status === 'operational' ? "text-emerald-400" : "text-red-400")}>
                            {healthData?.services?.aiProvider?.status === 'operational' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                            {healthData?.services?.aiProvider?.status === 'operational' ? "Configured" : "Not configured"}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 bg-white/[0.02] border border-prism-text-primary/5 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-medium text-prism-text-primary mb-1">Database: MongoDB</p>
                          <p className="text-xs text-prism-text-secondary">Primary telemetry and storage</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={cn("text-sm font-medium flex items-center gap-2", healthData?.services?.database?.status === 'operational' ? "text-emerald-400" : "text-red-400")}>
                            {healthData?.services?.database?.status === 'operational' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                            {healthData?.services?.database?.status === 'operational' ? "Connected" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {activeTab === 'api_keys' && (
              <motion.div key="api_keys" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card glass className="p-8 space-y-8">
                  <div className="mb-6 border-b border-prism-border pb-4">
                    <h3 className="text-xl font-medium text-prism-text-primary mb-1">API Keys</h3>
                    <p className="text-sm text-prism-text-secondary">Authentication credentials for external providers.</p>
                  </div>
                  <div className="p-6 bg-prism-surface-active border border-prism-text-primary/5 rounded-xl">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-prism-text-primary font-medium mb-1">Gemini API</p>
                        <p className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Configured
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-prism-text-secondary">Managed by server environment</p>
                      <div className="flex items-center gap-3">
                        <div className="bg-black/50 px-4 py-3 rounded-lg border border-prism-text-primary/10 font-mono text-prism-text-primary/50 text-xl tracking-[0.5em] flex-1">
                          ••••••••••••
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
