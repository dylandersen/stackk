'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Layers, Bell, Settings, Plus, LogOut } from 'lucide-react';
import db from '@/lib/instant';
import { useAddServiceModal } from '@/contexts/AddServiceModalContext';

const NavItem = ({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) => {
  return (
    <Link 
      href={to}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
        active 
          ? 'bg-primary/10 text-primary' 
          : 'text-text-secondary hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="hidden lg:block font-secondary">
        {label}
      </span>
    </Link>
  );
}

export const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const user = db.useUser();
  const { openModal } = useAddServiceModal();
  const { data } = db.useQuery({ 
    services: {},
    profiles: {},
  });
  
  const isActive = (path: string) => pathname === path;
  
  if (!pathname) return null;

  // Get user's profile to access monthly budget
  const profile = data?.profiles?.find((p: any) => p.userId === user?.id);
  const monthlyBudget = profile?.monthlyBudget || 0;

  // Calculate monthly spend from user's services
  // For monthly services, use the price directly
  // For yearly services, divide by 12
  const monthlySpent = data?.services?.reduce((acc: number, s: any) => {
    if (s.status !== 'active') return acc;
    
    const basePrice = s.price || 0;
    let monthlyPrice = 0;
    
    if (s.billingCycle === 'yearly') {
      monthlyPrice = basePrice / 12;
    } else {
      monthlyPrice = basePrice; // monthly or default
    }
    
    // Add usage-based costs if they're in dollars
    const usageCost = (s.usageCurrent && s.usageUnit === '$') ? s.usageCurrent : 0;
    
    return acc + monthlyPrice + usageCost;
  }, 0) || 0;
  
  // Calculate percentage based on budget (if budget is set)
  const totalSpentPercentage = monthlyBudget > 0 
    ? Math.min((monthlySpent / monthlyBudget) * 100, 100)
    : 0;

  // Format currency to only show decimals when needed
  const formatCurrency = (amount: number) => {
    if (amount % 1 === 0) {
      return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleSignOut = async () => {
    try {
      await db.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-border px-6 py-4 pb-6 z-50 flex justify-between items-center">
        <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${isActive('/dashboard') ? 'text-primary' : 'text-text-secondary'}`}>
          <LayoutGrid size={24} strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
        </Link>
        <Link href="/services" className={`flex flex-col items-center gap-1 ${isActive('/services') || pathname.startsWith('/services/') ? 'text-primary' : 'text-text-secondary'}`}>
          <Layers size={24} strokeWidth={isActive('/services') || pathname.startsWith('/services/') ? 2.5 : 2} />
        </Link>
        <button 
          onClick={openModal}
          className="flex flex-col items-center gap-1 -mt-8"
        >
          <div className="bg-primary hover:bg-primary-hover transition-colors rounded-full p-4 shadow-lg shadow-primary/20 text-white">
             <Plus size={28} />
          </div>
        </button>
        <Link href="/alerts" className={`flex flex-col items-center gap-1 ${isActive('/alerts') ? 'text-primary' : 'text-text-secondary'}`}>
          <Bell size={24} strokeWidth={isActive('/alerts') ? 2.5 : 2} />
        </Link>
        <Link href="/settings" className={`flex flex-col items-center gap-1 ${isActive('/settings') ? 'text-primary' : 'text-text-secondary'}`}>
          <Settings size={24} strokeWidth={isActive('/settings') ? 2.5 : 2} />
        </Link>
      </div>

      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-surface/50 backdrop-blur-xl p-4 z-50">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-[37.5px] h-[37.5px] rounded flex items-center justify-center overflow-hidden">
            <Image src="/stackk.png" alt="Stackk" width={38} height={38} className="object-contain" />
          </div>
          <span className="font-secondary text-[25px] font-semibold">Stackk</span>
        </div>
        
        <div className="space-y-1">
          <NavItem to="/dashboard" icon={<LayoutGrid size={18} />} label="Dashboard" active={isActive('/dashboard')} />
          <NavItem to="/services" icon={<Layers size={18} />} label="Services" active={isActive('/services') || pathname.startsWith('/services/')} />
          <NavItem to="/alerts" icon={<Bell size={18} />} label="Alerts" active={isActive('/alerts')} />
          <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" active={isActive('/settings')} />
        </div>

        <div className="mt-auto space-y-4">
          <Link href="/spend" className="block">
            <div className="p-3 rounded-xl bg-surface border border-white/5 hover:bg-surface/80 hover:shadow-[0_0_12px_rgba(249,115,22,0.15)] transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs text-text-secondary font-mono flex-shrink-0">Monthly Spend</span>
                <div className="text-right flex-shrink-0 min-w-0">
                  <div className="text-xs text-white font-mono font-semibold leading-tight whitespace-nowrap">
                    ${formatCurrency(monthlySpent)}
                    {monthlyBudget > 0 && (
                      <span className="text-text-secondary"> / ${formatCurrency(monthlyBudget)}</span>
                    )}
                  </div>
                </div>
              </div>
              {monthlyBudget > 0 ? (
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-yellow-500 transition-all duration-300" 
                    style={{ width: `${totalSpentPercentage}%` }} 
                  />
                </div>
              ) : (
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white/20" style={{ width: '0%' }} />
                </div>
              )}
            </div>
          </Link>
          
          <button 
            onClick={openModal}
            className="w-full bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <span className="font-secondary">Add Service</span>
          </button>

          {/* User Profile Section */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.email ? getUserInitials(user.email) : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.email || 'User'}</p>
                <p className="text-xs text-text-secondary">Account</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

