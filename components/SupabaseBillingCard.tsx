'use client';

import React from 'react';
import { CreditCard, Zap, Package, ArrowRight } from 'lucide-react';

interface SupabaseBillingCardProps {
  billing: {
    plan: string;
    billingInfo?: any;
  };
  projectRef: string;
}

// Plan pricing (monthly)
const PLAN_PRICING: Record<string, number> = {
  free: 0,
  pro: 25,
  team: 599,
  enterprise: 0, // Custom pricing
};

export default function SupabaseBillingCard({ billing, projectRef }: SupabaseBillingCardProps) {
  const planName = billing.plan.toLowerCase();
  const monthlyCost = PLAN_PRICING[planName] ?? 0;
  const displayPlan = billing.plan.charAt(0).toUpperCase() + billing.plan.slice(1).toLowerCase();
  
  return (
    <section className="relative bg-surface border border-border rounded-card p-6 md:p-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <CreditCard size={20} className="text-green-400" />
            </div>
            <h2 className="font-bold text-white text-lg md:text-xl font-secondary">Billing & Plan</h2>
          </div>
          <a 
            href={`https://supabase.com/dashboard/project/${projectRef}/settings/billing`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-white transition-colors group"
          >
            Manage Billing <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-background border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-primary" />
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Current Plan</span>
            </div>
            <p className="text-2xl font-bold text-white">{displayPlan}</p>
            <p className="text-xs text-text-secondary mt-1">Management API managed</p>
          </div>

          <div className="p-5 rounded-2xl bg-background border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-primary" />
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Monthly Cost</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${monthlyCost.toFixed(2)}
              <span className="text-sm font-normal text-text-secondary ml-1">/mo</span>
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {monthlyCost === 0 ? 'Free tier plan' : `Based on ${displayPlan} plan`}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-background border border-border">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={16} className="text-primary" />
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Billing Cycle</span>
            </div>
            <p className="text-2xl font-bold text-white">Monthly</p>
            <p className="text-xs text-text-secondary mt-1">Renews on the 1st</p>
          </div>
        </div>
      </div>
    </section>
  );
}

