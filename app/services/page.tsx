'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import db from '@/lib/instant';
import SortableServiceCard from '@/components/SortableServiceCard';
import { useAddServiceModal } from '@/contexts/AddServiceModalContext';
import { Service } from '@/types';
import { createSlug } from '@/utils/slug';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

export default function ServicesList() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const { openModal } = useAddServiceModal();
  const { data, isLoading } = db.useQuery({ services: {} });
  
  const categories = ['All', 'AI Models', 'Hosting', 'Backend', 'Tools', 'Email', 'Domains'];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const filteredServices = useMemo(() => {
    if (!data?.services) return [];
    const services = data.services;
    const filtered = filter === 'All' 
      ? services 
      : services.filter((s: any) => s.category === filter);
    
    // Type assertion to match Service interface
    const mapped = filtered.map((s: any) => ({
      ...s,
      billingCycle: s.billingCycle as 'monthly' | 'yearly',
      status: s.status as 'active' | 'paused' | 'canceled',
      sortOrder: s.sortOrder ?? 0, // Default to 0 if no sortOrder
    }));

    // Sort by sortOrder, then by name for consistent ordering
    return mapped.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      }
      return a.name.localeCompare(b.name);
    });
  }, [data, filter]);

  // Initialize sortOrder for services that don't have it
  useEffect(() => {
    if (!data?.services || isLoading) return;
    
    const servicesWithoutSortOrder = data.services.filter((s: any) => s.sortOrder == null);
    if (servicesWithoutSortOrder.length > 0) {
      // Get the maximum sortOrder, or start from the number of services
      const maxSortOrder = Math.max(
        ...data.services.map((s: any) => s.sortOrder ?? 0),
        data.services.length - 1
      );
      
      const transactions = servicesWithoutSortOrder.map((service: any, index: number) => 
        db.tx.services[service.id].update({
          sortOrder: maxSortOrder + index + 1,
        })
      );
      
      if (transactions.length > 0) {
        db.transact(...(transactions as Parameters<typeof db.transact>));
      }
    }
  }, [data, isLoading]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = filteredServices.findIndex((s) => s.id === active.id);
    const newIndex = filteredServices.findIndex((s) => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Get the sortOrder range for the filtered services
    const sortOrders = filteredServices.map(s => s.sortOrder ?? 0).sort((a, b) => a - b);
    const minSortOrder = sortOrders[0];
    
    // Reorder services array
    const reorderedServices = arrayMove(filteredServices, oldIndex, newIndex);

    // Update sortOrder for all services in the filtered list to maintain their new order
    const transactions = reorderedServices.map((service, index) => {
      const newSortOrder = minSortOrder + index;
      
      // Only update if the sortOrder actually changed
      if (service.sortOrder !== newSortOrder) {
        return db.tx.services[service.id].update({
          sortOrder: newSortOrder,
        });
      }
      return null;
    }).filter((tx): tx is NonNullable<typeof tx> => tx !== null);

    if (transactions.length > 0) {
      db.transact(...(transactions as Parameters<typeof db.transact>));
    }
  };

  const handleServiceClick = (service: Service) => {
    router.push(`/services/${service.slug || createSlug(service.name)}`);
  };

  return (
    <div className="p-6 md:p-8 overflow-y-auto no-scrollbar">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-secondary font-bold">Services</h1>
          <button 
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border hover:border-primary/50 text-white hover:text-primary transition-all rounded-lg font-medium text-sm"
          >
            <Plus size={16} />
            <span>Add Service</span>
          </button>
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
            <button 
              onClick={openModal}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Add Your First Service
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredServices.map((s) => s.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service) => (
                  <SortableServiceCard
                    key={service.id}
                    service={service}
                    onClick={() => handleServiceClick(service)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

