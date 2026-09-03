import { create } from 'zustand';
import { settingsApi } from '../services/api/settings.api';

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('prism_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Fallback to dark if localStorage is inaccessible
  }
  return 'dark';
};

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    const currentTheme = get().theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('prism_theme', nextTheme);
    } catch {
      // Ignore localStorage write failure in restricted iframe/private mode
    }
    set({ theme: nextTheme });
    settingsApi.updateSettings({ theme: nextTheme }).catch(() => {});
  },
  setTheme: (newTheme) => {
    if (!newTheme || (newTheme !== 'dark' && newTheme !== 'light')) return;
    try {
      localStorage.setItem('prism_theme', newTheme);
    } catch {
      // Ignore localStorage write failure in restricted iframe/private mode
    }
    set({ theme: newTheme });
    settingsApi.updateSettings({ theme: newTheme }).catch(() => {});
  },
}));
