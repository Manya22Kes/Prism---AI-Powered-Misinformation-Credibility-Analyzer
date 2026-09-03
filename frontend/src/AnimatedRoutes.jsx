import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useExperienceStore } from './store/experienceStore';

import { UploadWorkspace } from './pages/UploadWorkspace';
import { ReportView } from './pages/ReportView';
import { BatchDashboard } from './pages/BatchDashboard';
import { AnalysisArchive } from './pages/AnalysisArchive';
import { SavedReports } from './pages/SavedReports';
import { Collections } from './pages/Collections';
import { CollectionDetail } from './pages/CollectionDetail';
import { Watchlist } from './pages/Watchlist';
import { Activity } from './pages/Activity';
import { SettingsView } from './pages/SettingsView';
import { APIStatus } from './pages/APIStatus';
import { MissionControl } from './pages/MissionControl';
import { Documentation } from './pages/Documentation';
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
    } else if (path === '/activity') {
      setProfile('activity');
    } else {
      setProfile('workspace'); // default fallback
    }
  }, [location.pathname, setProfile]);

  return (
    <Routes location={location}>
      <Route path="/" element={<UploadWorkspace />} />
      <Route path="/report/:id" element={<ReportView />} />
      <Route path="/batch/:id" element={<BatchDashboard />} />
      <Route path="/archive" element={<AnalysisArchive />} />
      <Route path="/settings" element={<SettingsView />} />
      
      {/* Expanded Navigation Platform Routes */}
      <Route path="/saved" element={<SavedReports />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/collection/:id" element={<CollectionDetail />} />
      <Route path="/watchlist" element={<Watchlist />} />
      <Route path="/mission-control" element={<MissionControl />} />
      <Route path="/activity" element={<Activity />} />
      <Route path="/api-status" element={<APIStatus />} />
      <Route path="/docs" element={<Documentation />} />
      <Route path="/experience-timeline" element={<ExperienceTimeline />} />
      <Route path="*" element={<UploadWorkspace />} />
    </Routes>
  );
};
