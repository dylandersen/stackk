'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, X, Key, ExternalLink, AlertCircle, Calendar, DollarSign, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { id } from '@instantdb/react';
import db from '@/lib/instant';
import { createSlug } from '@/utils/slug';
import { getServiceColor } from '@/utils/serviceColors';

const MotionDiv = motion.div as any;

const POPULAR_SERVICES = [
  // Hosting
  { name: 'Vercel', logo: '/logos/vercel.svg', cat: 'Hosting', requiresAuth: true },
  { name: 'Railway', logo: '/logos/railway.svg', cat: 'Hosting' },
  { name: 'Render', logo: '/logos/render.svg', cat: 'Hosting' },
  { name: 'Cloudflare', logo: '/logos/cloudflare.svg', cat: 'Hosting' },
  
  // Database
  { name: 'PlanetScale', logo: '/logos/planetscale.svg', cat: 'Database' },
  { name: 'Neon', logo: '/logos/neon.svg', cat: 'Database' },
  { name: 'Turso', logo: '/logos/turso.svg', cat: 'Database' },
  { name: 'Supabase', logo: '/logos/supabase.svg', cat: 'Database', requiresAuth: true },
  { name: 'Convex', logo: '/logos/convex.svg', cat: 'Database' },
  { name: 'Drizzle', logo: '/logos/drizzle.svg', cat: 'Database' },
  
  // Payments
  { name: 'Stripe', logo: '/logos/stripe.svg', cat: 'Payments' },
  { name: 'Lemon Squeezy', logo: '/logos/lemon-squeezy.svg', cat: 'Payments' },
  { name: 'Paddle', logo: '/logos/paddle.svg', cat: 'Payments' },
  { name: 'RevenueCat', logo: '/logos/revenuecat.svg', cat: 'Payments' },
  
  // API & Services
  { name: 'Resend', logo: '/logos/resend.svg', cat: 'API' },
  { name: 'Inngest', logo: '/logos/inngest.svg', cat: 'API' },
  { name: 'Upstash', logo: '/logos/upstash.svg', cat: 'API' },
  { name: 'WorkOS', logo: '/logos/workos.svg', cat: 'API' },
  { name: 'Clerk', logo: '/logos/clerk.svg', cat: 'API' },
  
  // AI & Tools
  { name: 'OpenAI', logo: '/logos/openai.svg', cat: 'Tools' },
  { name: 'OpenAI API', logo: '/logos/openai-api.svg', cat: 'Tools' },
  { name: 'Anthropic', logo: '/logos/anthropic.svg', cat: 'Tools' },
  { name: 'Anthropic API', logo: '/logos/anthropic-api.svg', cat: 'Tools' },
  { name: 'Google Gemini', logo: '/logos/googlegemini.svg', cat: 'Tools' },
  { name: 'GitHub Copilot', logo: '/logos/github-copilot.svg', cat: 'Tools' },
  { name: 'Cursor', logo: '/logos/cursor.svg', cat: 'Tools' },
  { name: 'v0', logo: '/logos/v0dev.svg', cat: 'Tools' },
  { name: 'Lovable', logo: '/logos/lovable.svg', cat: 'Tools' },
  
  // Productivity
  { name: 'Linear', logo: '/logos/linear.svg', cat: 'Productivity' },
  { name: 'Notion', logo: '/logos/notion.svg', cat: 'Productivity' },
  { name: 'Figma', logo: '/logos/figma.svg', cat: 'Productivity' },
  { name: 'Excalidraw', logo: '/logos/excalidraw.svg', cat: 'Productivity' },
  { name: 'tldraw', logo: '/logos/tldraw.svg', cat: 'Productivity' },
  
  // Monitoring & Analytics
  { name: 'Sentry', logo: '/logos/sentry.svg', cat: 'Monitoring' },
  { name: 'PostHog', logo: '/logos/posthog.svg', cat: 'Monitoring' },
  { name: 'Better Stack', logo: '/logos/better-stack.svg', cat: 'Monitoring' },
  { name: 'Fathom', logo: '/logos/fathom.svg', cat: 'Monitoring' },
  { name: 'Plausible', logo: '/logos/plausible.svg', cat: 'Monitoring' },
  { name: 'Crisp', logo: '/logos/crisp.svg', cat: 'Monitoring' },
  { name: 'Loops', logo: '/logos/loops.svg', cat: 'Monitoring' },
  
  // Development Tools
  { name: 'Docker Desktop', logo: '/logos/docker-desktop.svg', cat: 'Tools' },
  { name: 'JetBrains', logo: '/logos/jetbrains.svg', cat: 'Tools' },
  { name: 'Postman', logo: '/logos/postman.svg', cat: 'Tools' },
  { name: 'Insomnia', logo: '/logos/insomnia.svg', cat: 'Tools' },
  { name: 'TablePlus', logo: '/logos/tableplus.svg', cat: 'Tools' },
  { name: 'Expo', logo: '/logos/expo.svg', cat: 'Tools' },
  { name: 'Fastlane', logo: '/logos/fastlane.svg', cat: 'Tools' },
  { name: 'Doppler', logo: '/logos/doppler.svg', cat: 'Tools' },
  { name: 'GitLab', logo: '/logos/gitlab.svg', cat: 'Tools' },
  { name: 'Bitbucket', logo: '/logos/bitbucket.svg', cat: 'Tools' },
];

const CATEGORIES = ['All', 'Tools', 'Hosting', 'Cloud', 'Payments', 'API', 'Productivity', 'Database', 'Search', 'Monitoring'];

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddServiceModal({ isOpen, onClose }: AddServiceModalProps) {
  const router = useRouter();
  const user = db.useUser();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedService, setSelectedService] = useState<typeof POPULAR_SERVICES[0] | null>(null);
  const [showApiForm, setShowApiForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [vercelToken, setVercelToken] = useState('');
  const [vercelError, setVercelError] = useState('');
  const [isConnectingVercel, setIsConnectingVercel] = useState(false);
  
  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    name: '',
    planType: '',
    cost: '',
    billingResetDate: '',
    category: 'Tools',
  });
  const [isCreatingManual, setIsCreatingManual] = useState(false);

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

  const handleServiceClick = (service: typeof POPULAR_SERVICES[0]) => {
    setSelectedService(service);
    
    // Special handling for Supabase OAuth
    if (service.name === 'Supabase') {
      window.location.href = '/api/supabase/oauth/initiate';
      return;
    }

    // If service requires auth, show API form first
    if (service.requiresAuth) {
      setShowApiForm(true);
      setShowManualForm(false);
      setVercelError('');
      setVercelToken('');
    } else {
      // Otherwise, go straight to manual form
      setShowApiForm(false);
      setShowManualForm(true);
      setManualForm({
        ...manualForm,
        name: service.name,
        category: service.cat,
      });
    }
  };

  const handleBackToSelection = () => {
    setSelectedService(null);
    setShowApiForm(false);
    setShowManualForm(false);
    setVercelToken('');
    setVercelError('');
    setManualForm({
      name: '',
      planType: '',
      cost: '',
      billingResetDate: '',
      category: 'Tools',
    });
  };

  const handleSwitchToManual = () => {
    if (selectedService) {
      setShowApiForm(false);
      setShowManualForm(true);
      setManualForm({
        ...manualForm,
        name: selectedService.name,
        category: selectedService.cat,
      });
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

      // Reset form and close modal
      setShowApiForm(false);
      setVercelToken('');
      setSelectedService(null);
      setQuery('');
      onClose();
    } catch (error: any) {
      console.error('Error connecting Vercel:', error);
      setVercelError(error.message || 'Failed to connect Vercel account. Please check your token and try again.');
    } finally {
      setIsConnectingVercel(false);
    }
  };


  const handleCreateManual = async () => {
    if (!user || !manualForm.name.trim() || !manualForm.cost.trim()) return;
    
    setIsCreatingManual(true);
    try {
      const cost = parseFloat(manualForm.cost);
      if (isNaN(cost) || cost < 0) {
        throw new Error('Please enter a valid cost');
      }

      // Calculate next payment date from billing reset date
      let nextPayment: Date;
      if (manualForm.billingResetDate) {
        nextPayment = new Date(manualForm.billingResetDate);
        // If the date is in the past, add a month
        if (nextPayment < new Date()) {
          nextPayment.setMonth(nextPayment.getMonth() + 1);
        }
      } else {
        // Default to 30 days from now
        nextPayment = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }

      const serviceId = id();
      // Use selected service's logo and color if available, otherwise use name-based color
      const serviceLogo = selectedService?.logo || '';
      const serviceColor = selectedService 
        ? getServiceColor(selectedService.name)
        : getServiceColor(manualForm.name.trim());
      
      const serviceData = {
        id: serviceId,
        name: manualForm.name.trim(),
        category: manualForm.category,
        price: cost,
        currency: '$',
        billingCycle: 'monthly' as const,
        nextPayment: nextPayment.toISOString().split('T')[0],
        color: serviceColor,
        logo: serviceLogo,
        status: 'active' as const,
        connected: false,
        slug: createSlug(manualForm.name.trim()),
        userId: user.id,
        createdAt: new Date().toISOString(),
      };

      const transaction = db.tx.services[serviceId].update(serviceData);
      db.transact(transaction);

      // Reset form and close
      setManualForm({
        name: '',
        planType: '',
        cost: '',
        billingResetDate: '',
        category: 'Tools',
      });
      setSelectedService(null);
      setShowManualForm(false);
      onClose();
    } catch (error: any) {
      console.error('Error creating manual service:', error);
      alert(error.message || 'Failed to create service');
    } finally {
      setIsCreatingManual(false);
    }
  };

  const handleClose = () => {
    setQuery('');
    setSelectedService(null);
    setShowApiForm(false);
    setShowManualForm(false);
    setVercelToken('');
    setVercelError('');
    setManualForm({
      name: '',
      planType: '',
      cost: '',
      billingResetDate: '',
      category: 'Tools',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-surface border border-border rounded-card w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            {(showApiForm || showManualForm) && (
              <button
                onClick={handleBackToSelection}
                className="p-2 rounded-full bg-surface hover:bg-surface-hover border border-border transition-colors"
              >
                <ChevronLeft size={20} className="text-text-secondary" />
              </button>
            )}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-secondary">
                {showApiForm ? 'Connect via API' : showManualForm ? 'Add Service Details' : 'Add Service'}
              </h2>
              <p className="text-sm md:text-base text-text-secondary mt-1">
                {showApiForm ? 'Enter your API credentials' : showManualForm ? 'Fill in the service details' : 'Connect and track your developer tools'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-surface hover:bg-surface-hover border border-border transition-colors"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!showApiForm && !showManualForm ? (
            <>
              {/* Service Selection View */}
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                <input 
                  type="text"
                  placeholder="Search dev tools..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-4 pl-12 pr-4 text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors text-base"
                />
              </div>

              {/* Category Filters */}
              <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCategory === cat 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-background border border-border text-text-secondary hover:text-white hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Services List */}
              <div className="space-y-4">
                {filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-text-secondary text-lg">No services found</p>
                    <p className="text-text-secondary text-sm mt-2">Try adjusting your search or category filter</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm md:text-base font-bold text-text-secondary uppercase tracking-wider">
                        {activeCategory === 'All' ? 'Popular Dev Tools' : `${activeCategory} Tools`}
                      </h3>
                      <span className="text-xs text-text-secondary">{filtered.length} available</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filtered.map((service, i) => (
                        <MotionDiv 
                          key={service.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => handleServiceClick(service)}
                          className="flex items-center justify-between p-4 rounded-card border cursor-pointer transition-all bg-background border-border hover:border-white/20 hover:bg-background/80"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden p-1.5 shadow-sm flex-shrink-0">
                              <img 
                                src={service.logo} 
                                alt={service.name} 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Fallback to a placeholder if image fails to load
                                  (e.target as HTMLImageElement).src = '/stackk.png';
                                }}
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-base">{service.name}</h4>
                              <p className="text-xs text-text-secondary mt-0.5">
                                {service.cat}
                                {service.requiresAuth && (
                                  <span className="ml-2 text-primary">• Requires Auth</span>
                                )}
                              </p>
                            </div>
                          </div>
                          
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 border border-border">
                            <ChevronLeft size={18} className="text-text-secondary rotate-180" />
                          </div>
                        </MotionDiv>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : showApiForm ? (
            <>
              {/* API Connection Form */}
              {selectedService && (
                <div className="p-6 bg-background border border-border rounded-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 flex-shrink-0">
                      <img 
                        src={selectedService.logo} 
                        alt={selectedService.name} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/stackk.png';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Connect {selectedService.name}</h3>
                      <p className="text-sm text-text-secondary">Enter your API token to sync billing and usage data</p>
                    </div>
                  </div>

              <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      {selectedService.name} API Token
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                      <input
                        type="password"
                        value={vercelToken}
                        onChange={(e) => setVercelToken(e.target.value)}
                        placeholder={selectedService.name === 'Vercel' ? 'vercel_xxxxxxxxxxxxx' : 'Enter your API token'}
                        className="w-full bg-surface border border-border rounded-lg py-3 pl-10 pr-4 text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    {selectedService.name === 'Vercel' && (
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
                    )}
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
                          Connect {selectedService.name}
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSwitchToManual}
                      className="px-4 py-3 bg-surface border border-border hover:bg-surface-hover text-white rounded-btn transition-all"
                    >
                      Enter Manually
                    </button>
                  </div>
                </div>
              </div>
              )}
            </>
          ) : (
            <>
              {/* Manual Entry Form */}
              {selectedService && (
                <div className="flex items-center gap-3 mb-6 p-4 bg-background border border-border rounded-card">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 flex-shrink-0">
                    <img 
                      src={selectedService.logo} 
                      alt={selectedService.name} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/stackk.png';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{selectedService.name}</h3>
                    <p className="text-sm text-text-secondary">Add service details manually</p>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={manualForm.name}
                    onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                    placeholder="e.g., AWS, Stripe, GitHub"
                    className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Plan Type
                  </label>
                  <input
                    type="text"
                    value={manualForm.planType}
                    onChange={(e) => setManualForm({ ...manualForm, planType: e.target.value })}
                    placeholder="e.g., Pro, Hobby, Enterprise"
                    className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Monthly Cost ($) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={manualForm.cost}
                      onChange={(e) => setManualForm({ ...manualForm, cost: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Billing Reset Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                      type="date"
                      value={manualForm.billingResetDate}
                      onChange={(e) => setManualForm({ ...manualForm, billingResetDate: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg py-3 pl-10 pr-4 text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    The date when your billing cycle resets each month
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Category
                  </label>
                  <select
                    value={manualForm.category}
                    onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {showManualForm && (
          <div className="p-6 border-t border-border">
            <button 
              disabled={!manualForm.name.trim() || !manualForm.cost.trim() || isCreatingManual}
              className="w-full bg-primary disabled:bg-surface disabled:text-text-secondary disabled:border disabled:border-border hover:bg-primary-hover text-white font-bold py-4 rounded-btn shadow-lg transition-all text-base flex items-center justify-center gap-2"
              onClick={handleCreateManual}
            >
              {isCreatingManual ? (
                'Creating...'
              ) : (
                <>
                  <Plus size={20} />
                  Add Service
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

