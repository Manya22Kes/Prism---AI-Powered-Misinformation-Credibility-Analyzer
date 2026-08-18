import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, Database, ArrowUpRight, Cpu } from 'lucide-react';
import { Button } from '../components/shared/Button';

export const GenericPlatformView = ({ title, category, description, metrics, children }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-8 py-6 relative z-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
        <div>
          <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">{category}</span>
          <h1 className="text-4xl font-light text-white tracking-wide mt-1">{title}</h1>
          <p className="text-sm text-prism-text-secondary mt-2 max-w-2xl">{description}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" className="gap-2">
            <Activity size={14} /> Export Logs
          </Button>
          <Button size="sm" className="bg-white text-black hover:bg-gray-200 gap-2">
            Refresh Data <ArrowUpRight size={14} />
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {metrics.map((m, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl">
              <span className="text-xs font-mono text-prism-text-muted uppercase tracking-wider">{m.label}</span>
              <div className="text-3xl font-light text-white mt-2">{m.value}</div>
              <span className="text-xs font-mono text-emerald-400 mt-1 block">{m.change}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Glass Workspace Card */}
      <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl relative overflow-hidden space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <Cpu className="text-cyan-400" size={20} />
          <h3 className="text-lg font-light text-white">Live Intelligence Stream</h3>
        </div>

        <div className="space-y-4 font-mono text-xs text-gray-300">
          <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Multi-Modal Synthesizer Status</span>
            </div>
            <span className="text-emerald-400">ONLINE (LATENCY 8ms)</span>
          </div>

          <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Database size={16} className="text-indigo-400" />
              <span>Knowledge Graph Indexing Rate</span>
            </div>
            <span className="text-indigo-300">14,200 CLAIMS / SEC</span>
          </div>
        </div>
      </div>
      
      {children}
    </motion.div>
  );
};
