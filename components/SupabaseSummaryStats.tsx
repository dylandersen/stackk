'use client';

import React from 'react';
import { Database, Shield, Globe, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface SupabaseSummaryStatsProps {
  statistics: {
    status: string;
    region: string;
    version?: string;
    createdAt: string;
  };
}

export default function SupabaseSummaryStats({ statistics }: SupabaseSummaryStatsProps) {
  const { status, region, version, createdAt } = statistics;

  const stats = [
    {
      label: 'Status',
      value: status === 'ACTIVE_HEALTHY' ? 'Healthy' : status.replace('_', ' '),
      icon: Activity,
      gradient: 'from-green-500/20 via-green-500/10 to-transparent',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-400',
      borderColor: 'border-green-500/20',
      glowColor: 'shadow-green-500/10',
    },
    {
      label: 'Region',
      value: region,
      icon: Globe,
      gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      glowColor: 'shadow-blue-500/10',
    },
    {
      label: 'DB Version',
      value: version || 'N/A',
      icon: Database,
      gradient: 'from-purple-500/20 via-purple-500/10 to-transparent',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
      glowColor: 'shadow-purple-500/10',
    },
    {
      label: 'Created',
      value: new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      icon: Shield,
      gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
      glowColor: 'shadow-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className={`group relative bg-surface border ${stat.borderColor} rounded-card overflow-hidden transition-all duration-300 hover:border-opacity-50`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            <div className="relative z-10 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-xl ${stat.iconBg} backdrop-blur-sm border ${stat.borderColor} transition-all duration-300 group-hover:scale-110`}>
                  <Icon size={20} className={stat.iconColor} />
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-white text-2xl md:text-3xl font-bold font-secondary truncate w-full">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

