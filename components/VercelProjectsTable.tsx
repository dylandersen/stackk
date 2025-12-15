'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  framework?: string;
  createdAt: number;
  updatedAt: number;
  latestDeployment?: {
    id: string;
    url?: string;
    state?: string;
    createdAt: number;
  };
  deploymentCount?: number;
}

interface VercelProjectsTableProps {
  projects: Project[];
  deployments?: Array<{
    uid: string;
    name: string;
    projectId: string;
    url?: string;
    state: string;
    readyState: string;
    createdAt: number;
    creator?: {
      email?: string;
      username?: string;
    };
  }>;
}

type SortField = 'name' | 'framework' | 'deployments' | 'updated' | 'created';
type SortDirection = 'asc' | 'desc';

export default function VercelProjectsTable({ projects, deployments = [] }: VercelProjectsTableProps) {
  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'framework':
          aValue = (a.framework || 'unknown').toLowerCase();
          bValue = (b.framework || 'unknown').toLowerCase();
          break;
        case 'deployments':
          aValue = a.deploymentCount || 0;
          bValue = b.deploymentCount || 0;
          break;
        case 'updated':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        case 'created':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [projects, sortField, sortDirection]);

  const getProjectDeployments = (projectId: string) => {
    return deployments
      .filter(d => d.projectId === projectId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10); // Show recent 10
  };

  const getStatusColor = (state?: string) => {
    if (!state) return 'text-text-secondary';
    if (state === 'READY') return 'text-green-400';
    if (state === 'ERROR' || state === 'CANCELED') return 'text-red-400';
    if (state === 'BUILDING') return 'text-yellow-400';
    return 'text-text-secondary';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-text-secondary" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp size={14} className="text-white" />
      : <ArrowDown size={14} className="text-white" />;
  };

  if (projects.length === 0) {
    return (
      <div className="relative bg-surface border border-border rounded-card p-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 text-text-secondary">
          <p>No projects found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-surface border border-border rounded-card overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative z-10 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider hover:text-white transition-colors"
                >
                  Project Name
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('framework')}
                  className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider hover:text-white transition-colors"
                >
                  Framework
                  <SortIcon field="framework" />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('deployments')}
                  className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider hover:text-white transition-colors"
                >
                  Deployments
                  <SortIcon field="deployments" />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('updated')}
                  className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider hover:text-white transition-colors"
                >
                  Last Updated
                  <SortIcon field="updated" />
                </button>
              </th>
              <th className="text-left p-4">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Latest Deployment
                </span>
              </th>
              <th className="text-left p-4">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map((project, index) => {
              const projectDeployments = getProjectDeployments(project.id);
              const isExpanded = expandedProject === project.id;

              return (
                <React.Fragment key={project.id}>
                  <tr 
                    className={`border-b border-border hover:bg-white/5 transition-colors ${
                      index % 2 === 0 ? 'bg-surface' : 'bg-surface/50'
                    }`}
                  >
                    <td className="p-4">
                      <button
                        onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                        className="flex items-center gap-2 text-white font-medium hover:text-primary transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                        {project.name}
                      </button>
                    </td>
                    <td className="p-4">
                      <span className="text-text-secondary text-sm">
                        {project.framework ? (
                          <span className="px-2 py-1 bg-background rounded text-xs font-mono">
                            {project.framework}
                          </span>
                        ) : (
                          'Unknown'
                        )}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium">
                        {project.deploymentCount || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-text-secondary text-sm">
                        {new Date(project.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="p-4">
                      {project.latestDeployment ? (
                        <div className="flex flex-col gap-1">
                          <span className={`text-sm font-medium ${getStatusColor(project.latestDeployment.state)}`}>
                            {project.latestDeployment.state || 'Unknown'}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {new Date(project.latestDeployment.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-secondary text-sm">No deployments</span>
                      )}
                    </td>
                    <td className="p-4">
                      {project.latestDeployment?.url && (
                        <a
                          href={`https://${project.latestDeployment.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:text-primary-hover transition-colors text-sm"
                        >
                          View
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </td>
                  </tr>
                  {isExpanded && projectDeployments.length > 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 bg-background/50">
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-white mb-3">Recent Deployments</h4>
                          <div className="space-y-1">
                            {projectDeployments.map((deployment) => (
                              <div
                                key={deployment.uid}
                                className="flex items-center justify-between p-2 bg-surface rounded border border-border"
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`text-xs font-medium ${getStatusColor(deployment.state)}`}>
                                    {deployment.state}
                                  </span>
                                  <span className="text-xs text-text-secondary font-mono">
                                    {deployment.uid.slice(0, 8)}...
                                  </span>
                                  {deployment.url && (
                                    <a
                                      href={`https://${deployment.url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline"
                                    >
                                      {deployment.url}
                                    </a>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  {deployment.creator?.username && (
                                    <span className="text-xs text-text-secondary">
                                      by {deployment.creator.username}
                                    </span>
                                  )}
                                  <span className="text-xs text-text-secondary">
                                    {new Date(deployment.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

