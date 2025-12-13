import React from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

interface ProgressBarProps {
  current: number;
  max: number;
  threshold?: number; // Percentage 0-100
  label?: string;
  unit?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, max, threshold = 80, label, unit }) => {
  const percentage = Math.min((current / max) * 100, 100);
  
  // Dynamic gradient based on percentage
  const getGradient = (pct: number) => {
    if (pct < 50) return 'linear-gradient(90deg, #22C55E 0%, #4ADE80 100%)';
    if (pct < 80) return 'linear-gradient(90deg, #22C55E 0%, #EAB308 100%)';
    return 'linear-gradient(90deg, #EAB308 0%, #EF4444 100%)';
  };

  return (
    <div className="w-full">
      {(label || unit) && (
        <div className="flex justify-between text-sm font-mono mb-2">
           <span className="text-text-secondary">{label}</span>
           <span className={percentage > threshold ? 'text-danger font-bold' : 'text-text-primary'}>
             {current} / {max} {unit}
           </span>
        </div>
      )}
      
      <div className="relative h-2 bg-border rounded-full w-full overflow-visible">
        <MotionDiv
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ background: getGradient(percentage) }}
        />
        
        {/* Threshold Marker */}
        <div 
           className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-surface rounded-full shadow-lg z-10"
           style={{ left: `${threshold}%`, marginLeft: '-8px' }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-surface border border-border px-1 rounded text-text-secondary">
            {threshold}%
          </div>
        </div>
      </div>
      
      {percentage > threshold && (
         <p className="text-xs text-danger mt-2 flex items-center gap-1 font-medium">
           <span className="inline-block w-1.5 h-1.5 rounded-full bg-danger"></span>
           Alert triggers at {Math.round(max * (threshold / 100))} {unit}
         </p>
      )}
    </div>
  );
};

export default ProgressBar;