'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, FileText, Power, Pause, BarChart3, Settings } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import db from '@/lib/instant';
import ServiceCard from '@/components/ServiceCard';
import ProgressBar from '@/components/ProgressBar';
import { createSlug } from '@/utils/slug';

const chartData = [
  { name: 'Feb 1', val: 20 },
  { name: 'Feb 5', val: 45 },
  { name: 'Feb 10', val: 30 },
  { name: 'Feb 15', val: 70 },
  { name: 'Feb 20', val: 55 },
  { name: 'Feb 25', val: 85 },
  { name: 'Feb 28', val: 80 },
];

export default function ServiceDetail() {
  const paramsResult = useParams();
  // Handle both Promise and direct object cases for Next.js 16
  const params = paramsResult instanceof Promise 
    ? React.use(paramsResult)
    : (paramsResult as Record<string, string | string[]> | null);
  const router = useRouter();
  const slug = params?.slug as string | undefined;
  const { data, isLoading } = db.useQuery({ services: {} });
  
  const service = useMemo(() => {
    if (!data?.services) return null;
    return data.services.find((s: any) => (s.slug || createSlug(s.name)) === slug);
  }, [data, slug]);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!service) return <div className="p-8 text-center">Service not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 bg-surface hover:bg-surface-hover rounded-full transition-colors border border-border">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl md:text-2xl font-bold">{service.name}</h1>
          <button className="p-2 bg-surface hover:bg-surface-hover rounded-full transition-colors border border-border">
            <Settings size={20} />
          </button>
        </div>

        {/* Service Card */}
        <div className="max-w-4xl mx-auto">
          <ServiceCard service={service} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Analytics and Usage */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Usage Analytics */}
            <section className="bg-surface border border-border rounded-card p-6 md:p-8">
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <div className="flex items-center gap-2">
                  <BarChart3 size={20} className="text-primary" />
                  <h2 className="font-bold text-white text-lg md:text-xl">Analytics</h2>
                </div>
                <div className="flex bg-background rounded-lg p-0.5">
                  <button className="px-3 py-1 bg-surface rounded shadow-sm text-xs font-bold text-white">7D</button>
                  <button className="px-3 py-1 text-xs font-medium text-text-secondary hover:text-white">30D</button>
                </div>
              </div>

              <div className="h-64 md:h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                     <defs>
                       <linearGradient id={`colorVal-${service.id}`} x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor={service.color} stopOpacity={0.3}/>
                         <stop offset="95%" stopColor={service.color} stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717A', fontSize: 10}} />
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#1A1A1C', borderColor: '#2A2A2E', borderRadius: '12px', color: '#fff' }}
                       itemStyle={{ color: '#fff' }}
                     />
                     <Area type="monotone" dataKey="val" stroke={service.color} strokeWidth={3} fillOpacity={1} fill={`url(#colorVal-${service.id})`} />
                   </AreaChart>
                 </ResponsiveContainer>
              </div>
            </section>

            {/* Configuration */}
            {service.usageMetric && (
              <section className="bg-surface border border-border rounded-card p-6 md:p-8 space-y-6">
                 <h2 className="font-bold text-white text-lg md:text-xl">Usage Limit</h2>
                 <ProgressBar current={service.usageCurrent!} max={service.usageLimit!} unit={service.usageUnit} />
                 <div className="pt-4">
                   <label className="text-xs text-text-secondary mb-3 block">Adjust Threshold</label>
                   <input type="range" className="w-full accent-primary bg-background h-2 rounded-lg appearance-none cursor-pointer" />
                 </div>
              </section>
            )}
          </div>

          {/* Right Column - Info and Actions */}
          <div className="space-y-6 md:space-y-8">
            {/* Info Grid */}
            <div className="grid grid-cols-1 gap-4 md:gap-6">
               <div className="bg-surface border border-border rounded-card p-5 md:p-6">
                  <span className="text-text-secondary text-xs flex items-center gap-2 mb-3">
                     <Calendar size={14} /> Next Payment
                  </span>
                  <p className="text-white font-bold text-lg">{new Date(service.nextPayment).toLocaleDateString()}</p>
               </div>
               <div className="bg-surface border border-border rounded-card p-5 md:p-6">
                  <span className="text-text-secondary text-xs flex items-center gap-2 mb-3">
                     <FileText size={14} /> Plan
                  </span>
                  <p className="text-white font-bold text-lg">Pro Tier</p>
               </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-3 md:space-y-4">
               <button className="w-full py-3 md:py-4 bg-surface border border-border text-white font-medium rounded-btn hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                 <Pause size={18} />
                 Pause Subscription
               </button>
               <button className="w-full py-3 md:py-4 bg-danger/10 border border-danger/30 text-danger font-medium rounded-btn hover:bg-danger/20 transition-all flex items-center justify-center gap-2">
                 <Power size={18} />
                 Cancel Subscription
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

