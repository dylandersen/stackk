'use client';

import React from 'react';
import { Code, Database, GitBranch, Package } from 'lucide-react';

interface SupabaseResourcesCardProps {
  edgeFunctions?: any[];
  storageBuckets?: any[];
  branches?: any[];
  billingAddons?: any[];
}

export default function SupabaseResourcesCard({ 
  edgeFunctions = [], 
  storageBuckets = [], 
  branches = [],
  billingAddons = []
}: SupabaseResourcesCardProps) {
  const hasResources = edgeFunctions.length > 0 || storageBuckets.length > 0 || branches.length > 0 || billingAddons.length > 0;

  if (!hasResources) {
    return null;
  }

  const resources = [
    {
      label: 'Edge Functions',
      count: edgeFunctions.length,
      icon: Code,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      items: edgeFunctions.slice(0, 3).map(f => f.name || f.slug),
    },
    {
      label: 'Storage Buckets',
      count: storageBuckets.length,
      icon: Database,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      items: storageBuckets.slice(0, 3).map(b => b.name),
    },
    {
      label: 'Database Branches',
      count: branches.length,
      icon: GitBranch,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      items: branches.slice(0, 3).map(b => b.name),
    },
    {
      label: 'Billing Addons',
      count: billingAddons.length,
      icon: Package,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      items: billingAddons.slice(0, 3).map(a => a.variant?.name || a.name),
    },
  ].filter(r => r.count > 0);

  if (resources.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-surface border border-border rounded-card p-6 md:p-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <Database size={20} className="text-green-400" />
          <h2 className="font-bold text-white text-lg md:text-xl font-secondary">Resources & Services</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <div
                key={index}
                className={`p-5 rounded-xl bg-background border ${resource.borderColor} transition-all hover:border-opacity-50`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${resource.bgColor} border ${resource.borderColor}`}>
                    <Icon size={16} className={resource.color} />
                  </div>
                  <span className="text-2xl font-bold text-white">{resource.count}</span>
                </div>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                  {resource.label}
                </p>
                {resource.items.length > 0 && (
                  <div className="space-y-1 mt-3">
                    {resource.items.map((item, i) => (
                      <p key={i} className="text-xs text-text-secondary truncate" title={item}>
                        {item}
                      </p>
                    ))}
                    {resource.count > 3 && (
                      <p className="text-xs text-text-secondary italic">
                        +{resource.count - 3} more
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

