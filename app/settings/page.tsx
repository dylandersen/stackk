'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { id } from '@instantdb/react';
import db from '@/lib/instant';

export default function Settings() {
  const router = useRouter();
  const user = db.useUser();
  const { data, isLoading } = db.useQuery({ 
    profiles: {},
  });

  const profile = data?.profiles?.find((p: any) => p.userId === user?.id);
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.monthlyBudget !== undefined && profile.monthlyBudget !== null) {
      setMonthlyBudgetInput(profile.monthlyBudget.toString());
    } else {
      setMonthlyBudgetInput('');
    }
  }, [profile]);

  const handleSaveBudget = async () => {
    if (!user?.id) return;
    
    const budgetValue = parseFloat(monthlyBudgetInput);
    if (isNaN(budgetValue) || budgetValue < 0) {
      return; // Don't save invalid values
    }
    
    setIsSaving(true);
    try {
      if (profile) {
        // Update existing profile
        await db.transact(
          db.tx.profiles[profile.id].update({ monthlyBudget: budgetValue })
        );
      } else {
        // Create new profile with budget
        const profileId = id();
        await db.transact(
          db.tx.profiles[profileId].update({
            userId: user.id,
            firstName: '',
            lastName: '',
            referralSource: 'other',
            monthlyBudget: budgetValue,
          })
        );
      }
    } catch (error) {
      console.error('Error saving budget:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-surface rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl md:text-2xl font-secondary font-bold uppercase tracking-wide">Settings</h1>
        </div>

        {/* Budget Section */}
        <section className="space-y-4 md:space-y-6">
          <div>
            <h2 className="text-sm md:text-base font-bold text-text-secondary uppercase tracking-wider mb-2">
              Monthly Budget
            </h2>
            <p className="text-text-secondary text-sm md:text-base mb-6">
              Set your monthly spending budget to track your expenses and receive alerts when you approach your limit.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <DollarSign size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Budget Limit</h3>
                <p className="text-xs text-text-secondary">Set your monthly spending limit</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-text-secondary mb-2">
                  Monthly Budget ($)
                </label>
                <input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={monthlyBudgetInput}
                  onChange={(e) => setMonthlyBudgetInput(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="text-xs text-text-secondary mt-2">
                  This budget will be used to track your monthly spending in the sidebar.
                </p>
              </div>

              <button
                onClick={handleSaveBudget}
                disabled={isSaving || isLoading || !monthlyBudgetInput || isNaN(parseFloat(monthlyBudgetInput)) || parseFloat(monthlyBudgetInput) < 0}
                className="w-full md:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Budget'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
