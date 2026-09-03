import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Activity as ActivityIcon, 
  Search,
  CheckCircle2,
  Bookmark,
  Pin,
  FolderPlus,
  Trash2,
  RefreshCw,
  Download,
  AlertCircle,
  Eye,
  FileText,
  Clock,
  ShieldCheck,
  Cpu,
  ArrowUpRight
} from 'lucide-react';
import { EmptyState } from '../components/shared/EmptyState';
import { activityApi } from '../services/api/activity.api';
import { useSettingsStore } from '../store/settingsStore';
import { useThemeStore } from '../store/themeStore';
import { Button } from '../components/shared/Button';
import { cn } from '../utils/cn';

const EVENT_ICONS = {
  ANALYSIS_COMPLETED: <CheckCircle2 size={16} className="text-prism-cyan" />,
  ANALYSIS_FAILED: <AlertCircle size={16} className="text-red-400" />,
  BATCH_ANALYSIS_COMPLETED: <FileText size={16} className="text-prism-cyan" />,
  BATCH_ANALYSIS_FAILED: <AlertCircle size={16} className="text-red-400" />,
  REPORT_SAVED: <Bookmark size={16} className="text-prism-high" />,
  REPORT_UNSAVED: <Bookmark size={16} className="text-prism-text-muted" />,
  REPORT_PINNED: <Pin size={16} className="text-prism-accent" />,
  REPORT_UNPINNED: <Pin size={16} className="text-prism-text-muted" />,
  REPORT_DELETED: <Trash2 size={16} className="text-prism-low" />,
  REPORT_REANALYZED: <RefreshCw size={16} className="text-prism-cyan" />,
  COLLECTION_CREATED: <FolderPlus size={16} className="text-prism-accent" />,
  REPORT_ADDED_TO_COLLECTION: <FolderPlus size={16} className="text-prism-high" />,
  REPORT_REMOVED_FROM_COLLECTION: <Trash2 size={16} className="text-prism-text-muted" />,
  COLLECTION_DELETED: <Trash2 size={16} className="text-prism-low" />,
  WATCHLIST_CREATED: <Eye size={16} className="text-prism-accent" />,
  WATCHLIST_CHECKED: <Search size={16} className="text-prism-cyan" />,
  WATCHLIST_CHANGED: <AlertCircle size={16} className="text-yellow-400" />,
  WATCHLIST_PAUSED: <Clock size={16} className="text-prism-text-muted" />,
  WATCHLIST_RESUMED: <Eye size={16} className="text-prism-cyan" />,
  WATCHLIST_DELETED: <Trash2 size={16} className="text-prism-low" />,
  REPORT_EXPORTED: <Download size={16} className="text-prism-text-secondary" />
};

export const Activity = () => {
  const navigate = useNavigate();
  const { settings } = useSettingsStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const { autoRefresh, autoRefreshInterval } = settings;

  const [latencyMs, setLatencyMs] = useState(8);

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['activity'],
    queryFn: async () => {
      const start = performance.now();
      const res = await activityApi.getActivity({ limit: 100 });
      setLatencyMs(Math.round(performance.now() - start));
      return res;
    },
    refetchInterval: autoRefresh ? autoRefreshInterval * 1000 : false,
  });

  const activities = response?.data || [];
  const totalEvents = response?.pagination?.total || 0;

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsManualRefreshing(false);
    }, 1200);
  };

  const handleExport = () => {
    if (!activities || activities.length === 0) return;
    
    const headers = ['SYS_ID', 'EVENT_TYPE', 'ENTITY_TYPE', 'TITLE', 'TIMESTAMP', 'DESCRIPTION'];
    const csvRows = [headers.join(',')];
    
    activities.forEach(activity => {
      const id = activity.entityId || 'NULL';
      const eventType = activity.eventType;
      const entityType = activity.entityType || 'System';
      const title = `"${(activity.title || '').replace(/"/g, '""')}"`;
      const timestamp = new Date(activity.createdAt).toISOString();
      const desc = `"${(activity.description || '').replace(/"/g, '""')}"`;
      
      csvRows.push([id, eventType, entityType, title, timestamp, desc].join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `prism_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEventClick = (event) => {
    if (event.eventType.includes('DELETED')) return;
    
    if (event.entityType === 'Report' && event.entityId) {
      navigate(`/report/${event.entityId}`, { state: { fromActivity: true } });
    } else if (event.entityType === 'BatchReport' && event.entityId) {
      navigate(`/batch/${event.entityId}`);
    } else if (event.entityType === 'Collection' && event.entityId) {
      navigate(`/collection/${event.entityId}`);
    } else if (event.entityType === 'Watchlist') {
      navigate(`/watchlist`);
    }
  };

  const systemStatus = isError ? 'OFFLINE' : (isLoading && !activities.length ? 'CONNECTING' : 'ONLINE');
  const streamMode = isError ? 'DISCONNECTED' : 'REAL-TIME';

  const metrics = [
    { 
      label: 'Total Events Logged', 
      value: totalEvents.toLocaleString(), 
      change: 'Immutable Ledger',
      valueColor: 'text-prism-text-primary',
      changeColor: 'text-emerald-400'
    },
    { 
      label: 'System Status', 
      value: systemStatus, 
      change: `Latency: ${isError ? '--' : latencyMs}ms`,
      valueColor: isError ? 'text-red-400' : 'text-prism-text-primary',
      changeColor: isError ? 'text-prism-text-muted' : (latencyMs > 200 ? 'text-yellow-400' : 'text-emerald-400')
    },
    { 
      label: 'Stream Mode', 
      value: streamMode, 
      change: isError ? 'Manual refresh required' : 'Auto-refreshing',
      valueColor: isError ? 'text-red-400' : 'text-prism-text-primary',
      changeColor: isError ? 'text-red-400' : 'text-emerald-400'
    }
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
          <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">Forensic Trace</span>
          <h1 className="text-4xl font-light text-prism-text-primary tracking-wide mt-1">Audit Activity Log</h1>
          <p className="text-sm text-prism-text-secondary mt-2 max-w-2xl">
            Complete immutable audit trail of document uploads, queries, organization, and model outputs.
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
            <ActivityIcon size={14} className={isLight ? "text-rose-900" : "opacity-80"} /> Export Logs
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
            Refresh Log <ArrowUpRight size={14} className={isLight ? "text-rose-900" : ""} />
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-5 rounded-2xl glass-panel-blue">
            <span className="text-xs font-mono text-prism-text-muted uppercase tracking-wider">{m.label}</span>
            <div className={cn("text-3xl font-light mt-2 transition-colors", m.valueColor)}>{m.value}</div>
            <span className={cn("text-xs font-mono mt-1 block transition-colors", m.changeColor)}>{m.change}</span>
          </div>
        ))}
      </div>

      {/* Main Glass Workspace Card */}
      <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl relative overflow-hidden space-y-6">
        <div className="flex items-center justify-between border-b border-prism-text-primary/5 pb-4">
          <div className="flex items-center gap-3">
            <Cpu className="text-cyan-400 animate-pulse" size={20} />
            <h3 className="text-lg font-light text-prism-text-primary">Live Intelligence Stream</h3>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Stream Active</span>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <RefreshCw size={24} className="animate-spin text-prism-cyan mb-4" />
            <p className="font-mono text-xs tracking-widest uppercase">Syncing Trace Logs...</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={32} className="text-prism-low mb-4 opacity-50" />
            <p className="font-mono text-xs tracking-widest uppercase text-prism-low">Telemetry Disconnected</p>
          </div>
        )}

        {!isLoading && !isError && activities.length === 0 && (
          <div className="py-20 flex justify-center">
            <EmptyState 
              icon={ActivityIcon}
              title="No System Trace Events Found"
              description="Platform telemetry stream is currently empty."
            />
          </div>
        )}

        {!isLoading && !isError && activities.length > 0 && (
          <div className="space-y-3 font-mono text-xs text-gray-300">
            <AnimatePresence>
              {activities.map((activity) => {
                const isDeletedEvent = activity.eventType.includes('DELETED') || activity.eventType.includes('REMOVED') || activity.eventType.includes('UNPINNED') || activity.eventType.includes('UNSAVED');
                
                return (
                  <motion.div 
                    key={activity._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleEventClick(activity)}
                    className={cn(
                      "p-4 rounded-xl glass-panel border border-prism-border flex flex-col gap-2 transition-colors",
                      !isDeletedEvent && "hover:border-prism-cyan/50 cursor-pointer hover:shadow-prism-glow"
                    )}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <div className="flex items-center gap-3">
                        <span className="opacity-70">
                          {EVENT_ICONS[activity.eventType] || <ActivityIcon size={14} className="text-prism-text-muted" />}
                        </span>
                        <span className="uppercase tracking-wider font-semibold opacity-90">{activity.eventType.replace(/_/g, ' ')}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-emerald-400/70">
                        <span>SYS_ID: {activity.entityId ? activity.entityId.slice(-8).toUpperCase() : 'NULL'}</span>
                        <span>{new Date(activity.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1 pl-7">
                      <span className="text-sm font-sans font-light text-prism-text-primary truncate max-w-[70%]">
                        {activity.title}
                      </span>
                      {!isDeletedEvent && (
                        <span className="text-[10px] text-prism-cyan/70 opacity-0 group-hover:opacity-100 flex items-center gap-1 uppercase tracking-widest">
                          ACCESS RECORD <ArrowUpRight size={12} />
                        </span>
                      )}
                    </div>
                    
                    {/* Specific metadata rendering for WATCHLIST_CHANGED */}
                    {activity.eventType === 'WATCHLIST_CHANGED' && activity.metadata && (
                      <div className="mt-2 pl-7 flex gap-4 text-emerald-400">
                        <span>DELTA_DETECTED</span>
                        <span>SCORE: {activity.metadata.newScore - activity.metadata.scoreChange} → {activity.metadata.newScore}</span>
                        <span>VERDICT: {activity.metadata.newVerdict}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

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
              <div className="text-2xl font-light text-prism-text-primary tracking-widest uppercase">Syncing Telemetry</div>
              <div className="text-sm font-mono text-emerald-600 dark:text-emerald-400 mt-3 animate-pulse">Re-establishing secure connection...</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
