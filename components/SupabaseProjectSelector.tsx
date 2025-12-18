'use client';

import React from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { SupabaseProject } from '@/lib/supabase-api';

interface SupabaseProjectSelectorProps {
  projects: SupabaseProject[];
  isLoading: boolean;
  error: string | null;
}

export default function SupabaseProjectSelector({ projects, isLoading, error }: SupabaseProjectSelectorProps) {

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-text-secondary font-medium">Fetching your Supabase projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-800/30 rounded-xl flex items-start gap-3">
        <AlertCircle className="text-red-400 mt-0.5" size={20} />
        <div>
          <h3 className="text-red-400 font-bold">Error fetching projects</h3>
          <p className="text-red-300 text-sm mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-red-400 font-semibold hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-xl">
        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
          <img src="/logos/supabase.svg" alt="Supabase" className="w-8 h-8 grayscale opacity-50" />
        </div>
        <h3 className="text-white font-bold text-lg">No projects found</h3>
        <p className="text-text-secondary max-w-xs mx-auto mt-2">
          We couldn't find any projects in your Supabase account.
        </p>
        <a 
          href="https://supabase.com/dashboard" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline mt-4 inline-block font-semibold"
        >
          Create a project on Supabase
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-text-secondary uppercase tracking-wider">
          Your Supabase Projects
        </h3>
        <span className="text-xs text-text-secondary font-medium">
          {projects.length} project{projects.length !== 1 ? 's' : ''} will be connected
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-4 rounded-xl border bg-surface border-border flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center p-2 shadow-sm">
                <img src="/logos/supabase.svg" alt="Supabase" className="w-full h-full object-contain" />
              </div>
              <div>
                <h4 className="font-bold text-white">{project.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-text-secondary bg-background px-2 py-0.5 rounded border border-border">
                    {project.region}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    project.status === 'ACTIVE_HEALTHY' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Check size={18} className="text-green-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

