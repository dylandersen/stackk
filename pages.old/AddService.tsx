import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MotionDiv = motion.div as any;

const getLogo = (domain: string) => `https://logo.clearbit.com/${domain}`;

const POPULAR_SERVICES = [
  { name: 'GitHub Copilot', logo: getLogo('github.com'), cat: 'Tools' },
  { name: 'Railway', logo: getLogo('railway.app'), cat: 'Hosting' },
  { name: 'AWS', logo: getLogo('aws.amazon.com'), cat: 'Cloud' },
  { name: 'Hetzner', logo: getLogo('hetzner.com'), cat: 'Cloud' },
  { name: 'Stripe', logo: getLogo('stripe.com'), cat: 'Payments' },
  { name: 'Twilio', logo: getLogo('twilio.com'), cat: 'API' },
  { name: 'Linear', logo: getLogo('linear.app'), cat: 'Productivity' },
  { name: 'Netlify', logo: getLogo('netlify.com'), cat: 'Hosting' },
  { name: 'Render', logo: getLogo('render.com'), cat: 'Hosting' },
  { name: 'PlanetScale', logo: getLogo('planetscale.com'), cat: 'Database' },
  { name: 'Algolia', logo: getLogo('algolia.com'), cat: 'Search' },
  { name: 'Sentry', logo: getLogo('sentry.io'), cat: 'Monitoring' },
];

const AddService = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = POPULAR_SERVICES.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));

  const toggleSelect = (name: string) => {
    if (selected.includes(name)) {
      setSelected(selected.filter(s => s !== name));
    } else {
      setSelected([...selected, name]);
    }
  };

  return (
    <div className="h-full flex flex-col">
       <div className="flex items-center justify-between mb-6">
         <h1 className="text-xl font-bold font-secondary">Add Resource</h1>
         <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface hover:bg-surface-hover">
           <X size={20} />
         </button>
       </div>

       <div className="relative mb-6">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
         <input 
           type="text"
           placeholder="Search dev tools..." 
           value={query}
           onChange={(e) => setQuery(e.target.value)}
           className="w-full bg-surface border border-border rounded-xl py-4 pl-12 pr-4 text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
         />
       </div>

       <div className="flex-1 overflow-y-auto space-y-3 pb-24">
         <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Popular Dev Tools</h2>
         
         {filtered.map((service, i) => {
            const isSelected = selected.includes(service.name);
            return (
              <MotionDiv 
                key={service.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => toggleSelect(service.name)}
                className={`flex items-center justify-between p-4 rounded-card border cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border-primary' : 'bg-surface border-border hover:border-white/20'}`}
              >
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden p-1">
                     <img src={service.logo} alt={service.name} className="w-full h-full object-contain" />
                   </div>
                   <div>
                     <h3 className="font-bold text-white">{service.name}</h3>
                     <p className="text-xs text-text-secondary">{service.cat}</p>
                   </div>
                 </div>
                 
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-white/10 text-transparent'}`}>
                    <Check size={16} />
                 </div>
              </MotionDiv>
            );
         })}
       </div>

       <div className="fixed bottom-0 left-0 right-0 p-6 md:relative md:p-0">
          <button 
             disabled={selected.length === 0}
             className="w-full bg-primary disabled:bg-surface disabled:text-text-secondary hover:bg-primary-hover text-white font-bold py-4 rounded-btn shadow-lg transition-all"
             onClick={() => navigate('/services')}
          >
             {selected.length === 0 ? 'Select Tools' : `Track ${selected.length} Tools`}
          </button>
       </div>
    </div>
  );
};

export default AddService;