'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Rocket, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { id } from '@instantdb/react';
import db from '@/lib/instant';
import SupabaseProjectSelector from '@/components/SupabaseProjectSelector';
import { SupabaseProject } from '@/lib/supabase-api';

export default function SupabaseSelectPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = db.useAuth();
  const { data: existingServices } = db.useQuery({ services: {} });
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all projects on mount
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/supabase/projects');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err: any) {
        console.error('Error fetching Supabase projects:', err);
        setError(err.message);
      } finally {
        setIsLoadingProjects(false);
      }
    }
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const handleConnect = async () => {
    if (!user || projects.length === 0) {
      console.error('[Supabase Connect] Missing user or projects', { user: !!user, projects: projects.length });
      return;
    }

    setIsConnecting(true);
    setError(null);

    console.log('[Supabase Connect] Starting connection for', projects.length, 'project(s)...');

    try {
      // Check if Supabase service already exists
      const existingSupabase = existingServices?.services?.find(
        (s: any) => s.name === 'Supabase' && s.userId === user.id
      );

      // Send all projects at once
      const response = await fetch('/api/supabase/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projects: projects.map(p => ({
            ref: p.ref,
            id: p.id,
            name: p.name,
            organization_id: p.organization_id,
          })),
          userId: user.id,
        }),
      });

      const data = await response.json();
      console.log('[Supabase Connect] Response received', { ok: response.ok, data });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect projects');
      }

      if (!data.service) {
        throw new Error('No service data returned');
      }

      // Update existing service or create new one
      if (existingSupabase) {
        console.log('[Supabase Connect] Updating existing Supabase service');
        // Merge projects - get existing projects and add new ones
        const existingProjects = existingSupabase.supabaseProjects 
          ? JSON.parse(existingSupabase.supabaseProjects) 
          : [];
        const newProjectRefs = new Set(data.projects.map((p: any) => p.ref));
        const mergedProjects = [
          ...existingProjects.filter((p: any) => !newProjectRefs.has(p.ref)),
          ...data.projects,
        ];
        
        const transaction = db.tx.services[existingSupabase.id].update({
          supabaseProjects: JSON.stringify(mergedProjects),
          supabaseTokenHash: data.service.supabaseTokenHash,
          supabaseRefreshTokenHash: data.service.supabaseRefreshTokenHash,
          lastSyncedAt: new Date().toISOString(),
        });
        db.transact(transaction);
        
        // Redirect with auto-refresh flag
        router.push(`/services/${existingSupabase.slug}?autoRefresh=true`);
      } else {
        console.log('[Supabase Connect] Creating new Supabase service');
        const serviceId = id();
        const serviceData = {
          id: serviceId,
          ...data.service,
        };

        const transaction = db.tx.services[serviceId].update(serviceData);
        db.transact(transaction);

        // Redirect with auto-refresh flag for first-time connection
        router.push(`/services/${data.service.slug}?autoRefresh=true`);
      }
    } catch (err: any) {
      console.error('[Supabase Connect] Connection error:', err);
      setError(err.message || 'An unexpected error occurred during connection');
      setIsConnecting(false);
    }
  };

  // Show loading state while checking auth (AuthGuard handles redirect)
  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <div className="mb-10">
        <button 
          onClick={() => router.push('/services')} 
          className="group flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-6"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Services</span>
        </button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 shadow-lg">
                <img src="/logos/supabase.svg" alt="Supabase" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-secondary">Connect Supabase</h1>
            </div>
            <p className="text-text-secondary text-lg max-w-xl">
              All of your Supabase projects will be connected and displayed in Stackk. We'll sync usage and billing data automatically.
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
            <ShieldCheck size={16} className="text-green-400" />
            <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Authenticated</span>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-card overflow-hidden shadow-2xl">
        <div className="p-6 md:p-8">
          <SupabaseProjectSelector 
            projects={projects} 
            isLoading={isLoadingProjects}
            error={error}
          />
          
          {error && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-800/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-6 md:px-8 bg-background/50 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-text-secondary">
            {projects.length > 0 ? (
              <span>
                <strong className="text-white">{projects.length} project{projects.length !== 1 ? 's' : ''}</strong> will be connected
              </span>
            ) : (
              isLoadingProjects ? 'Loading projects...' : 'No projects found'
            )}
          </div>
          
          <button
            onClick={handleConnect}
            disabled={projects.length === 0 || isConnecting || isLoadingProjects}
            className={`w-full md:w-auto px-8 py-4 bg-primary hover:bg-primary-hover disabled:bg-surface disabled:text-text-secondary disabled:border-border border border-transparent text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 ${projects.length > 0 && !isConnecting && !isLoadingProjects ? 'shadow-lg shadow-primary/20' : ''}`}
          >
            {isConnecting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Connecting {projects.length} Project{projects.length > 1 ? 's' : ''}...</span>
              </>
            ) : (
              <>
                <Rocket size={20} />
                <span>Connect {projects.length > 0 ? `${projects.length} ` : ''}Project{projects.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Secure Access', desc: 'Stackk uses limited OAuth scopes to only read your project data.' },
          { title: 'Real-time Sync', desc: 'Usage and billing stats are updated automatically every 24 hours.' },
          { title: 'No Write Access', desc: 'We only fetch stats. We will never modify your projects or data.' }
        ].map((item, i) => (
          <div key={i} className="p-5 rounded-xl bg-surface/50 border border-border/50">
            <h4 className="font-bold text-white text-sm mb-2">{item.title}</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

