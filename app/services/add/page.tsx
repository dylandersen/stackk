'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, Plus, X, ChevronLeft, Sparkles, Key, ExternalLink, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { id } from '@instantdb/react';
import db from '@/lib/instant';
import { createSlug } from '@/utils/slug';

const MotionDiv = motion.div as any;

const getLogo = (domain: string) => `https://logo.clearbit.com/${domain}`;

const POPULAR_SERVICES = [
  { name: 'Vercel', logo: '/logos/vercel.svg', cat: 'Hosting', requiresAuth: true },
  { name: 'Supabase', logo: '/logos/supabase.svg', cat: 'Database', requiresAuth: true },
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

const CATEGORIES = ['All', 'Tools', 'Hosting', 'Cloud', 'Payments', 'API', 'Productivity', 'Database', 'Search', 'Monitoring'];

export default function AddService() {
  const router = useRouter();
  const user = db.useUser();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isCreating, setIsCreating] = useState(false);
  const [showVercelForm, setShowVercelForm] = useState(false);
  const [vercelToken, setVercelToken] = useState('');
  const [vercelError, setVercelError] = useState('');
  const [isConnectingVercel, setIsConnectingVercel] = useState(false);

  const filtered = useMemo(() => {
    let services = POPULAR_SERVICES;
    
    if (query) {
      services = services.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
    }
    
    if (activeCategory !== 'All') {
      services = services.filter(s => s.cat === activeCategory);
    }
    
    return services;
  }, [query, activeCategory]);

  const toggleSelect = (name: string) => {
    const service = POPULAR_SERVICES.find(s => s.name === name);
    
    // Special handling for Supabase OAuth
    if (service?.requiresAuth && name === 'Supabase') {
      window.location.href = '/api/supabase/oauth/initiate';
      return;
    }

    // Special handling for Vercel - show auth form
    if (service?.requiresAuth && name === 'Vercel') {
      if (!showVercelForm) {
        setShowVercelForm(true);
        setVercelError('');
        setVercelToken('');
      }
      return;
    }
    
    if (selected.includes(name)) {
      setSelected(selected.filter(s => s !== name));
    } else {
      setSelected([...selected, name]);
    }
  };

  const handleConnectVercel = async () => {
    if (!user || !vercelToken.trim()) {
      setVercelError('Please enter your Vercel API token');
      return;
    }

    setIsConnectingVercel(true);
    setVercelError('');

    try {
      const response = await fetch('/api/vercel/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: vercelToken.trim(),
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect Vercel account');
      }

      // Create service record with the returned data
      const serviceId = id();
      
      // Remove any undefined values (InstantDB doesn't accept undefined)
      const serviceData: any = {
        id: serviceId,
      };
      
      // Only include defined values
      Object.keys(data.service).forEach(key => {
        if (data.service[key] !== undefined) {
          serviceData[key] = data.service[key];
        }
      });

      const transaction = db.tx.services[serviceId].update(serviceData);
      db.transact(transaction);

      // Reset form and redirect
      setShowVercelForm(false);
      setVercelToken('');
      router.push('/services');
    } catch (error: any) {
      console.error('Error connecting Vercel:', error);
      setVercelError(error.message || 'Failed to connect Vercel account. Please check your token and try again.');
    } finally {
      setIsConnectingVercel(false);
    }
  };

  const handleCreateServices = async () => {
    if (!user || selected.length === 0) return;
    
    setIsCreating(true);
    try {
      const serviceData = selected.map(serviceName => {
        const serviceInfo = POPULAR_SERVICES.find(s => s.name === serviceName);
        const serviceId = id();
        return {
          id: serviceId,
          name: serviceName,
          category: serviceInfo?.cat || 'Tools',
          price: 0,
          currency: '$',
          billingCycle: 'monthly',
          nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          color: '#6366F1', // Default color
          logo: serviceInfo?.logo || '',
          status: 'active',
          connected: false,
          slug: createSlug(serviceName),
          userId: user.id,
        };
      });

      const transactions = serviceData.map(service => 
        db.tx.services[service.id].update(service)
      );
      db.transact(...(transactions as Parameters<typeof db.transact>));

      router.push('/services');
    } catch (error) {
      console.error('Error creating services:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-surface hover:bg-surface-hover border border-border transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-secondary">Add Service</h1>
            <p className="text-sm md:text-base text-text-secondary mt-1">Connect and track your developer tools</p>
          </div>
        </div>
        {selected.length > 0 && (
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg">
            <Sparkles size={16} className="text-primary" />
            <span className="text-primary font-semibold text-sm">{selected.length} selected</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 md:mb-8">
        <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
        <input 
          type="text"
          placeholder="Search dev tools..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl py-4 md:py-5 pl-12 md:pl-14 pr-4 md:pr-6 text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors text-base"
        />
      </div>

      {/* Category Filters */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 md:mb-8 pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-surface border border-border text-text-secondary hover:text-white hover:border-white/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vercel Connection Form */}
      {showVercelForm && (
        <div className="mb-6 md:mb-8 p-6 md:p-8 bg-surface border border-border rounded-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2">
                <img src="/logos/vercel.svg" alt="Vercel" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Connect Vercel</h2>
                <p className="text-sm text-text-secondary">Enter your Vercel API token to sync billing and usage data</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowVercelForm(false);
                setVercelToken('');
                setVercelError('');
              }}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Vercel API Token
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input
                  type="password"
                  value={vercelToken}
                  onChange={(e) => setVercelToken(e.target.value)}
                  placeholder="vercel_xxxxxxxxxxxxx"
                  className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Get your token from{' '}
                <a
                  href="https://vercel.com/account/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Vercel Settings
                  <ExternalLink size={12} />
                </a>
              </p>
            </div>

            {vercelError && (
              <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
                <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-400">{vercelError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleConnectVercel}
                disabled={isConnectingVercel || !vercelToken.trim()}
                className="flex-1 bg-primary disabled:bg-surface disabled:text-text-secondary disabled:border disabled:border-border hover:bg-primary-hover text-white font-bold py-3 rounded-btn transition-all flex items-center justify-center gap-2"
              >
                {isConnectingVercel ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Key size={18} />
                    Connect Vercel
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowVercelForm(false);
                  setVercelToken('');
                  setVercelError('');
                }}
                className="px-4 py-3 bg-surface border border-border hover:bg-surface-hover text-white rounded-btn transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4 pb-24 md:pb-8">
        {filtered.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <p className="text-text-secondary text-lg">No services found</p>
            <p className="text-text-secondary text-sm mt-2">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm md:text-base font-bold text-text-secondary uppercase tracking-wider">
                {activeCategory === 'All' ? 'Popular Dev Tools' : `${activeCategory} Tools`}
              </h2>
              <span className="text-xs text-text-secondary">{filtered.length} available</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {filtered.map((service, i) => {
                const isSelected = selected.includes(service.name);
                const isVercelActive = service.name === 'Vercel' && showVercelForm;
                return (
                  <MotionDiv 
                    key={service.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => toggleSelect(service.name)}
                    className={`flex items-center justify-between p-4 md:p-5 rounded-card border cursor-pointer transition-all ${
                      isSelected || isVercelActive
                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' 
                        : 'bg-surface border-border hover:border-white/20 hover:bg-surface/80'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white flex items-center justify-center overflow-hidden p-1.5 shadow-sm">
                        <img src={service.logo} alt={service.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base md:text-lg">{service.name}</h3>
                        <p className="text-xs md:text-sm text-text-secondary mt-0.5">
                          {service.cat}
                          {service.requiresAuth && (
                            <span className="ml-2 text-primary">• Requires Auth</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${
                      isSelected || isVercelActive
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-white/10 text-transparent border border-border'
                    }`}>
                      {service.requiresAuth && isVercelActive ? (
                        <Key size={18} className="opacity-100" />
                      ) : (
                        <Check size={18} className={isSelected ? 'opacity-100' : 'opacity-0'} />
                      )}
                    </div>
                  </MotionDiv>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 md:relative p-6 md:p-0 md:mt-8 bg-background/95 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none border-t border-border md:border-0">
        <button 
          disabled={selected.length === 0 || isCreating}
          className="w-full bg-primary disabled:bg-surface disabled:text-text-secondary disabled:border disabled:border-border hover:bg-primary-hover text-white font-bold py-4 md:py-5 rounded-btn shadow-lg transition-all text-base md:text-lg flex items-center justify-center gap-2"
          onClick={handleCreateServices}
        >
          {isCreating ? (
            'Creating...'
          ) : selected.length === 0 ? (
            'Select Services to Track'
          ) : (
            <>
              <Plus size={20} />
              Track {selected.length} {selected.length === 1 ? 'Service' : 'Services'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

