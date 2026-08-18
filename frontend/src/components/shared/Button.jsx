import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 ease-out focus-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-prism-accent text-white shadow-prism-glow hover:shadow-prism-glow-active hover:bg-prism-accent/90 border border-white/10",
    secondary: "bg-prism-surface-hover text-prism-text-primary border border-prism-border hover:bg-prism-surface-active hover:border-prism-accent/40",
    outline: "border border-prism-accent/60 text-prism-accent hover:bg-prism-accent-glow hover:border-prism-accent",
    ghost: "text-prism-text-secondary hover:text-prism-text-primary hover:bg-prism-surface-hover",
    danger: "bg-prism-low text-white shadow-prism-glow-danger hover:bg-prism-low/90",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg",
    icon: "h-10 w-10",
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';
