import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, RefreshCw, CheckCircle2, AlertTriangle, 
  BarChart3, PieChart, Activity
} from 'lucide-react';
import { jsPDF } from "jspdf";
import { missionControlApi } from '../services/api/missionControl.api';
import { useSettingsStore } from '../store/settingsStore';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/shared/Button';
import { cn } from '../utils/cn';

export const MissionControl = () => {
  const { settings } = useSettingsStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const { autoRefresh, autoRefreshInterval } = settings;
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data: response, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['mission-control'],
    queryFn: async () => {
      const res = await missionControlApi.getMissionControlData();
      return res.data || res; // depending on axios unwrapping
    },
    refetchInterval: autoRefresh ? autoRefreshInterval * 1000 : false,
    retry: 1
  });

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setTimeout(() => setIsManualRefreshing(false), 1200);
  };

  const handleExport = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Prism Mission Control Telemetry", 10, 15);
    doc.setFontSize(10);
    const jsonString = JSON.stringify(data, null, 2);
    const lines = doc.splitTextToSize(jsonString, 180);
    let y = 25;
    lines.forEach(line => {
      if (y > 280) {
        doc.addPage();
        y = 15;
      }
      doc.text(line, 10, y);
      y += 5;
    });
    doc.save(`prism_mission_control_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const data = response || {};
  const analysis = data.analysis || {};
  const organization = data.organization || {};
  const watchlist = data.watchlist || {};
  const system = data.system || {};

  const formatUptime = (seconds) => {
    if (!seconds) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const verdictColors = {
    "High Credibility": "text-emerald-400 border-emerald-400/20 bg-emerald-400/10",
    "Mixed Credibility": "text-yellow-400 border-yellow-400/20 bg-yellow-400/10",
    "Low Credibility": "text-red-400 border-red-400/20 bg-red-400/10"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-8 py-6 relative z-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-prism-text-primary/10 pb-6 gap-4">
        <div>
          <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">AI Engine</span>
          <h1 className="text-4xl font-light text-prism-text-primary tracking-wide mt-1">Mission Control</h1>
          <p className="text-sm text-prism-text-secondary mt-2 max-w-2xl">
            Live system telemetry, credibility intelligence, and organizational coverage.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            size="sm" 
            className={cn(
              "gap-2 shadow-none transition-colors",
              isLight 
                ? "!bg-pink-100 hover:!bg-pink-200 !text-rose-950 !border !border-pink-300" 
                : "!bg-[#1A1D2D] hover:!bg-[#252A40] !text-prism-text-primary !border-none"
            )}
            onClick={handleExport}
          >
            <Activity size={14} className={isLight ? "text-rose-900" : "text-prism-text-primary opacity-80"} /> Export Logs
          </Button>
          <Button 
            size="sm" 
            className={cn(
              "gap-2 shadow-none transition-colors",
              isLight 
                ? "!bg-pink-100 hover:!bg-pink-200 !text-rose-950 !border !border-pink-300" 
                : "!bg-prism-text-primary !text-prism-bg hover:opacity-80 !border-none"
            )}
            onClick={handleRefresh}
          >
            Refresh Data <RefreshCw size={14} className={cn(isLight ? "text-rose-900" : "", isRefetching ? "animate-spin" : "")} />
          </Button>
        </div>
      </div>

      {isLoading && !data.system ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <RefreshCw size={24} className="animate-spin text-prism-cyan mb-4" />
          <p className="font-mono text-xs tracking-widest uppercase">Initializing Telemetry...</p>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* TOTAL ANALYSES */}
            <div className="p-5 rounded-2xl glass-panel-blue">
              <span className="text-xs font-mono text-prism-text-muted uppercase tracking-wider">TOTAL ANALYSES</span>
              <div className="text-3xl font-light text-prism-text-primary mt-2">
                {analysis.totalReports !== undefined ? analysis.totalReports.toLocaleString() : '—'}
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-1 block tracking-wider uppercase">
                {analysis.savedReports || 0} SAVED • {analysis.pinnedReports || 0} PINNED
              </span>
            </div>

            {/* AVERAGE CREDIBILITY */}
            <div className="p-5 rounded-2xl glass-panel-blue">
              <span className="text-xs font-mono text-prism-text-muted uppercase tracking-wider">AVG CREDIBILITY</span>
              <div className="text-3xl font-light text-prism-text-primary mt-2">
                {analysis.averageScore !== null && analysis.averageScore !== undefined ? `${analysis.averageScore}/100` : '—'}
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-1 block tracking-wider uppercase">
                Global Average
              </span>
            </div>

            {/* WATCHLIST COVERAGE */}
            <div className="p-5 rounded-2xl glass-panel-blue">
              <span className="text-xs font-mono text-prism-text-muted uppercase tracking-wider">WATCHLIST COVERAGE</span>
              <div className="text-3xl font-light text-prism-text-primary mt-2">
                {watchlist.active !== undefined ? watchlist.active.toLocaleString() : '—'}
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-1 block tracking-wider uppercase">
                ACTIVE / {watchlist.total || 0} TOTAL ({watchlist.paused || 0} PAUSED)
              </span>
            </div>

            {/* ORGANIZATION */}
            <div className="p-5 rounded-2xl glass-panel-blue">
              <span className="text-xs font-mono text-prism-text-muted uppercase tracking-wider">ORGANIZATION</span>
              <div className="text-3xl font-light text-prism-text-primary mt-2">
                {organization.collections !== undefined ? organization.collections.toLocaleString() : '—'}
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-1 block tracking-wider uppercase">
                COLLECTIONS • {analysis.totalBatchReports || 0} BATCH OPS
              </span>
            </div>
            
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            
            {/* Analytical Distributions */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Verdict Distribution */}
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-prism-text-primary/5 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <PieChart className="text-cyan-400" size={20} />
                    <h3 className="text-lg font-light text-prism-text-primary">Credibility Verdict Distribution</h3>
                  </div>
                </div>

                {!analysis.verdictDistribution || Object.keys(analysis.verdictDistribution).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-50">
                    <p className="font-mono text-xs tracking-widest uppercase text-prism-text-muted">No verdicts generated yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(analysis.verdictDistribution).map(([verdict, count]) => {
                      const colorClasses = verdictColors[verdict] || "text-prism-cyan border-prism-cyan/20 bg-prism-cyan/10";
                      return (
                        <div key={verdict} className={cn("p-4 rounded-xl border flex flex-col justify-between h-24", colorClasses)}>
                          <span className="text-[10px] font-mono tracking-widest uppercase opacity-80">{verdict}</span>
                          <span className="text-3xl font-light">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Source Type Distribution */}
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-prism-text-primary/5 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="text-cyan-400" size={20} />
                    <h3 className="text-lg font-light text-prism-text-primary">Source Modality Analytics</h3>
                  </div>
                </div>

                {!analysis.sourceTypeDistribution || Object.keys(analysis.sourceTypeDistribution).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-50">
                    <p className="font-mono text-xs tracking-widest uppercase text-prism-text-muted">No sources analyzed yet</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(analysis.sourceTypeDistribution).map(([type, count]) => (
                      <div key={type} className="flex-1 min-w-[120px] p-4 rounded-xl glass-panel border border-prism-border flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl font-light text-prism-text-primary">{count}</span>
                        <span className="text-[10px] font-mono tracking-widest uppercase text-prism-text-muted">{type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* System Status Panel */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl space-y-6">
              <div className="border-b border-prism-text-primary/5 pb-4">
                <h3 className="text-lg font-light text-prism-text-primary flex items-center gap-3">
                  <Server className="text-prism-cyan" size={18} />
                  System Overview
                </h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <div className="text-[10px] font-mono text-prism-text-primary/40 uppercase tracking-widest mb-1">Overall Status</div>
                  <div className={cn("text-lg tracking-wide flex items-center gap-2", 
                    system.status === "OPERATIONAL" ? "text-emerald-400" : "text-yellow-400"
                  )}>
                    {system.status === "OPERATIONAL" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    {system.status || "UNKNOWN"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-prism-text-primary/40 uppercase tracking-widest mb-1">AI Provider</div>
                  <div className="text-sm text-prism-text-primary/90 font-medium">
                    {(!system.aiProvider || system.aiProvider.includes('3.5')) ? 'gemini-3.7-flash' : system.aiProvider}
                  </div>
                  <div className="text-[10px] text-prism-cyan/70 mt-1">{data.health?.aiProvider?.message || "Configured — availability verified during analysis"}</div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-prism-text-primary/40 uppercase tracking-widest mb-1">Database Latency</div>
                  <div className="text-sm text-prism-text-primary/90">
                    {data.health?.database?.latencyMs !== undefined ? `${data.health.database.latencyMs}ms` : '—'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-prism-text-primary/40 uppercase tracking-widest mb-1">API Node Memory</div>
                  <div className="text-sm text-prism-text-primary/90">
                    {data.health?.api?.memoryUsedMB !== undefined ? `${data.health.api.memoryUsedMB} MB` : '—'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-prism-text-primary/40 uppercase tracking-widest mb-1">Process Uptime</div>
                  <div className="text-sm text-prism-text-primary/90">
                    {formatUptime(data.health?.api?.uptimeSeconds)}
                  </div>
                </div>
                
                <div>
                  <div className="text-[10px] font-mono text-prism-text-primary/40 uppercase tracking-widest mb-1">Watchlist Integrity</div>
                  <div className="text-sm text-prism-text-primary/90">
                    {watchlist.neverChecked > 0 ? (
                      <span className="text-yellow-400 flex items-center gap-1"><AlertTriangle size={12}/> {watchlist.neverChecked} pending scans</span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12}/> 100% Scanned</span>
                    )}
                  </div>
                </div>
                
                <div className="pt-2 border-t border-prism-text-primary/5">
                  <div className="text-[10px] font-mono text-prism-text-primary/40 uppercase tracking-widest mb-1">Analysis Capabilities</div>
                  <div className="text-xs text-prism-cyan/80 mt-1 leading-relaxed">
                    {data.health?.analysis?.message || "Multi-modal processing enabled"}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Manual Refresh Overlay */}
      <AnimatePresence>
        {isManualRefreshing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center justify-center p-10 rounded-3xl bg-prism-surface/95 dark:bg-[#0a0a0a] border border-prism-cyan/30 shadow-[0_0_50px_rgba(34,211,238,0.15)]"
            >
              <RefreshCw size={40} className="text-prism-cyan animate-spin mb-6" />
              <div className="text-2xl font-light text-prism-text-primary tracking-widest uppercase">Aggregating Intelligence</div>
              <div className="text-sm font-mono text-emerald-600 dark:text-emerald-400 mt-3 animate-pulse">Near-real-time synchronization...</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
