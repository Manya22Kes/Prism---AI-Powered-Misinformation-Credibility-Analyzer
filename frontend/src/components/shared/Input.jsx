import React from 'react';
import { cn } from '../../utils/cn';
import { useExperienceStore } from '../../store/experienceStore';

export const Input = React.forwardRef(({ className, type = 'text', error, icon: Icon, onFocus, onBlur, ...props }, ref) => {
  const emitExperienceEvent = useExperienceStore((state) => state.emitExperienceEvent);

  const handleFocus = (e) => {
    emitExperienceEvent('INPUT_FOCUS_START');
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    emitExperienceEvent('INPUT_FOCUS_END');
    if (onBlur) onBlur(e);
  };

  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-prism-text-muted">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border bg-prism-surface/50 px-3 py-2 text-sm text-prism-text-primary placeholder:text-prism-text-muted",
          "focus-ring transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50",
          Icon && "pl-10",
          error ? "border-prism-low focus:ring-prism-low" : "border-prism-border",
          className
        )}
        ref={ref}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-prism-low">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
