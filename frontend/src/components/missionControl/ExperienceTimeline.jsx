import React, { useEffect, useRef } from 'react';
import { useExperienceStore } from '../../store/experienceStore';

export const ExperienceTimeline = () => {
  const eventHistory = useExperienceStore((state) => state.eventHistory);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new event
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [eventHistory]);

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl relative overflow-hidden space-y-6">
      <div className="flex items-center justify-between border-b border-prism-text-primary/10 pb-4">
        <h3 className="text-lg font-light text-prism-text-primary">Experience Timeline</h3>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">LIVE</span>
      </div>

      <div ref={scrollRef} className="space-y-1 font-mono text-xs text-gray-300 max-h-[400px] overflow-y-auto pr-2 scroll-smooth">
        {eventHistory.map((event) => {
          let label = event.eventType;
          let sublabel;
          
          if (event.eventType === 'PIPELINE_STAGE_TRANSITION') {
            sublabel = `${event.payload?.from || 'none'} → ${event.payload?.to || 'none'}`;
          } else if (event.eventType === 'PROFILE_TRANSITION') {
            sublabel = `${event.payload?.from || 'none'} → ${event.payload?.to || 'none'}`;
          } else if (event.eventType === 'ANALYSIS_STARTED') {
            sublabel = `${event.environmentalProfile} · intensity ${event.environmentalIntensity}`;
            if (event.payload?.workloadIntensity) {
              sublabel += ` (workload: ${event.payload.workloadIntensity})`;
            }
          } else if (event.eventType === 'ANALYSIS_COMPLETED') {
            sublabel = 'success';
          } else if (event.eventType === 'ANALYSIS_FAILED') {
            sublabel = `error: ${event.payload?.error || 'unknown'}`;
          } else {
            sublabel = `${event.environmentalProfile} · intensity ${event.environmentalIntensity}`;
          }

          return (
            <div key={event.id} className="flex flex-col py-2 border-b border-prism-text-primary/5 last:border-0 hover:bg-white/[0.02] transition-colors rounded px-2 -mx-2">
              <div className="flex gap-6 items-start">
                <span className="text-prism-text-primary/40 w-16 shrink-0 mt-[1px]">{formatTime(event.timestamp)}</span>
                <div className="flex flex-col">
                  <span className={
                    event.eventType === 'ANALYSIS_FAILED' ? 'text-red-400' :
                    event.eventType.includes('COMPLETED') ? 'text-emerald-400' :
                    event.eventType.includes('TRANSITION') ? 'text-cyan-400' :
                    'text-prism-text-primary'
                  }>
                    {label}
                  </span>
                  {sublabel && (
                    <span className="text-prism-text-primary/50 mt-1">{sublabel}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {eventHistory.length === 0 && (
          <div className="text-prism-text-primary/40 italic py-4">No events recorded in current session.</div>
        )}
      </div>
    </div>
  );
};
