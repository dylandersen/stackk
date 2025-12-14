import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, SlidersHorizontal, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import { MOCK_SERVICES } from '../constants';

const MotionDiv = motion.div as any;

const ServicesList = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  
  const categories = ['All', 'AI Models', 'Hosting', 'Backend', 'Tools', 'Email', 'Domains'];
  
  const filteredServices = filter === 'All' 
    ? MOCK_SERVICES 
    : MOCK_SERVICES.filter(s => s.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-secondary font-bold">Services</h1>
        <button className="p-2 text-text-secondary hover:text-white transition-colors">
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === cat 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-surface border border-border text-text-secondary hover:text-white hover:border-white/20'
            }`}
          >
            {cat}
          </button>
        ))}
        <button className="flex items-center justify-center w-10 h-9 rounded-full border border-dashed border-text-secondary/50 text-text-secondary shrink-0">
          <Plus size={16} />
        </button>
      </div>

      {/* Add Subscription CTA */}
      <MotionDiv 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate('/services/add')}
        className="bg-blue-600/10 border-2 border-dashed border-blue-500/30 rounded-card p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-blue-600/20 transition-colors group"
      >
         <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
           <Plus size={24} />
         </div>
         <span className="text-blue-200 font-medium">Add new resource</span>
      </MotionDiv>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service, index) => (
          <MotionDiv
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ServiceCard 
              service={service} 
              onClick={() => navigate(`/services/${service.id}`)}
            />
          </MotionDiv>
        ))}
      </div>
    </div>
  );
};

export default ServicesList;