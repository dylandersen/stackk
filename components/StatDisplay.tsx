import React from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

interface StatDisplayProps {
  amount: number;
  label: string;
  change?: number;
  currency?: string;
  large?: boolean;
}

const StatDisplay: React.FC<StatDisplayProps> = ({ amount, label, change, currency = '$', large = false }) => {
  return (
    <div className="flex flex-col">
      <span className="text-text-secondary font-body text-sm md:text-base mb-1">{label}</span>
      <div className="flex items-start gap-3" style={{ fontFamily: '"__nextjs-Geist Mono"' }}>
        <div className="flex items-start font-primary font-bold text-white leading-none">
          <span className={`${large ? 'text-3xl md:text-4xl' : 'text-2xl'} mt-1 opacity-80`}>{currency}</span>
          <span className={`${large ? 'text-6xl md:text-7xl' : 'text-4xl'} tracking-tight`} style={{ fontFamily: '"__nextjs-Geist Mono"' }}>
            {Math.floor(amount)}
          </span>
          <span className={`${large ? 'text-3xl md:text-4xl' : 'text-2xl'} mt-1 opacity-60 font-mono`}>
            .{amount.toFixed(2).split('.')[1]}
          </span>
        </div>
        
        {change !== undefined && (
          <MotionDiv 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-2 py-1 rounded-full text-xs font-bold font-mono mt-2 ${
              change >= 0 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
            }`}
          >
            {change > 0 ? '+' : ''}{change}%
          </MotionDiv>
        )}
      </div>
    </div>
  );
};

export default StatDisplay;