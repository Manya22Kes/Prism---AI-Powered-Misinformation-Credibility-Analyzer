import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: 'dark', // default to dark per instructions
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setTheme: (theme) => set({ theme }),
}));
