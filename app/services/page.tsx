'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import db from '@/lib/instant';
import ServiceCard from '@/components/ServiceCard';
import { createSlug } from '@/utils/slug';

const MotionDiv = motion.div as any;

export default function ServicesList() {
  const [filter, setFilter] = useState('All');
  const { data, isLoading } = db.useQuery({ services: {} });
  
  const categories = ['All', 'AI Models', 'Hosting', 'Backend', 'Tools', 'Email', 'Domains'];
  
  const filteredServices = useMemo(() => {
    if (!data?.services) return [];
    const services = data.services;
    return filter === 'All' 
      ? services 
      : services.filter((s: any) => s.category === filter);
  }, [data, filter]);

  return (
    <div className="p-6 md:p-8 overflow-y-auto no-scrollbar">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-secondary font-bold">Services</h1>
          <Link href="/services/add">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border hover:border-primary/50 text-white hover:text-primary transition-all rounded-lg font-medium text-sm">
              <Plus size={16} />
              <span>Add Service</span>
            </button>
          </Link>
        </div>

        {/* Filter Chips */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
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

        {/* Grid of Cards */}
        {isLoading ? (
          <div className="text-center py-12 text-text-secondary">Loading services...</div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <p className="mb-4">No services yet.</p>
            <Link href="/services/add">
              <button className="px-4 py-2 bg-primary text-white rounded-lg">
                Add Your First Service
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service: any, index: number) => (
              <MotionDiv
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/services/${service.slug || createSlug(service.name)}`}>
                  <ServiceCard 
                    service={service} 
                  />
                </Link>
              </MotionDiv>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

