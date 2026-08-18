import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useExperienceStore } from './store/experienceStore';

import { UploadWorkspace } from './pages/UploadWorkspace';
import { ReportView } from './pages/ReportView';
import { BatchDashboard } from './pages/BatchDashboard';
import { AnalysisArchive } from './pages/AnalysisArchive';
import { SettingsView } from './pages/SettingsView';
import { GenericPlatformView } from './pages/GenericPlatformView';
import { ExperienceTimeline } from './components/missionControl/ExperienceTimeline';

export const AnimatedRoutes = () => {
  const location = useLocation();
  const setProfile = useExperienceStore((state) => state.setProfile);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/report/')) {
      setProfile('report');
    } else if (path === '/archive') {
      setProfile('archive');
    } else if (path === '/mission-control') {
      setProfile('missionControl');
    } else if (path === '/watchlist') {
      setProfile('watchlist');
    } else {
      setProfile('workspace'); // default fallback
    }
  }, [location.pathname, setProfile]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<UploadWorkspace />} />
        <Route path="/report/:id" element={<ReportView />} />
        <Route path="/batch/:id" element={<BatchDashboard />} />
        <Route path="/archive" element={<AnalysisArchive />} />
        <Route path="/settings" element={<SettingsView />} />
        
        {/* Expanded Navigation Platform Routes */}
        <Route path="/saved" element={<GenericPlatformView title="Saved Reports" category="Platform Archive" description="Pinned verification reports, forensic audits, and saved claim extractions." metrics={[{ label: 'Saved Reports', value: '42', change: '+5 this week' }, { label: 'Flagged Claims', value: '128', change: '84% verified' }]} />} />
        <Route path="/collections" element={<GenericPlatformView title="Intelligence Collections" category="Folder Workspace" description="Grouped investigation folders for multi-file deep dives and cross-referenced campaigns." metrics={[{ label: 'Active Folders', value: '14', change: 'Synced to Vault' }, { label: 'Shared Leads', value: '6', change: '3 Analysts Active' }]} />} />
        <Route path="/watchlist" element={<GenericPlatformView title="Monitored Entities & Claims" category="Real-time Tracking" description="Automated monitoring rules tracking emerging viral claims and high-risk domain sources." metrics={[{ label: 'Monitored Sources', value: '380', change: 'Live Feeds' }, { label: 'Alert Rate', value: '12 / day', change: 'Low Noise Filter' }]} />} />
        <Route path="/mission-control" element={
          <GenericPlatformView title="Mission Control" category="AI Engine" description="Live multi-modal GPU pipeline telemetry, model weights status, and batch synthesis queues." metrics={[{ label: 'Active Pipeline', value: 'v2.4 Quantum', change: 'GPU 98% Opt' }, { label: 'Avg Latency', value: '14ms', change: '-4ms speedup' }]}>
            <ExperienceTimeline />
          </GenericPlatformView>
        } />
        <Route path="/activity" element={<GenericPlatformView title="Audit Activity Log" category="Forensic Trace" description="Complete immutable audit trail of document uploads, query extractions, and model outputs." metrics={[{ label: 'Total Queries', value: '1,420', change: 'All Verified' }, { label: 'Session Hash', value: '0x8f...3a', change: 'Cryptographic' }]} />} />
        <Route path="/api-status" element={<GenericPlatformView title="API & SDK Telemetry" category="Developer Access" description="REST API endpoint health, rate limit quotas, webhooks, and Python SDK connections." metrics={[{ label: 'Endpoint Uptime', value: '99.99%', change: 'All Operational' }, { label: 'Quota Used', value: '24%', change: '10k requests remaining' }]} />} />
        <Route path="/docs" element={<GenericPlatformView title="Prism Scientific Documentation" category="Methodology & Architecture" description="Technical documentation on claim extraction, Bayesian credibility scoring, and source graph analysis." metrics={[{ label: 'Algorithm Paper', value: 'v3.1', change: 'Peer Reviewed' }, { label: 'Model Docs', value: '48 Pages', change: 'Open Specs' }]} />} />
      </Routes>
    </AnimatePresence>
  );
};

