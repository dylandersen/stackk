'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Bell, Mail, Hash, AlertTriangle, ArrowUpRight, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import db from '@/lib/instant';
import ProgressBar from '@/components/ProgressBar';

const MotionDiv = motion.div as any;

export default function AlertSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'usage' | 'billing'>('usage');
  const { data, isLoading } = db.useQuery({ 
    services: {},
    notification_channels: {},
  });

  const connectedServices = useMemo(() => {
    if (!data?.services) return [];
    return data.services.filter((s: any) => s.usageMetric && s.status === 'active');
  }, [data]);

  const notificationChannels = useMemo(() => {
    if (!data?.notification_channels) return [];
    return data.notification_channels;
  }, [data]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-surface rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl md:text-2xl font-secondary font-bold uppercase tracking-wide">Alert Settings</h1>
        </div>

        {/* Tab Control */}
        <div className="bg-surface p-1 rounded-xl flex">
          <button 
            onClick={() => setActiveTab('usage')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'usage' ? 'bg-background text-white shadow-sm' : 'text-text-secondary hover:text-white'}`}
          >
            Usage Limits
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'billing' ? 'bg-background text-white shadow-sm' : 'text-text-secondary hover:text-white'}`}
          >
            Billing Cycles
          </button>
        </div>

        <p className="text-text-secondary text-sm md:text-base">
          Configure how and when you receive notifications about your resource usage and spending limits.
        </p>

        {/* Notification Channels */}
        <section className="space-y-4 md:space-y-6">
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Notification Channels</h2>
          {isLoading ? (
            <div className="text-center py-8 text-text-secondary">Loading...</div>
          ) : notificationChannels.length === 0 ? (
            <div className="bg-surface border border-border rounded-card p-8 text-center text-text-secondary">
              <p>No notification channels configured yet.</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-card divide-y divide-border">
              {notificationChannels.map((channel: any) => (
              <div key={channel.id} className="p-4 md:p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${channel.enabled ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text-secondary'}`}>
                   {channel.type === 'push' && <Bell size={18} />}
                   {channel.type === 'email' && <Mail size={18} />}
                   {channel.type === 'slack' && <Hash size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{channel.name}</h3>
                  <p className="text-xs text-text-secondary">{channel.detail}</p>
                </div>
              </div>
              
              {channel.type === 'slack' ? (
                 <button className="px-3 py-1.5 border border-border rounded-lg text-xs font-bold hover:bg-white/5 transition-colors">
                   CONNECT
                 </button>
              ) : (
                <button 
                  onClick={() => {
                    db.transact(
                      db.tx.notification_channels[channel.id].update({ enabled: !channel.enabled })
                    );
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${channel.enabled ? 'bg-primary' : 'bg-border'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${channel.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              )}
            </div>
              ))}
            </div>
          )}
      </section>

        {/* Service Thresholds */}
        <section className="space-y-4 md:space-y-6">
           <div className="flex justify-between items-end">
             <h2 className="text-sm md:text-base font-bold text-text-secondary uppercase tracking-wider">Service Thresholds</h2>
             <button className="text-xs md:text-sm text-primary font-bold">EDIT ALL</button>
           </div>

           <div className="grid gap-4 md:gap-6">
             {connectedServices.length === 0 ? (
               <div className="text-center py-8 text-text-secondary">
                 <p>No services with usage metrics yet.</p>
               </div>
             ) : (
               connectedServices.map((service: any) => {
               const percent = (service.usageCurrent! / service.usageLimit!) * 100;
               const isCritical = percent > 90;

               return (
                 <MotionDiv 
                   key={service.id} 
                   initial={{ opacity: 0, y: 10 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   className="bg-surface border border-border rounded-card p-5 md:p-6 lg:p-8 relative overflow-hidden"
                 >
                 {isCritical && (
                   <div className="absolute top-0 left-0 right-0 h-1 bg-danger"></div>
                 )}
                 
                   <div className="flex justify-between items-start mb-6 md:mb-8">
                     <div className="flex items-center gap-3 md:gap-4">
                       <div className="relative">
                         <img src={service.logo} alt={service.name} className="w-10 h-10 md:w-12 md:h-12 rounded-full" />
                         <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-surface"></span>
                       </div>
                       <div>
                         <h3 className="font-bold text-lg md:text-xl">{service.name}</h3>
                         <p className="text-xs md:text-sm text-text-secondary">{service.usageMetric}</p>
                       </div>
                     </div>
                     <div className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-bold font-mono ${isCritical ? 'bg-danger/20 text-danger' : 'bg-white/10 text-white'}`}>
                       {Math.round(percent)}%
                     </div>
                   </div>

                   {isCritical && (
                      <div className="mb-4 md:mb-6 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 p-3 md:p-4 rounded-lg">
                        <AlertTriangle size={16} className="text-yellow-500" />
                        <span className="text-xs md:text-sm text-yellow-500 font-medium">Approaching limit rapidly. Projected to cross in 2 days.</span>
                      </div>
                   )}

                   <ProgressBar 
                     current={service.usageCurrent!} 
                     max={service.usageLimit!} 
                     unit={service.usageUnit} 
                     threshold={80}
                   />

                   <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/5 flex justify-between items-center">
                     <span className="text-xs md:text-sm text-text-secondary">Next billing cycle resets in 4 days</span>
                     <button className="text-white hover:text-primary transition-colors">
                       <ArrowUpRight size={18} />
                     </button>
                   </div>
                 </MotionDiv>
               );
               })
             )}
           </div>
        </section>

        <button className="w-full py-4 bg-primary/10 border border-primary/50 text-primary font-bold rounded-btn hover:bg-primary/20 transition-all flex items-center justify-center gap-2">
          <Plus size={18} />
          CONNECT NEW SERVICE
        </button>
      </div>
    </div>
  );
}

