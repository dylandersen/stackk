'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Calendar, FileText, Settings, RefreshCw, AlertCircle, CheckCircle2, Link2, Link2Off, Server, Clock, BarChart3, Trash2, X } from 'lucide-react';
import db from '@/lib/instant';
import { createSlug } from '@/utils/slug';
import VercelSummaryStats from '@/components/VercelSummaryStats';
import VercelProjectsTable from '@/components/VercelProjectsTable';
import DeploymentFrequencyChart from '@/components/charts/DeploymentFrequencyChart';
import ProjectDistributionChart from '@/components/charts/ProjectDistributionChart';
import SupabaseSummaryStats from '@/components/SupabaseSummaryStats';
import SupabaseProjectInfo from '@/components/SupabaseProjectInfo';
import SupabaseBillingCard from '@/components/SupabaseBillingCard';
import SupabaseUsageChart from '@/components/charts/SupabaseUsageChart';
import SupabaseProjectsList from '@/components/SupabaseProjectsList';
import SupabaseResourcesCard from '@/components/SupabaseResourcesCard';
import type { VercelDataResponse } from '@/app/api/vercel/data/route';
import type { SupabaseDataResponse } from '@/app/api/supabase/data/route';

export default function ServiceDetail() {
  const paramsResult = useParams();
  const params = paramsResult instanceof Promise 
    ? React.use(paramsResult)
    : (paramsResult as Record<string, string | string[]> | null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params?.slug as string | undefined;
  const { data, isLoading } = db.useQuery({ services: {} });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [vercelData, setVercelData] = useState<VercelDataResponse | null>(null);
  const [supabaseData, setSupabaseData] = useState<SupabaseDataResponse | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasAutoRefreshed = useRef(false);
  
  const service = useMemo(() => {
    if (!data?.services) return null;
    const found = data.services.find((s: any) => (s.slug || createSlug(s.name)) === slug);
    if (!found) return null;
    return {
      ...found,
      billingCycle: found.billingCycle as 'monthly' | 'yearly',
      status: found.status as 'active' | 'paused' | 'canceled',
    };
  }, [data, slug]);

  const isVercelService = service?.name === 'Vercel' && service?.connected && service?.vercelTokenHash;
  const isSupabaseService = service?.name === 'Supabase' && service?.connected && service?.supabaseTokenHash;

  // Redirect if service doesn't exist
  useEffect(() => {
    if (!isLoading && data?.services && !service) {
      router.push('/services');
    }
  }, [isLoading, data, service, router]);

  // Get Supabase projects from service
  const supabaseProjects = useMemo(() => {
    if (!service?.supabaseProjects) return [];
    try {
      return JSON.parse(service.supabaseProjects);
    } catch (error) {
      console.error('Error parsing Supabase projects:', error);
      return [];
    }
  }, [service?.supabaseProjects]);

  // Load cached data on mount
  useEffect(() => {
    if (service?.vercelDataCache && service?.vercelDataFetchedAt) {
      try {
        const cachedData = JSON.parse(service.vercelDataCache);
        setVercelData(cachedData);
      } catch (error) {
        console.error('Error parsing cached Vercel data:', error);
      }
    }
    if (service?.supabaseDataCache && service?.supabaseDataFetchedAt) {
      try {
        const cachedData = JSON.parse(service.supabaseDataCache);
        setSupabaseData(cachedData);
      } catch (error) {
        console.error('Error parsing cached Supabase data:', error);
      }
    }
  }, [service?.vercelDataCache, service?.vercelDataFetchedAt, service?.supabaseDataCache, service?.supabaseDataFetchedAt]);


  const handleSync = async () => {
    if (!service) return;
    
    if (isVercelService && service.vercelTokenHash) {
      await handleVercelSync();
    } else if (isSupabaseService && service.supabaseTokenHash) {
      await handleSupabaseSync();
    }
  };

  const handleVercelSync = async () => {
    if (!service || !service.vercelTokenHash) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const response = await fetch('/api/vercel/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          encryptedToken: service.vercelTokenHash,
        }),
      });

      let result: any = {};
      
      try {
        const text = await response.text();
        if (text) {
          result = JSON.parse(text);
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server. Please try again.');
      }

      if (!response.ok) {
        throw new Error(result.error || `Failed to sync data (${response.status})`);
      }

      if (!result.updates) {
        throw new Error('No update data received from server');
      }

      const updates: any = {};
      Object.keys(result.updates).forEach(key => {
        if (result.updates[key] !== undefined) {
          updates[key] = result.updates[key];
        }
      });
      
      const transaction = db.tx.services[service.id].update(updates);
      db.transact(transaction);
    } catch (error: any) {
      console.error('Error syncing Vercel:', error);
      setSyncError(error.message || 'Failed to sync data');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSupabaseSync = async () => {
    if (!service || !service.supabaseTokenHash) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Get the first project ref from supabaseProjects
      let projectRef: string | undefined;
      if (service.supabaseProjects) {
        try {
          const projects = JSON.parse(service.supabaseProjects);
          if (Array.isArray(projects) && projects.length > 0) {
            projectRef = projects[0].ref;
          }
        } catch (error) {
          console.error('Error parsing Supabase projects for sync:', error);
        }
      }

      if (!projectRef) {
        throw new Error('No Supabase project found to sync');
      }

      const response = await fetch('/api/supabase/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          encryptedToken: service.supabaseTokenHash,
          encryptedRefreshToken: service.supabaseRefreshTokenHash,
          projectRef: projectRef,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync Supabase');
      }

      const transaction = db.tx.services[service.id].update(result.updates);
      db.transact(transaction);
    } catch (error: any) {
      console.error('Error syncing Supabase:', error);
      setSyncError(error.message || 'Failed to sync Supabase');
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchData = async () => {
    if (isVercelService) {
      await fetchVercelData();
    } else if (isSupabaseService) {
      await fetchSupabaseData();
    }
  };

  const fetchVercelData = async () => {
    if (!service || !isVercelService || !service.vercelTokenHash) return;

    setIsLoadingData(true);
    setDataError(null);

    try {
      const response = await fetch('/api/vercel/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          encryptedToken: service.vercelTokenHash,
          teamId: service.vercelTeamId,
          limit: 100,
        }),
      });

      let result: any = {};
      
      try {
        const text = await response.text();
        if (text) {
          result = JSON.parse(text);
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server. Please try again.');
      }

      if (!response.ok) {
        throw new Error(result.error || `Failed to fetch data (${response.status})`);
      }

      if (!result.data) {
        throw new Error('No data received from server');
      }

      // Save to state
      setVercelData(result.data);

      // Persist to database
      if (service) {
        const updates: any = {
          vercelDataCache: JSON.stringify(result.data),
          vercelDataFetchedAt: new Date().toISOString(),
        };
        
        // Also update plan if provided
        if (result.plan) {
          updates.vercelPlan = result.plan;
        }
        
        const transaction = db.tx.services[service.id].update(updates);
        db.transact(transaction);
      }
    } catch (error: any) {
      console.error('Error fetching Vercel data:', error);
      setDataError(error.message || 'Failed to fetch Vercel data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchSupabaseData = async () => {
    if (!service || !isSupabaseService || !service.supabaseTokenHash) return;

    setIsLoadingData(true);
    setDataError(null);

    // Get all project refs from the service
    const projectRefs = supabaseProjects.map((p: any) => p.ref);
    if (projectRefs.length === 0) {
      setDataError('No projects connected');
      setIsLoadingData(false);
      return;
    }

    try {
      const response = await fetch('/api/supabase/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          encryptedToken: service.supabaseTokenHash,
          encryptedRefreshToken: service.supabaseRefreshTokenHash,
          projectRefs: projectRefs, // Send all project refs
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch Supabase data');
      }

      setSupabaseData(result.data);

      // Persist to DB - save ALL data including plan, billing, project details, etc.
      const updates: any = {
        supabaseDataCache: JSON.stringify(result.data),
        supabaseDataFetchedAt: new Date().toISOString(),
      };

      // Save plan information if available
      if (result.data?.billing?.plan) {
        updates.supabasePlan = result.data.billing.plan.toLowerCase();
      }

      // Update price based on plan
      const planName = result.data?.billing?.plan?.toLowerCase() || 'free';
      const planPricing: Record<string, number> = {
        free: 0,
        pro: 25,
        team: 599,
        enterprise: 0,
      };
      if (planPricing[planName] !== undefined) {
        updates.price = planPricing[planName];
      }

      if (result.newTokens) {
        updates.supabaseTokenHash = result.newTokens.accessToken;
        updates.supabaseRefreshTokenHash = result.newTokens.refreshToken;
      }

      const transaction = db.tx.services[service.id].update(updates);
      db.transact(transaction);
    } catch (error: any) {
      console.error('Error fetching Supabase data:', error);
      setDataError(error.message || 'Failed to fetch Supabase data');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Auto-refresh on first connection or when autoRefresh query param is present
  useEffect(() => {
    if (!service || isLoading || isLoadingData || hasAutoRefreshed.current || !isSupabaseService || !searchParams) return;
    
    const shouldAutoRefresh = searchParams.get('autoRefresh') === 'true';
    const hasNoCachedData = !service.supabaseDataCache;
    
    if (shouldAutoRefresh || hasNoCachedData) {
      hasAutoRefreshed.current = true;
      // Remove query param from URL
      if (shouldAutoRefresh) {
        router.replace(`/services/${slug}`, { scroll: false });
      }
      // Trigger data fetch
      console.log('[Supabase] Auto-refreshing data on first connection');
      fetchSupabaseData();
    }
    // Note: fetchSupabaseData is intentionally not in deps - it's stable and uses current state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, isLoading, isSupabaseService, searchParams, slug, router, isLoadingData]);

  const handleDisconnect = async () => {
    if (!service || (!isVercelService && !isSupabaseService)) return;

    const provider = isVercelService ? 'Vercel' : 'Supabase';
    if (!confirm(`Are you sure you want to disconnect your ${provider} account? This will remove all connection data.`)) {
      return;
    }

    try {
      const endpoint = isVercelService ? '/api/vercel/disconnect' : '/api/supabase/disconnect';
      const body = isVercelService 
        ? { serviceId: service.id }
        : { serviceId: service.id, encryptedRefreshToken: service.supabaseRefreshTokenHash };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to disconnect');
      }

      // Delete the service entirely when disconnecting
      const transaction = db.tx.services[service.id].delete();
      db.transact(transaction);
      
      // Clear local state
      setVercelData(null);
      setSupabaseData(null);
      
      router.push('/services');
    } catch (error: any) {
      console.error(`Error disconnecting ${provider}:`, error);
      alert(error.message || `Failed to disconnect ${provider} account`);
    }
  };

  const handleDeleteService = async () => {
    if (!service) return;

    if (!confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete the service
      const transaction = db.tx.services[service.id].delete();
      db.transact(transaction);
      
      // Clear local state
      setVercelData(null);
      setShowSettingsModal(false);
      
      // Navigate back to services page
      router.push('/services');
    } catch (error: any) {
      console.error('Error deleting service:', error);
      alert(error.message || 'Failed to delete service');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-surface rounded w-1/3"></div>
          <div className="h-32 bg-surface rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-surface rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="space-y-8 md:space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-surface hover:bg-surface-hover rounded-full transition-colors border border-border"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold font-secondary">{service.name}</h1>
            {isVercelService && (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full">
                <Link2 size={14} className="text-primary" />
                <span className="text-xs font-medium text-primary">Connected</span>
              </div>
            )}
            {isSupabaseService && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                <Link2 size={14} className="text-green-400" />
                <span className="text-xs font-medium text-green-400">Connected</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="p-2 bg-surface hover:bg-surface-hover rounded-full transition-colors border border-border"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Service Card */}
        <div 
          className="relative overflow-hidden rounded-card py-3 px-6"
          style={{ backgroundColor: service.color }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
          
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {service.logo ? (
                <div className="bg-white rounded-xl p-1 shadow-lg flex-shrink-0">
                  <img 
                    src={service.logo} 
                    alt={service.name} 
                    className="w-[18px] h-[18px] md:w-6 md:h-6 object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="bg-white/20 rounded-xl p-1 shadow-lg flex items-center justify-center w-[18px] h-[18px] md:w-6 md:h-6 flex-shrink-0">
                  <span className="text-white font-bold text-xs md:text-sm">
                    {service.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <h3 className="text-white font-bold text-base md:text-lg whitespace-nowrap font-secondary">{service.name}</h3>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-white font-bold font-mono text-sm md:text-base border border-white/20 whitespace-nowrap shadow-lg">
                {service.currency}{service.price}
                <span className="text-white/70 text-xs font-normal ml-1">/{service.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
              </span>
              {isVercelService && (service as any).vercelPlan && (
                <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-blue-300 font-bold text-xs md:text-sm border border-blue-400/40 whitespace-nowrap capitalize shadow-lg">
                  {(service as any).vercelPlan}
                </span>
              )}
              {isSupabaseService && supabaseData && (
                <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-green-300 font-bold text-xs md:text-sm border border-green-400/40 whitespace-nowrap capitalize shadow-lg">
                  {supabaseData.billing.plan} Plan
                </span>
              )}
              {(isVercelService || isSupabaseService) && (
                <>
                  <button
                    onClick={fetchData}
                    disabled={isLoadingData || isSyncing}
                    className="flex items-center gap-2 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full text-white font-bold text-xs md:text-sm border border-white/20 hover:border-white/30 disabled:bg-surface disabled:text-text-secondary disabled:border-border transition-all whitespace-nowrap flex-shrink-0 shadow-lg"
                  >
                    <RefreshCw size={14} className={(isLoadingData || isSyncing) ? 'animate-spin' : ''} />
                    {isLoadingData ? 'Loading...' : 'Refresh Data'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {(isVercelService || isSupabaseService) && (
          <>
            {(service.syncError || syncError) && (
              <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
                <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-400 mb-1">Sync Error</p>
                  <p className="text-xs text-red-300">{service.syncError || syncError}</p>
                </div>
              </div>
            )}

            {dataError && (
              <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
                <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-400 mb-1">Data Fetch Error</p>
                  <p className="text-xs text-red-300">{dataError}</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Supabase-specific content */}
        {isSupabaseService ? (
          <>
            {/* Summary Statistics - Show if we have data */}
            {supabaseData && supabaseData.statistics && (
              <SupabaseSummaryStats statistics={supabaseData.statistics} />
            )}

            {/* Loading State */}
            {isLoadingData && !supabaseData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-surface border border-border rounded-card p-6 animate-pulse">
                      <div className="h-4 bg-background rounded w-1/2 mb-4"></div>
                      <div className="h-8 bg-background rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
                <div className="h-64 bg-surface border border-border rounded-card animate-pulse"></div>
                <div className="h-96 bg-surface border border-border rounded-card animate-pulse"></div>
              </div>
            )}

            {/* Projects List - Always show if projects exist */}
            {supabaseProjects.length > 0 && (
              <SupabaseProjectsList projects={supabaseProjects} />
            )}

            {/* Main Content */}
            {supabaseData && (
              <div className="space-y-8">
                {supabaseData.billing && (
                  <SupabaseBillingCard 
                    billing={supabaseData.billing} 
                    projectRef={supabaseProjects[0]?.ref || ''} 
                  />
                )}
                
                {/* Resources & Services */}
                <SupabaseResourcesCard
                  edgeFunctions={supabaseData.edgeFunctions}
                  storageBuckets={supabaseData.storageBuckets}
                  branches={supabaseData.branches}
                  billingAddons={supabaseData.billing?.addons}
                />
                
                <section className="relative bg-surface border border-border rounded-card p-6 md:p-8 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                      <BarChart3 size={20} className="text-green-400" />
                      <h2 className="font-bold text-white text-lg md:text-xl font-secondary">Usage Overview</h2>
                    </div>
                    <SupabaseUsageChart color={service.color} />
                  </div>
                </section>

                {supabaseData.project && (
                  <SupabaseProjectInfo project={supabaseData.project} organization={supabaseData.organization} />
                )}
              </div>
            )}

            {/* Empty State */}
            {!isLoadingData && !supabaseData && !dataError && (
              <div className="relative bg-surface border border-border rounded-card p-8 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <p className="text-text-secondary mb-4">Click "Refresh Data" to load your Supabase project details</p>
                </div>
              </div>
            )}
          </>
        ) : isVercelService ? (
          <>
            {/* Summary Statistics */}
            {vercelData && (
              <VercelSummaryStats statistics={vercelData.statistics} />
            )}

            {/* Loading State */}
            {isLoadingData && !vercelData && (
              <div className="space-y-6">
                {/* Summary Stats Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-surface border border-border rounded-card p-6 animate-pulse">
                      <div className="h-4 bg-background rounded w-1/2 mb-4"></div>
                      <div className="h-8 bg-background rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
                
                {/* Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-surface border border-border rounded-card p-6 md:p-8 animate-pulse">
                      <div className="h-6 bg-background rounded w-1/3 mb-6"></div>
                      <div className="h-64 md:h-80 bg-background rounded"></div>
                    </div>
                  ))}
                </div>
                
                {/* Table Skeleton */}
                <div className="bg-surface border border-border rounded-card p-6 md:p-8 animate-pulse">
                  <div className="h-6 bg-background rounded w-1/4 mb-6"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-16 bg-background rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Charts Section */}
            {vercelData && (vercelData.statistics.deploymentFrequency.length > 0 || Object.keys(vercelData.statistics.frameworkDistribution).length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {vercelData.statistics.deploymentFrequency.length > 0 && (
                  <section className="relative bg-surface border border-border rounded-card p-6 md:p-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-6">
                        <BarChart3 size={20} className="text-primary" />
                        <h2 className="font-bold text-white text-lg md:text-xl font-secondary">Deployment Frequency</h2>
                      </div>
                      <DeploymentFrequencyChart 
                        data={vercelData.statistics.deploymentFrequency}
                        color={service.color}
                      />
                    </div>
                  </section>
                )}

                {Object.keys(vercelData.statistics.frameworkDistribution).length > 0 && (
                  <section className="relative bg-surface border border-border rounded-card p-6 md:p-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-6">
                        <BarChart3 size={20} className="text-primary" />
                        <h2 className="font-bold text-white text-lg md:text-xl font-secondary">Framework Distribution</h2>
                      </div>
                      <ProjectDistributionChart 
                        data={vercelData.statistics.frameworkDistribution}
                      />
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Projects Table */}
            {vercelData && vercelData.projects.length > 0 && (
              <section className="relative bg-surface border border-border rounded-card p-6 md:p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="font-bold text-white text-lg md:text-xl mb-6 font-secondary">Projects</h2>
                  <VercelProjectsTable 
                    projects={vercelData.projects}
                    deployments={vercelData.deployments}
                  />
                </div>
              </section>
            )}

            {/* Empty State - No data fetched yet */}
            {!isLoadingData && !vercelData && !dataError && (
              <div className="relative bg-surface border border-border rounded-card p-8 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <p className="text-text-secondary mb-4">Click "Refresh Data" to load your Vercel projects and deployments</p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Non-Vercel Service Content */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <section className="relative bg-surface border border-border rounded-card p-6 md:p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="font-bold text-white text-lg md:text-xl mb-4 font-secondary">Service Information</h2>
                  <p className="text-text-secondary">Connect this service to see detailed analytics and usage data.</p>
                </div>
              </section>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                <div className="relative bg-surface border border-border rounded-card p-5 md:p-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
                  <div className="relative z-10">
                    <span className="text-text-secondary text-xs flex items-center gap-2 mb-3">
                      <Calendar size={14} /> Next Payment
                    </span>
                    <p className="text-white font-bold text-lg">
                      {service.nextPayment 
                        ? new Date(service.nextPayment).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'N/A'}
                    </p>
                    {service.billingCycle && (
                      <p className="text-xs text-text-secondary mt-1">
                        {service.billingCycle === 'yearly' ? 'Annual' : 'Monthly'} billing
                      </p>
                    )}
                  </div>
                </div>
                <div className="relative bg-surface border border-border rounded-card p-5 md:p-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
                  <div className="relative z-10">
                    <span className="text-text-secondary text-xs flex items-center gap-2 mb-3">
                      <FileText size={14} /> Plan
                    </span>
                    <p className="text-white font-bold text-lg capitalize">
                      {service.price >= 20 ? 'Pro' : service.price > 0 ? 'Hobby' : 'Free'}
                    </p>
                    {service.price > 0 && (
                      <p className="text-xs text-text-secondary mt-1">
                        ${service.price.toFixed(2)}/{service.billingCycle === 'yearly' ? 'yr' : 'mo'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connection Info Cards */}
        {isVercelService && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="relative bg-surface border border-border rounded-card p-5 md:p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span className="text-text-secondary text-xs font-medium">Status</span>
                </div>
                {!service.syncError && !syncError && service.lastSyncedAt ? (
                  <div className="space-y-1">
                    <p className="text-white font-bold text-lg font-secondary">Active</p>
                    <p className="text-xs text-text-secondary">Connection is working properly</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-red-400 font-bold text-lg font-secondary">Error</p>
                    <p className="text-xs text-red-300">Connection issue detected</p>
                  </div>
                )}
              </div>
            </div>

            <div className="relative bg-surface border border-border rounded-card p-5 md:p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-primary" />
                  <span className="text-text-secondary text-xs font-medium">Last Synced</span>
                </div>
                {service.lastSyncedAt ? (
                  <div className="space-y-1">
                    <p className="text-white font-bold text-lg font-secondary">
                      {new Date(service.lastSyncedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(service.lastSyncedAt).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-white font-bold text-lg font-secondary">Never</p>
                    <p className="text-xs text-text-secondary">No sync data available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="relative bg-surface border border-border rounded-card p-5 md:p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Server size={16} className="text-primary" />
                  <span className="text-text-secondary text-xs font-medium">Team ID</span>
                </div>
                {service.vercelTeamId ? (
                  <div className="space-y-1">
                    <p className="text-white font-mono text-sm font-bold truncate">{service.vercelTeamId}</p>
                    <p className="text-xs text-text-secondary">Vercel team identifier</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-white font-bold text-lg">N/A</p>
                    <p className="text-xs text-text-secondary">No team ID available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {isVercelService && (
          <div className="flex justify-end">
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-danger/10 border border-danger/30 text-danger font-medium rounded-btn hover:bg-danger/20 transition-all flex items-center gap-2"
            >
              <Link2Off size={18} />
              Disconnect Vercel
            </button>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSettingsModal(false)}
        >
          <div 
            className="bg-surface border border-border rounded-card p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 hover:bg-background rounded-full transition-colors"
              >
                <X size={20} className="text-text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleDeleteService}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-danger/10 border border-danger/30 text-danger font-medium rounded-btn hover:bg-danger/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={18} />
                {isDeleting ? 'Deleting...' : 'Delete Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
