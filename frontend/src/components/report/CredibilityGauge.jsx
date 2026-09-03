import React from 'react';
import { motion } from 'framer-motion';

export const CredibilityGauge = ({ score, size = 120, strokeWidth = 10, animated = true, isNotApplicable = false }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // We want a semi-circle or 3/4 circle. Let's do a 3/4 circle (270 degrees).
  const arcLength = circumference * 0.75;
  const dashoffset = arcLength - (score / 100) * arcLength;
  
  // Determine color based on score
  let colorClass = "text-prism-high"; // Green
  if (isNotApplicable) colorClass = "text-prism-text-secondary"; // Neutral
  else if (score < 40) colorClass = "text-prism-low"; // Red
  else if (score < 70) colorClass = "text-prism-medium"; // Yellow

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform rotate-135"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-prism-surface-hover"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={`stroke-current ${colorClass}`}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeLinecap="round"
          initial={animated ? { strokeDashoffset: arcLength } : false}
          animate={{ strokeDashoffset: isNotApplicable ? arcLength : dashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDashoffset: !animated ? (isNotApplicable ? arcLength : dashoffset) : undefined }}
        />
      </svg>
      {/* Score Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ marginTop: '10%' }}>
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className={`text-3xl font-bold tracking-tighter ${isNotApplicable ? 'text-prism-text-secondary text-2xl' : 'text-prism-text-primary'}`}
        >
          {isNotApplicable ? 'N/A' : `${score}%`}
        </motion.span>
        <span className="text-xs text-prism-text-secondary uppercase tracking-widest">{isNotApplicable ? 'Not Comparable' : 'Score'}</span>
      </div>
    </div>
  );
};
