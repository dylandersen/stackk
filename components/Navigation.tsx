'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Layers, Bell, Settings, Plus } from 'lucide-react';
import { MOCK_SERVICES } from '@/constants';

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
  
  const isActive = (path: string) => pathname === path;
  
  if (!pathname) return null;

  // Calculate total spend
  const totalSpent = MOCK_SERVICES.reduce((acc, s) => acc + s.price + (s.usageCurrent && s.usageUnit === '$' ? s.usageCurrent : 0), 0);
  const totalSpentPercentage = 65; // Mock percentage

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
        <Link href="/services/add" className="flex flex-col items-center gap-1 -mt-8">
          <div className="bg-primary hover:bg-primary-hover transition-colors rounded-full p-4 shadow-lg shadow-primary/20 text-white">
             <Plus size={28} />
          </div>
        </Link>
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

        <div className="mt-auto">
          <div className="p-3 rounded-xl bg-surface border border-white/5 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-text-secondary font-mono">Total Spend</span>
              <span className="text-xs text-white font-mono">${totalSpent.toFixed(2)}</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-yellow-500" style={{ width: `${totalSpentPercentage}%` }} />
            </div>
          </div>
          <Link href="/services/add" className="w-full bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2">
            <Plus size={16} />
            <span className="font-secondary">Add Service</span>
          </Link>
        </div>
      </div>
    </>
  );
};

