import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: "bg-prism-surface-hover text-prism-text-primary border-prism-border",
    accent: "bg-prism-accent-glow text-prism-accent border-prism-accent/30",
    success: "bg-prism-high/10 text-prism-high border-prism-high/30",
    warning: "bg-prism-medium/10 text-prism-medium border-prism-medium/30",
    danger: "bg-prism-low/10 text-prism-low border-prism-low/30",
    outline: "border-prism-border text-prism-text-secondary bg-transparent",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-prism-accent focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
