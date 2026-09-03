import { create } from 'zustand';
import { useCinematicStore } from './cinematicStore';

// State Priorities Engine (Higher number overrides lower number)
export const STATE_PRIORITIES = {
  error: 100,
  processing: 90,
  success: 80,
  uploadReady: 70,
  reading: 60,
  focus: 55,
  hover: 50,
  idle: 0,
};

export const PIPELINE_STAGES = [
  { id: 'input', label: 'INPUT INGESTION' },
  { id: 'extraction', label: 'TEXT EXTRACTION' },
  { id: 'claims', label: 'CLAIM DETECTION' },
  { id: 'evidence', label: 'EVIDENCE RETRIEVAL' },
  { id: 'bias', label: 'BIAS & MANIPULATION' },
  { id: 'credibility', label: 'CREDIBILITY SCORING' },
  { id: 'report', label: 'FINAL SYNTHESIS' }
];

export const useExperienceStore = create((set, get) => ({
  // Core Active State
  activeEnvironmentState: 'idle',
  
  // Set of currently active state requests (key: stateName, value: priority)
  activeRequests: { idle: 0 },
  
  // Decoupled Business/Pipeline Domain State
  pipelineStage: 'input',
  pipelineError: null,
  
  // Continuous Environmental Intensity (0 - 10)
  environmentalIntensity: 0,
  
  // Environmental Profile: 'workspace', 'report', 'reading', 'archive', 'missionControl', 'watchlist'
  environmentalProfile: 'workspace',
  
  // Reading Mode State, Awards Show Sweep & Interruption Guard
  isReadingMode: false,
  isTransitioningReadingMode: false,
  readingModeWipe: null, // 'enter' | 'exit' | null
  
  // Experience Timeline Event History
  eventHistory: [],
  
  setIntensity: (val) => set({ environmentalIntensity: Math.min(Math.max(val, 0), 10) }),
  
  setProfile: (profile) => {
    const currentProfile = get().environmentalProfile;
    if (currentProfile !== profile) {
      set({ environmentalProfile: profile });
      get().recordExperienceEvent('PROFILE_TRANSITION', { from: currentProfile, to: profile });
    }
  },

  // Awards Show Style Screen Sweep Reading Mode Transition
  enterReadingMode: (reducedMotion = false) => {
    if (get().isReadingMode) return;
    
    // Immediately set reading mode so UI reacts instantaneously
    set({ isReadingMode: true, isTransitioningReadingMode: true });
    get().setProfile('reading');

    const cinematic = useCinematicStore.getState();
    if (cinematic?.setEnvironmentReading) {
      cinematic.setEnvironmentReading();
    }

    if (reducedMotion) {
      set({ isTransitioningReadingMode: false, readingModeWipe: null });
      if (cinematic?.setPrismPosition) {
        cinematic.setPrismPosition([0, -20, -50]);
        cinematic.setPrismScale(0.001);
      }
      return;
    }

    // Trigger the Awards Show Mascot Sweep from Left to Right
    set({ readingModeWipe: 'enter' });
    if (cinematic?.setPrismState) cinematic.setPrismState('active');

    // Sweep completes at 1000ms: mascot clears offscreen
    setTimeout(() => {
      set({ readingModeWipe: null, isTransitioningReadingMode: false });
      if (cinematic?.setPrismPosition) {
        cinematic.setPrismPosition([0, -20, -50]);
        cinematic.setPrismScale(0.001);
      }
    }, 1000);
  },

  exitReadingMode: (reducedMotion = false) => {
    if (!get().isReadingMode) return;

    // Immediately revert reading mode so UI reacts instantaneously
    set({ isReadingMode: false, isTransitioningReadingMode: true });
    get().setProfile('report');

    const cinematic = useCinematicStore.getState();
    if (cinematic?.setEnvironmentWorkspace) {
      cinematic.setEnvironmentWorkspace();
    }

    if (reducedMotion) {
      set({ isTransitioningReadingMode: false, readingModeWipe: null });
      if (cinematic?.setPrismPosition) {
        cinematic.setPrismPosition([4, -2, -5]);
        cinematic.setPrismScale(1);
      }
      return;
    }

    // Trigger Return Sweep across screen back to position
    set({ readingModeWipe: 'exit' });
    if (cinematic?.setPrismState) cinematic.setPrismState('active');

    // Sweep completes and settles at 1000ms
    setTimeout(() => {
      set({ readingModeWipe: null, isTransitioningReadingMode: false });
      if (cinematic?.setPrismPosition) {
        cinematic.setPrismPosition([4, -2, -5]);
        cinematic.setPrismScale(1);
      }
    }, 1000);
  },
  
  // Internal helper to evaluate highest priority active state
  reevaluateState: () => {
    const { activeRequests } = get();
    let highestState = 'idle';
    let highestPriority = 0;

    Object.entries(activeRequests).forEach(([stateName, priority]) => {
      if (priority >= highestPriority) {
        highestPriority = priority;
        highestState = stateName;
      }
    });

    set({ activeEnvironmentState: highestState });
  },

  // Request/Release Environmental States
  requestState: (stateName) => {
    const priority = STATE_PRIORITIES[stateName] ?? 0;
    set((prev) => ({
      activeRequests: { ...prev.activeRequests, [stateName]: priority }
    }));
    get().reevaluateState();
  },

  releaseState: (stateName) => {
    set((prev) => {
      const nextRequests = { ...prev.activeRequests };
      delete nextRequests[stateName];
      // Ensure idle remains
      if (Object.keys(nextRequests).length === 0) {
        nextRequests.idle = 0;
      }
      return { activeRequests: nextRequests };
    });
    get().reevaluateState();
  },

  setPipelineStage: (stage) => {
    const currentStage = get().pipelineStage;
    if (currentStage !== stage) {
      set({ pipelineStage: stage });
      get().recordExperienceEvent('PIPELINE_STAGE_TRANSITION', { from: currentStage, to: stage });
    }
  },

  // Event History API
  recordExperienceEvent: (eventType, payload = {}) => {
    set((prev) => {
      const newEvent = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        eventType,
        pipelineStage: prev.pipelineStage,
        environmentalProfile: prev.environmentalProfile,
        environmentalIntensity: prev.environmentalIntensity,
        activeEnvironmentState: prev.activeEnvironmentState,
        payload
      };
      
      const updatedHistory = [...prev.eventHistory, newEvent]
        // Sort chronologically just in case
        .sort((a, b) => a.timestamp - b.timestamp)
        // Hard limit at 200 items
        .slice(-200);

      return { eventHistory: updatedHistory };
    });
  },

  clearExperienceHistory: () => set({ eventHistory: [] }),
  getExperienceHistory: () => get().eventHistory,

  // Centralized Event-Driven Semantic Dispatcher
  emitExperienceEvent: (eventType, payload = {}) => {
    const { requestState, releaseState, setPipelineStage, setIntensity, recordExperienceEvent } = get();

    // Record the explicit event (pipeline stages and profiles are recorded internally)
    if (eventType !== 'ANALYSIS_STAGE_CHANGED') {
      recordExperienceEvent(eventType, payload);
    }

    switch (eventType) {
      case 'UPLOAD_HOVER_START':
        requestState('uploadReady');
        break;
      case 'UPLOAD_HOVER_END':
        releaseState('uploadReady');
        break;

      case 'CARD_HOVER_START':
        requestState('hover');
        break;
      case 'CARD_HOVER_END':
        releaseState('hover');
        break;

      case 'INPUT_FOCUS_START':
        requestState('focus');
        break;
      case 'INPUT_FOCUS_END':
        releaseState('focus');
        break;

      case 'REPORT_OPENED':
        requestState('reading');
        break;
      case 'REPORT_CLOSED':
        releaseState('reading');
        break;

      case 'ANALYSIS_STARTED':
        // Micro-Staggered Timeline Dispatcher
        requestState('processing');
        setPipelineStage('input');
        
        // Set contextual workload intensity if provided, else default to 4
        setIntensity(payload.workloadIntensity ?? 4);
        
        // Micro-stagger timeline updates
        setTimeout(() => setPipelineStage('extraction'), 400);
        setTimeout(() => setPipelineStage('claims'), 900);
        setTimeout(() => setPipelineStage('evidence'), 1400);
        setTimeout(() => setPipelineStage('bias'), 1900);
        setTimeout(() => setPipelineStage('credibility'), 2400);
        break;

      case 'ANALYSIS_STAGE_CHANGED':
        if (payload.stage) {
          setPipelineStage(payload.stage);
        }
        break;

      case 'ANALYSIS_COMPLETED':
        setPipelineStage('report');
        releaseState('processing');
        requestState('success');
        setIntensity(0); // Gracefully fade out intensity
        
        // Restrained spectral wave pulse settles after 1.5s
        setTimeout(() => {
          releaseState('success');
        }, 1500);
        break;

      case 'ANALYSIS_FAILED':
        releaseState('processing');
        set({ pipelineError: payload.error || 'An error occurred during analysis.' });
        requestState('error');
        setIntensity(0); // Cooldown intensity on error
        break;

      case 'RESET_ANALYSIS':
        releaseState('processing');
        releaseState('error');
        releaseState('success');
        set({ pipelineStage: 'input', pipelineError: null, environmentalIntensity: 0 });
        break;

      default:
        console.warn(`[ExperienceController] Unhandled event type: ${eventType}`);
        break;
    }
  }
}));
