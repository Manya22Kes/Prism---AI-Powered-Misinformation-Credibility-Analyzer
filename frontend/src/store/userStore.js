import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      profileName: 'Analyst Team',
      avatarUrl: null,
      setProfileName: (name) => set({ profileName: name }),
      setAvatarUrl: (url) => set({ avatarUrl: url })
    }),
    {
      name: 'prism-user-storage'
    }
  )
);
