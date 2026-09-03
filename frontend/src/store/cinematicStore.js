import { create } from 'zustand';

export const useCinematicStore = create((set) => ({
  // Core states
  prismState: 'idle',
  ambientIntensity: 1,
  
  openingSequenceStep: 7,
  isSequenceComplete: true,
  
  // 3D positioning
  prismPosition: [0, 0, 0], // x, y, z
  prismScale: 1,
  
  // Environment controls
  fogIntensity: 0,
  noiseIntensity: 0.05,
  particleSpeed: 1,

  // Actions
  setPrismState: (state) => set({ prismState: state }),
  setPrismPosition: (position) => set({ prismPosition: position }),
  setPrismScale: (scale) => set({ prismScale: scale }),
  
  // Sequence Actions
  skipSequence: () => {
    sessionStorage.setItem('prism_sequence_played', 'true');
    set({ openingSequenceStep: 7, isSequenceComplete: true, ambientIntensity: 1, fogIntensity: 0 });
  },

  setSequenceStep: (step) => {
    if (step >= 7) {
      sessionStorage.setItem('prism_sequence_played', 'true');
      set({ openingSequenceStep: 7, isSequenceComplete: true });
    } else {
      set({ openingSequenceStep: step });
    }
  },
  
  // Preset Environments
  setEnvironmentVault: () => set({ 
    ambientIntensity: 0.3, 
    fogIntensity: 0.5, 
    noiseIntensity: 0.1,
    particleSpeed: 0.2,
    prismState: 'vault'
  }),
  setEnvironmentWorkspace: () => set({ 
    ambientIntensity: 1, 
    fogIntensity: 0, 
    noiseIntensity: 0.05,
    particleSpeed: 1,
    prismState: 'idle'
  }),
  setEnvironmentProcessing: () => set({ 
    ambientIntensity: 0.5, 
    fogIntensity: 0.2, 
    noiseIntensity: 0.15,
    particleSpeed: 3,
    prismState: 'processing'
  }),
  setEnvironmentReading: () => set({ 
    ambientIntensity: 0.4, 
    fogIntensity: 0.1, 
    noiseIntensity: 0.02,
    particleSpeed: 0.3,
    prismPosition: [6, -4, -12],
    prismScale: 0.5,
    prismState: 'reading'
  }),
}));

