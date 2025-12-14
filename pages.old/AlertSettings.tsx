import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Bell, Mail, Hash, AlertTriangle, ArrowUpRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { MOCK_SERVICES, MOCK_NOTIFICATIONS } from '../constants';

const MotionDiv = motion.div as any;

const AlertSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'usage' | 'billing'>('usage');

  const connectedServices = MOCK_SERVICES.filter(s => s.usageMetric);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-secondary font-bold uppercase tracking-wide">Alert Settings</h1>
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

      <p className="text-text-secondary text-sm">
        Configure how and when you receive notifications about your resource usage and spending limits.
      </p>

      {/* Notification Channels */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Notification Channels</h2>
        <div className="bg-surface border border-border rounded-card divide-y divide-border">
          {MOCK_NOTIFICATIONS.map(channel => (
            <div key={channel.id} className="p-4 flex items-center justify-between">
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
                <button className={`w-12 h-6 rounded-full p-1 transition-colors ${channel.enabled ? 'bg-primary' : 'bg-border'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${channel.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Service Thresholds */}
      <section className="space-y-4">
         <div className="flex justify-between items-end">
           <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Service Thresholds</h2>
           <button className="text-xs text-primary font-bold">EDIT ALL</button>
         </div>

         <div className="grid gap-4">
           {connectedServices.map(service => {
             const percent = (service.usageCurrent! / service.usageLimit!) * 100;
             const isCritical = percent > 90;

             return (
               <MotionDiv 
                 key={service.id} 
                 initial={{ opacity: 0, y: 10 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="bg-surface border border-border rounded-card p-5 relative overflow-hidden"
               >
                 {isCritical && (
                   <div className="absolute top-0 left-0 right-0 h-1 bg-danger"></div>
                 )}
                 
                 <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-3">
                     <div className="relative">
                       <img src={service.logo} alt={service.name} className="w-10 h-10 rounded-full" />
                       <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-surface"></span>
                     </div>
                     <div>
                       <h3 className="font-bold text-lg">{service.name}</h3>
                       <p className="text-xs text-text-secondary">{service.usageMetric}</p>
                     </div>
                   </div>
                   <div className={`px-2 py-1 rounded-lg text-xs font-bold font-mono ${isCritical ? 'bg-danger/20 text-danger' : 'bg-white/10 text-white'}`}>
                     {Math.round(percent)}%
                   </div>
                 </div>

                 {isCritical && (
                    <div className="mb-4 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                      <AlertTriangle size={16} className="text-yellow-500" />
                      <span className="text-xs text-yellow-500 font-medium">Approaching limit rapidly. Projected to cross in 2 days.</span>
                    </div>
                 )}

                 <ProgressBar 
                   current={service.usageCurrent!} 
                   max={service.usageLimit!} 
                   unit={service.usageUnit} 
                   threshold={80}
                 />

                 <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                   <span className="text-xs text-text-secondary">Next billing cycle resets in 4 days</span>
                   <button className="text-white hover:text-primary transition-colors">
                     <ArrowUpRight size={18} />
                   </button>
                 </div>
               </MotionDiv>
             );
           })}
         </div>
      </section>

      <button className="w-full py-4 bg-primary/10 border border-primary/50 text-primary font-bold rounded-btn hover:bg-primary/20 transition-all flex items-center justify-center gap-2">
        <Plus size={18} />
        CONNECT NEW SERVICE
      </button>
    </div>
  );
};

export default AlertSettings;