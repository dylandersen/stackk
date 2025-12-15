'use client';

import React, { useMemo } from 'react';
import { ChevronLeft, TrendingUp, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import db from '@/lib/instant';
import { createSlug } from '@/utils/slug';
import ProjectDistributionChart from '@/components/charts/ProjectDistributionChart';

export default function SpendPage() {
  const router = useRouter();
  const user = db.useUser();
  const { data, isLoading } = db.useQuery({ 
    services: {},
    profiles: {},
  });

  // Get user's profile to access monthly budget
  const profile = data?.profiles?.find((p: any) => p.userId === user?.id);
  const monthlyBudget = profile?.monthlyBudget || 0;

  // Calculate monthly spend breakdown by service
  const spendBreakdown = useMemo(() => {
    if (!data?.services) return [];
    
    return data.services
      .filter((s: any) => s.status === 'active')
      .map((service: any) => {
        const basePrice = service.price || 0;
        let monthlyPrice = 0;
        
        if (service.billingCycle === 'yearly') {
          monthlyPrice = basePrice / 12;
        } else {
          monthlyPrice = basePrice; // monthly or default
        }
        
        // Add usage-based costs if they're in dollars
        const usageCost = (service.usageCurrent && service.usageUnit === '$') ? service.usageCurrent : 0;
        const totalMonthly = monthlyPrice + usageCost;
        
        return {
          ...service,
          monthlyPrice,
          usageCost,
          totalMonthly,
        };
      })
      .filter((s: any) => s.totalMonthly > 0)
      .sort((a: any, b: any) => b.totalMonthly - a.totalMonthly);
  }, [data]);

  const totalMonthlySpent = useMemo(() => {
    return spendBreakdown.reduce((acc: number, s: any) => acc + s.totalMonthly, 0);
  }, [spendBreakdown]);

  // Format currency to only show decimals when needed
  const formatCurrency = (amount: number) => {
    if (amount % 1 === 0) {
      return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Prepare chart data for service distribution
  const chartData = useMemo(() => {
    const distribution: Record<string, number> = {};
    spendBreakdown.forEach((service: any) => {
      distribution[service.name] = service.totalMonthly;
    });
    return distribution;
  }, [spendBreakdown]);

  const budgetPercentage = monthlyBudget > 0 
    ? Math.min((totalMonthlySpent / monthlyBudget) * 100, 100)
    : 0;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
        <div className="text-center text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-surface rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl md:text-2xl font-secondary font-bold uppercase tracking-wide">Monthly Spend</h1>
        </div>

        {/* Summary Card */}
        <section className="space-y-4 md:space-y-6">
          <div className="bg-surface border border-border rounded-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm md:text-base font-bold text-text-secondary uppercase tracking-wider mb-2">
                  Total Monthly Spend
                </h2>
                <div className="text-3xl md:text-4xl font-mono font-bold text-white">
                  ${formatCurrency(totalMonthlySpent)}
                  {monthlyBudget > 0 && (
                    <span className="text-xl md:text-2xl text-text-secondary ml-2">
                      / ${formatCurrency(monthlyBudget)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp size={32} className="text-primary" />
              </div>
            </div>
            
            {monthlyBudget > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-text-secondary mb-1">
                  <span>Budget Usage</span>
                  <span className="font-mono">{budgetPercentage.toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-yellow-500 transition-all duration-300" 
                    style={{ width: `${budgetPercentage}%` }} 
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Charts Section */}
        {spendBreakdown.length > 0 && (
          <section className="space-y-4 md:space-y-6">
            <div>
              <h2 className="text-sm md:text-base font-bold text-text-secondary uppercase tracking-wider mb-2">
                Spend Distribution
              </h2>
              <p className="text-text-secondary text-sm md:text-base mb-6">
                Visual breakdown of your monthly spending by service.
              </p>
            </div>
            <div className="bg-surface border border-border rounded-card p-6 md:p-8">
              <ProjectDistributionChart data={chartData} />
            </div>
          </section>
        )}

        {/* Service Breakdown */}
        <section className="space-y-4 md:space-y-6">
          <div>
            <h2 className="text-sm md:text-base font-bold text-text-secondary uppercase tracking-wider mb-2">
              Service Breakdown
            </h2>
            <p className="text-text-secondary text-sm md:text-base mb-6">
              Detailed breakdown of your monthly spending by service. Click on any service to view more details.
            </p>
          </div>

          {spendBreakdown.length === 0 ? (
            <div className="bg-surface border border-border rounded-card p-8 text-center text-text-secondary">
              <p className="mb-4">No active services with spending yet.</p>
              <Link href="/services/add">
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                  Add Services
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {spendBreakdown.map((service: any) => {
                const percentage = totalMonthlySpent > 0 
                  ? (service.totalMonthly / totalMonthlySpent) * 100 
                  : 0;
                const serviceSlug = service.slug || createSlug(service.name);
                
                return (
                  <Link 
                    key={service.id} 
                    href={`/services/${serviceSlug}`}
                    className="block"
                  >
                    <div className="bg-surface border border-border rounded-card p-5 md:p-6 hover:bg-surface/80 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <img 
                              src={service.logo} 
                              alt={service.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/stackk.png';
                              }}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg mb-1">{service.name}</h3>
                            <p className="text-xs text-text-secondary">{service.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-mono font-bold text-white mb-1">
                            ${formatCurrency(service.totalMonthly)}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {percentage.toFixed(1)}% of total
                          </div>
                        </div>
                        <ArrowRight 
                          size={20} 
                          className="text-text-secondary group-hover:text-white group-hover:translate-x-1 transition-all ml-4" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        {service.monthlyPrice > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Base Price</span>
                            <span className="text-white font-mono">${formatCurrency(service.monthlyPrice)}</span>
                          </div>
                        )}
                        {service.usageCost > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Usage Cost</span>
                            <span className="text-white font-mono">${formatCurrency(service.usageCost)}</span>
                          </div>
                        )}
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all" 
                            style={{ width: `${percentage}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

