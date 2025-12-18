'use client';

import React, { useMemo } from 'react';
import { Bell, ChevronRight, AlertTriangle, Zap, Sparkles, Triangle } from 'lucide-react';
import Link from 'next/link';
import db from '@/lib/instant';
import { createSlug } from '@/utils/slug';

export default function Dashboard() {
  const { data, isLoading } = db.useQuery({ 
    services: {
      transactions: {},
    },
  } as any) as { data: any; isLoading: boolean };

  const servicesWithUsage = useMemo(() => {
    if (!data?.services) return [];
    return data.services.filter((s: any) => s.usageMetric && s.status === 'active');
  }, [data]);

  const recentTransactions = useMemo(() => {
    if (!data?.services) return [];
    // Flatten all transactions from all services and add the service reference
    const allTransactions = data.services
      .flatMap((service: any) => 
        (service.transactions || []).map((transaction: any) => ({
          ...transaction,
          service,
        }))
      )
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    return allTransactions;
  }, [data]);

  const topService = servicesWithUsage[0];
  const activeServices = servicesWithUsage.slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-background/50 relative overflow-hidden">
        <div className="p-6 md:p-8 text-center text-text-secondary">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background/50 relative overflow-hidden">
      {/* Header Bar */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface/30 backdrop-blur-sm">
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <span className="hover:text-white cursor-pointer">All Services</span>
          <ChevronRight size={16} />
          <span className="text-white">January 2026</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
            <Bell size={20} className="text-text-secondary hover:text-white cursor-pointer" />
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-white/10" />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 md:p-8 overflow-y-auto no-scrollbar">
        {/* Top Information Cards */}
        {topService && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Service Usage Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 relative">
              <div className="absolute top-4 right-4 text-white font-mono font-bold text-lg">
                {topService.usageCurrent && topService.usageLimit 
                  ? `${Math.round((topService.usageCurrent / topService.usageLimit) * 100)}%`
                  : '0%'}
              </div>
              <div className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">
                {topService.name} {topService.usageMetric}
              </div>
              <div className="text-4xl font-mono font-bold text-white mb-2">
                {topService.usageCurrent?.toLocaleString()} {topService.usageUnit || ''}
              </div>
              <div className="text-text-secondary text-sm mb-3">
                Limit: {topService.usageLimit?.toLocaleString()} {topService.usageUnit || ''}
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-slate-400/60 rounded-full" 
                  style={{ 
                    width: topService.usageCurrent && topService.usageLimit 
                      ? `${Math.min((topService.usageCurrent / topService.usageLimit) * 100, 100)}%`
                      : '0%'
                  }} 
                />
              </div>
              <div className="text-text-secondary text-xs mt-2 text-right">Resets in 8d</div>
            </div>

          {/* Projected Overage Alert Card */}
          <div className="p-6 rounded-2xl bg-orange-900/30 border border-orange-800/30 relative">
            <div className="absolute top-4 right-4">
              <span className="text-xs font-bold text-orange-400 bg-orange-900/50 px-2 py-1 rounded uppercase">Action Required</span>
            </div>
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <AlertTriangle size={20} className="text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Projected Overage</h3>
                <p className="text-text-secondary text-sm">Vercel usage at 90%. Limit in ~2 days.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="flex-1 bg-white text-background px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors">
                Check Usage
              </button>
              <button className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/20 transition-colors">
                Dismiss
              </button>
            </div>
          </div>
          </div>
        )}

        {/* Active Services Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white font-secondary">Active Services</h2>
            <Link href="/services">
              <button className="text-sm text-text-secondary hover:text-white transition-colors">View All</button>
            </Link>
          </div>
          
          {activeServices.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <p className="mb-4">No active services with usage metrics yet.</p>
              <Link href="/services/add">
                <button className="px-4 py-2 bg-primary text-white rounded-lg">
                  Add Services
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeServices.map((service: any, index: number) => {
                const percent = service.usageCurrent && service.usageLimit 
                  ? (service.usageCurrent / service.usageLimit) * 100 
                  : 0;
                const isCritical = percent > 90;
                const serviceSlug = service.slug || createSlug(service.name);
                
                return (
                  <Link 
                    key={service.id}
                    href={`/services/${serviceSlug}`}
                    className="block"
                  >
                    <div 
                      className="p-6 rounded-2xl relative cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: service.color || '#1A1A1C', border: service.color ? 'none' : '1px solid #2A2A2E' }}
                    >
                      {isCritical && (
                        <div className="absolute top-4 right-4">
                          <span className="text-xs font-bold text-red-400 bg-red-900/50 px-2 py-1 rounded uppercase">Critical</span>
                        </div>
                      )}
                      <div className={`absolute ${isCritical ? 'top-12' : 'top-4'} right-4 text-white font-mono font-bold`}>
                        {Math.round(percent)}%
                      </div>
                      <div className="mb-4">
                        <Zap size={24} className="text-white mb-2" />
                        <h3 className="text-white font-semibold text-lg mb-1 font-secondary">{service.name}</h3>
                        <div className="text-white/70 text-xs uppercase tracking-wider">{service.category}</div>
                      </div>
                      <div className="text-3xl font-mono font-bold text-white mb-1">
                        {service.currency}{service.price.toFixed(2)}
                      </div>
                      {service.usageCurrent !== undefined && (
                        <div className="text-white/80 text-sm mb-3">
                          {service.usageCurrent} {service.usageUnit || ''}
                        </div>
                      )}
                      {service.usageLimit && (
                        <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-2">
                          <div 
                            className="h-full bg-white/60 rounded-full" 
                            style={{ width: `${Math.min(percent, 100)}%` }} 
                          />
                        </div>
                      )}
                      <div className="text-white/80 text-xs">Resets in 4d</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white font-secondary">Recent Transactions</h2>
            <button className="text-sm text-text-secondary hover:text-white transition-colors">View All</button>
          </div>
          
          {recentTransactions.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-8 text-center text-text-secondary">
              <p>No transactions yet.</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl p-4">
              {recentTransactions.map((transaction: any) => {
                const service = transaction.service;
                const date = new Date(transaction.date);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const timeAgo = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
                
                return (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                  >
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-1 font-secondary">
                        {service?.name || 'Unknown Service'}
                      </h4>
                      <p className="text-text-secondary text-xs">{timeAgo}</p>
                    </div>
                    <div className="text-white font-mono font-semibold">
                      ${transaction.amount.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

