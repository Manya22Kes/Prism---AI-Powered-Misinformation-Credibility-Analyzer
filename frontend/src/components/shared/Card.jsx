import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const Card = React.forwardRef(({ className, glass = true, hover = false, variant = 'pink', children, ...props }, ref) => {
  const glassClass = variant === 'blue' ? "glass-panel-blue" : "glass-panel";
  return (
    <motion.div
      ref={ref}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      className={cn(
        "rounded-2xl overflow-hidden transition-all duration-300 ease-out",
        glass ? glassClass : "bg-prism-surface border border-prism-border shadow-prism-sm",
        hover && "hover:shadow-prism-glow hover:border-prism-accent/30",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-tight text-prism-text-primary", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }) => (
  <p className={cn("text-sm text-prism-text-secondary", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }) => (
  <div className={cn("flex items-center p-6 pt-0", className)} {...props}>
    {children}
  </div>
);
