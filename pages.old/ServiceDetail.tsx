import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, FileText, Power, Pause, BarChart3, Settings } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_SERVICES } from '../constants';
import ServiceCard from '../components/ServiceCard';
import ProgressBar from '../components/ProgressBar';

const data = [
  { name: 'Feb 1', val: 20 },
  { name: 'Feb 5', val: 45 },
  { name: 'Feb 10', val: 30 },
  { name: 'Feb 15', val: 70 },
  { name: 'Feb 20', val: 55 },
  { name: 'Feb 25', val: 85 },
  { name: 'Feb 28', val: 80 },
];

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = MOCK_SERVICES.find(s => s.id === id);

  if (!service) return <div className="p-8 text-center">Service not found</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface hover:bg-surface-hover rounded-full transition-colors border border-border">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Details</h1>
        <button className="p-2 bg-surface hover:bg-surface-hover rounded-full transition-colors border border-border">
          <Settings size={20} />
        </button>
      </div>

      <ServiceCard service={service} />

      {/* Usage Analytics */}
      <section className="bg-surface border border-border rounded-card p-5">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            <h2 className="font-bold text-white">Analytics</h2>
          </div>
          <div className="flex bg-background rounded-lg p-0.5">
            <button className="px-3 py-1 bg-surface rounded shadow-sm text-xs font-bold text-white">7D</button>
            <button className="px-3 py-1 text-xs font-medium text-text-secondary hover:text-white">30D</button>
          </div>
        </div>

        <div className="h-48 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={data}>
               <defs>
                 <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor={service.color} stopOpacity={0.3}/>
                   <stop offset="95%" stopColor={service.color} stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717A', fontSize: 10}} />
               <Tooltip 
                 contentStyle={{ backgroundColor: '#1A1A1C', borderColor: '#2A2A2E', borderRadius: '12px', color: '#fff' }}
                 itemStyle={{ color: '#fff' }}
               />
               <Area type="monotone" dataKey="val" stroke={service.color} strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
             </AreaChart>
           </ResponsiveContainer>
        </div>
      </section>

      {/* Configuration */}
      {service.usageMetric && (
        <section className="bg-surface border border-border rounded-card p-5 space-y-4">
           <h2 className="font-bold text-white">Usage Limit</h2>
           <ProgressBar current={service.usageCurrent!} max={service.usageLimit!} unit={service.usageUnit} />
           <div className="pt-4">
             <label className="text-xs text-text-secondary mb-2 block">Adjust Threshold</label>
             <input type="range" className="w-full accent-primary bg-background h-2 rounded-lg appearance-none cursor-pointer" />
           </div>
        </section>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-surface border border-border rounded-card p-4">
            <span className="text-text-secondary text-xs flex items-center gap-2 mb-2">
               <Calendar size={14} /> Next Payment
            </span>
            <p className="text-white font-bold">{new Date(service.nextPayment).toLocaleDateString()}</p>
         </div>
         <div className="bg-surface border border-border rounded-card p-4">
            <span className="text-text-secondary text-xs flex items-center gap-2 mb-2">
               <FileText size={14} /> Plan
            </span>
            <p className="text-white font-bold">Pro Tier</p>
         </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-4 space-y-3">
         <button className="w-full py-3 bg-surface border border-border text-white font-medium rounded-btn hover:bg-white/5 transition-all flex items-center justify-center gap-2">
           <Pause size={18} />
           Pause Subscription
         </button>
         <button className="w-full py-3 bg-danger/10 border border-danger/30 text-danger font-medium rounded-btn hover:bg-danger/20 transition-all flex items-center justify-center gap-2">
           <Power size={18} />
           Cancel Subscription
         </button>
      </div>
    </div>
  );
};

export default ServiceDetail;