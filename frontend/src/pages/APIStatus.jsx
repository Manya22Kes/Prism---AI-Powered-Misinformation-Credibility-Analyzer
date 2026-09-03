import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, Database, Brain, Cpu, Layers, RefreshCw, 
  CheckCircle2, AlertCircle, AlertTriangle, ArrowUpRight, Activity
} from 'lucide-react';
import { jsPDF } from "jspdf";
import { healthApi } from '../services/api/health.api';
import { useSettingsStore } from '../store/settingsStore';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/shared/Button';
import { cn } from '../utils/cn';

export const APIStatus = () => {
  const { settings } = useSettingsStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const { autoRefresh, autoRefreshInterval } = settings;
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data: health, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      try {
        const res = await healthApi.getHealth();
        return res;
      } catch (err) {
        // Axios interceptor attaches response data to error.data for 5xx errors
        if (err.data) {
          return err.data; // Return the degraded health payload so UI can render it
        }
        throw err; // Completely unreachable
      }
    },
    refetchInterval: autoRefresh ? autoRefreshInterval * 1000 : false,
    retry: 1
  });

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsManualRefreshing(false);
    }, 1200);
  };

  const handleExport = () => {
    if (!health) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Prism API Status Telemetry", 10, 15);
    doc.setFontSize(10);
    const jsonString = JSON.stringify(health, null, 2);
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
    doc.save(`prism_system_health_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const isApiUnreachable = isError && !error?.data;
  const healthData = health; 

  let overallStatus = "ALL SYSTEMS OPERATIONAL";
  let statusColor = "text-emerald-400";
  let StatusIcon = CheckCircle2;
  let statusBg = "bg-emerald-400/10 border-emerald-400/20";

  if (isApiUnreachable) {
    overallStatus = "SYSTEM UNAVAILABLE";
    statusColor = "text-red-400";
    StatusIcon = AlertCircle;
    statusBg = "bg-red-400/10 border-red-400/20";
  } else if (healthData?.status === "degraded") {
    overallStatus = "DEGRADED";
    statusColor = "text-yellow-400";
    StatusIcon = AlertTriangle;
    statusBg = "bg-yellow-400/10 border-yellow-400/20";
  }

  const lastChecked = healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : "--:--:--";

  const getServiceProps = (serviceName, key, Icon) => {
    if (isApiUnreachable) {
      return {
        name: serviceName,
        icon: Icon,
        status: "UNREACHABLE",
        color: "text-red-400",
        desc: key === "api" ? "Unable to contact the Prism backend." : "Dependency status unknown."
      };
    }

    const s = healthData?.services?.[key];
    if (!s) return { name: serviceName, icon: Icon, status: "UNKNOWN", color: "text-gray-400", desc: "No telemetry" };

    let color = "text-emerald-400";
    let desc = s.message || "Service is operating normally";
    
    if (s.status === "degraded") {
      color = "text-yellow-400";
      desc = s.error || "Service is degraded";
      if (key === "database") desc = "Prism API is reachable, but database connectivity is unavailable.";
      if (key === "aiProvider") desc = "Prism's AI provider is currently unavailable or not configured.";
    }

    return {
      name: serviceName,
      icon: Icon,
      status: s.status.toUpperCase(),
      color,
      desc,
      latency: s.latencyMs
    };
  };

  const services = [
    getServiceProps("PRISM API", "api", Server),
    getServiceProps("DATABASE", "database", Database),
    getServiceProps("AI PROVIDER", "aiProvider", Brain),
    getServiceProps("ANALYSIS ENGINE", "analysis", Cpu),
    getServiceProps("BATCH ANALYSIS", "batchAnalysis", Layers)
  ];

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
          <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">Core Telemetry</span>
          <h1 className="text-4xl font-light text-prism-text-primary tracking-wide mt-1">System Health</h1>
          <p className="text-sm text-prism-text-secondary mt-2 max-w-2xl">
            Real-time status of Prism API dependencies, database connectivity, and AI provider availability.
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
            <Activity size={14} className={isLight ? "text-rose-900" : "opacity-80"} /> Export Logs
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
            Refresh Status <ArrowUpRight size={14} className={isLight ? "text-rose-900" : ""} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <RefreshCw size={24} className="animate-spin text-prism-cyan mb-4" />
          <p className="font-mono text-xs tracking-widest uppercase">Pinging Dependencies...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Status Box */}
          <div className={cn("p-6 rounded-2xl border backdrop-blur-xl flex items-center justify-between", statusBg)}>
            <div className="flex items-center gap-4">
              <StatusIcon className={statusColor} size={28} />
              <div>
                <div className="text-xs font-mono text-prism-text-primary/50 uppercase tracking-widest mb-1">System Status</div>
                <div className={cn("text-xl font-semibold tracking-wide", statusColor)}>{overallStatus}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-prism-text-primary/50 uppercase tracking-widest mb-1">Last Checked</div>
              <div className="text-sm font-mono text-prism-text-primary/80">{lastChecked}</div>
            </div>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((svc, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-prism-text-primary">
                    <svc.icon size={16} className="opacity-70" />
                    <span className="text-sm font-semibold tracking-wide uppercase">{svc.name}</span>
                  </div>
                  <div className={cn("text-xs font-mono font-bold px-2 py-1 rounded bg-prism-surface-active border border-prism-border", svc.color)}>
                    {svc.status}
                  </div>
                </div>
                <p className="text-xs text-prism-text-muted mt-1 leading-relaxed">
                  {svc.desc}
                </p>
                {svc.latency !== undefined && (
                  <div className="mt-auto pt-3 flex items-center justify-between border-t border-prism-text-primary/5">
                    <span className="text-xs font-mono text-prism-text-primary/40">LATENCY</span>
                    <span className={cn("text-xs font-mono", svc.latency > 100 ? "text-yellow-400" : "text-emerald-400")}>
                      {svc.latency}ms
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* System Info Footer */}
          <div className="mt-12 p-5 rounded-2xl glass-panel border border-prism-border flex flex-wrap gap-x-12 gap-y-4">
            <div>
              <div className="text-[10px] font-mono text-prism-text-primary/40 uppercase tracking-widest mb-1">Environment</div>
              <div className="text-xs text-prism-text-primary/70">Production</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-prism-text-primary/40 uppercase tracking-widest mb-1">App Version</div>
              <div className="text-xs text-prism-text-primary/70">v4.2</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-prism-text-primary/40 uppercase tracking-widest mb-1">API Version</div>
              <div className="text-xs text-prism-text-primary/70">v1</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-prism-text-primary/40 uppercase tracking-widest mb-1">AI Provider</div>
              <div className="text-xs text-prism-text-primary/70">
                {(() => {
                  const p = healthData?.services?.aiProvider?.provider;
                  if (!p || p.includes('3.5')) return 'gemini-3.7-flash';
                  return p;
                })()}
              </div>
            </div>
          </div>
        </div>
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
              <div className="text-2xl font-light text-prism-text-primary tracking-widest uppercase">System Diagnostics</div>
              <div className="text-sm font-mono text-emerald-600 dark:text-emerald-400 mt-3 animate-pulse">Running health checks...</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
