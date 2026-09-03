import { create } from 'zustand';
import { settingsApi } from '../services/api/settings.api';
import { useThemeStore } from './themeStore';

export const useSettingsStore = create((set, get) => ({
  settings: {
    theme: 'dark',
    reducedMotion: false,
    autoRefresh: true,
    autoRefreshInterval: 60,
  },
  isInitialized: false,
  
  initialize: async () => {
    if (get().isInitialized) return;
    try {
      const res = await settingsApi.getSettings();
      const settingsData = res.data || res;
      const localTheme = localStorage.getItem('prism_theme');
      const activeTheme = localTheme || settingsData?.theme || 'dark';

      if (settingsData) {
        set({ settings: { ...get().settings, ...settingsData, theme: activeTheme }, isInitialized: true });
        useThemeStore.getState().setTheme(activeTheme);
        if (typeof settingsData.reducedMotion === 'boolean') {
          document.documentElement.classList.toggle('reduce-motion', settingsData.reducedMotion);
        }
      } else {
        set({ isInitialized: true });
        useThemeStore.getState().setTheme(activeTheme);
      }
    } catch (error) {
      console.warn('Settings API unavailable, using default preferences:', error.message);
      const localTheme = localStorage.getItem('prism_theme') || 'dark';
      set({ isInitialized: true });
      useThemeStore.getState().setTheme(localTheme);
    }
  },

  updateSetting: async (key, value) => {
    const prevSettings = get().settings;
    const newSettings = { ...prevSettings, [key]: value };
    
    // Optimistic update
    set({ settings: newSettings });

    if (key === 'theme') {
      useThemeStore.getState().setTheme(value);
    }
    if (key === 'reducedMotion') {
      document.documentElement.classList.toggle('reduce-motion', Boolean(value));
    }
    
    try {
      await settingsApi.updateSettings(newSettings);
    } catch (error) {
      // Revert on failure
      set({ settings: prevSettings });
      if (key === 'theme') {
        useThemeStore.getState().setTheme(prevSettings.theme);
      }
      if (key === 'reducedMotion') {
        document.documentElement.classList.toggle('reduce-motion', Boolean(prevSettings.reducedMotion));
      }
      throw error;
    }
  },

  resetToDefaults: async () => {
    const res = await settingsApi.updateSettings({ resetToDefaults: true });
    const settingsData = res.data || res;
    if (settingsData) {
      set({ settings: settingsData });
      useThemeStore.getState().setTheme(settingsData.theme || 'dark');
      document.documentElement.classList.toggle('reduce-motion', Boolean(settingsData.reducedMotion));
    }
  },
}));
