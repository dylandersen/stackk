'use client';

import React from 'react';
import { Database, Globe, Activity, ExternalLink } from 'lucide-react';

interface SupabaseProject {
  id: string;
  ref: string;
  name: string;
  organizationId: string;
  region: string;
  status: string;
  createdAt: string;
}

interface SupabaseProjectsListProps {
  projects: SupabaseProject[];
}

export default function SupabaseProjectsList({ projects }: SupabaseProjectsListProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-xl">
        <p className="text-text-secondary">No projects connected</p>
      </div>
    );
  }

  return (
    <section className="relative bg-surface border border-border rounded-card p-6 md:p-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Database size={20} className="text-green-400" />
            <h2 className="font-bold text-white text-lg md:text-xl font-secondary">Connected Projects</h2>
          </div>
          <span className="text-xs text-text-secondary font-medium">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-5 rounded-xl bg-background border border-border hover:border-green-500/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-2 shadow-sm flex-shrink-0">
                    <img src="/logos/supabase.svg" alt="Supabase" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base mb-1 truncate group-hover:text-green-400 transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-text-secondary bg-surface px-2 py-0.5 rounded border border-border flex items-center gap-1">
                        <Globe size={12} />
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
                <a
                  href={`https://supabase.com/dashboard/project/${project.ref}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-surface border border-border hover:border-green-500/30 text-text-secondary hover:text-green-400 transition-all flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={14} />
                </a>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-text-secondary">
                <div className="flex items-center gap-1">
                  <Activity size={12} />
                  <span>Created {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

