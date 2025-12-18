'use client';

import React from 'react';
import { ExternalLink, Database, Cpu, HardDrive, Key } from 'lucide-react';

interface SupabaseProjectInfoProps {
  project: any;
  organization: any;
}

export default function SupabaseProjectInfo({ project, organization }: SupabaseProjectInfoProps) {
  if (!project) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <div className="lg:col-span-2 space-y-6">
        <section className="relative bg-surface border border-border rounded-card p-6 md:p-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-white text-lg md:text-xl font-secondary">Project Configuration</h2>
              <a 
                href={`https://supabase.com/dashboard/project/${project.ref}/settings/general`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-medium text-primary hover:underline"
              >
                View on Supabase <ExternalLink size={12} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-white/5 border border-border">
                  <Database size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">Database Host</p>
                  <p className="text-sm font-mono text-white truncate max-w-[200px]">{project.database?.host || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-white/5 border border-border">
                  <Key size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">Project Ref</p>
                  <p className="text-sm font-mono text-white">{project.ref}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-white/5 border border-border">
                  <Cpu size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">Postgres Version</p>
                  <p className="text-sm text-white">{project.database?.version || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-white/5 border border-border">
                  <HardDrive size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">Region</p>
                  <p className="text-sm text-white">{project.region}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="relative bg-surface border border-border rounded-card p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="font-bold text-white text-lg mb-4 font-secondary">Organization</h2>
            {organization ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">Name</p>
                  <p className="text-base font-bold text-white">{organization.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">Billing Email</p>
                  <p className="text-sm text-white">{organization.billing_email}</p>
                </div>
                <div className="pt-2">
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                    {project.status === 'ACTIVE_HEALTHY' ? 'Active' : 'Maintenance'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary italic">Organization details not available</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

