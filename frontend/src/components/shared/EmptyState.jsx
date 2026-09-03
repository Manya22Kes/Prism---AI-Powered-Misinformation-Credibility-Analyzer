import React from 'react';
import { motion } from 'framer-motion';
import { FileQuestion } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({ 
  icon: Icon = FileQuestion, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className = ""
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-12 text-center border border-dashed border-prism-border/50 rounded-2xl bg-prism-surface/30 backdrop-blur-sm ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-prism-bg flex items-center justify-center mb-6 shadow-prism-sm border border-prism-border">
        <Icon size={28} className="text-prism-text-muted" />
      </div>
      <h3 className="text-lg font-medium text-prism-text-primary mb-2">
        {title}
      </h3>
      <p className="text-sm text-prism-text-secondary max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction} className="border-prism-border/60 hover:bg-prism-surface-hover hover:border-prism-border">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};
