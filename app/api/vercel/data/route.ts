import { NextRequest, NextResponse } from 'next/server';
import { 
  getVercelProjects, 
  getVercelDeployments, 
  getVercelBillingInfo,
  getVercelUser,
  VercelAPIError 
} from '@/lib/vercel-api';
import { decrypt } from '@/lib/encryption';

export interface VercelDataResponse {
  projects: Array<{
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
  }>;
  deployments: Array<{
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
  statistics: {
    totalProjects: number;
    totalDeployments: number;
    deploymentsByStatus: Record<string, number>;
    deploymentsByProject: Record<string, number>;
    deploymentFrequency: Array<{ date: string; count: number }>;
    frameworkDistribution: Record<string, number>;
    successfulDeployments: number;
    failedDeployments: number;
    activeProjects: number;
  };
}

export async function POST(request: NextRequest) {
  let serviceId: string | undefined;
  let encryptedToken: string | undefined;
  let teamId: string | undefined;
  let limit: number = 100; // Default limit for deployments
  
  try {
    const body = await request.json();
    serviceId = body.serviceId;
    encryptedToken = body.encryptedToken;
    teamId = body.teamId;
    limit = body.limit || 100;
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  if (!serviceId || typeof serviceId !== 'string') {
    return NextResponse.json(
      { error: 'Service ID is required' },
      { status: 400 }
    );
  }

  if (!encryptedToken || typeof encryptedToken !== 'string') {
    return NextResponse.json(
      { error: 'Encrypted token is required' },
      { status: 400 }
    );
  }

  try {
    // Decrypt the token
    let token: string;
    try {
      token = decrypt(encryptedToken);
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to decrypt token. Please reconnect your Vercel account.' },
        { status: 400 }
      );
    }

    // Fetch user info to get plan
    const userData = await getVercelUser(token);
    const billingInfo = getVercelBillingInfo(userData);
    const plan = billingInfo?.plan || 'hobby';

    // Fetch projects
    const projectsResponse = await getVercelProjects(token, teamId);
    const projects = projectsResponse.projects || [];

    // Fetch deployments (paginated, recent first)
    const deploymentsResponse = await getVercelDeployments(token, {
      teamId,
      limit,
    });
    const deployments = deploymentsResponse.deployments || [];

    // Aggregate statistics
    const deploymentsByStatus: Record<string, number> = {};
    const deploymentsByProject: Record<string, number> = {};
    const frameworkDistribution: Record<string, number> = {};
    const deploymentFrequencyMap: Record<string, number> = {};
    
    let successfulDeployments = 0;
    let failedDeployments = 0;
    const activeProjectIds = new Set<string>();

    // Process deployments
    deployments.forEach((deployment) => {
      // Count by status
      const state = deployment.state || 'UNKNOWN';
      deploymentsByStatus[state] = (deploymentsByStatus[state] || 0) + 1;
      
      // Count by project
      if (deployment.projectId) {
        deploymentsByProject[deployment.projectId] = 
          (deploymentsByProject[deployment.projectId] || 0) + 1;
        activeProjectIds.add(deployment.projectId);
      }

      // Count successful vs failed
      if (state === 'READY' || deployment.readyState === 'READY') {
        successfulDeployments++;
      } else if (state === 'ERROR' || state === 'CANCELED') {
        failedDeployments++;
      }

      // Group by date for frequency chart
      if (deployment.createdAt) {
        const date = new Date(deployment.createdAt);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        deploymentFrequencyMap[dateKey] = (deploymentFrequencyMap[dateKey] || 0) + 1;
      }
    });

    // Process projects for framework distribution
    projects.forEach((project) => {
      const framework = project.framework || 'unknown';
      frameworkDistribution[framework] = (frameworkDistribution[framework] || 0) + 1;
    });

    // Convert deployment frequency map to array and sort by date
    const deploymentFrequency = Object.entries(deploymentFrequencyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days

    // Enhance projects with deployment counts
    const enhancedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      framework: project.framework,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      latestDeployment: project.latestDeployments?.[0] ? {
        id: project.latestDeployments[0].id,
        url: project.latestDeployments[0].url,
        state: project.latestDeployments[0].state,
        createdAt: project.latestDeployments[0].createdAt,
      } : undefined,
      deploymentCount: deploymentsByProject[project.id] || 0,
    }));

    // Format deployments for response
    const formattedDeployments = deployments.map((deployment) => ({
      uid: deployment.uid,
      name: deployment.name,
      projectId: deployment.projectId,
      url: deployment.url,
      state: deployment.state,
      readyState: deployment.readyState,
      createdAt: deployment.createdAt,
      creator: deployment.creator,
    }));

    const response: VercelDataResponse = {
      projects: enhancedProjects,
      deployments: formattedDeployments,
      statistics: {
        totalProjects: projects.length,
        totalDeployments: deployments.length,
        deploymentsByStatus,
        deploymentsByProject,
        deploymentFrequency,
        frameworkDistribution,
        successfulDeployments,
        failedDeployments,
        activeProjects: activeProjectIds.size,
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
      plan: plan, // Include plan in response
    });
  } catch (error) {
    console.error('Error fetching Vercel data:', error);
    
    if (error instanceof VercelAPIError) {
      return NextResponse.json(
        { 
          error: error.statusCode === 401 
            ? 'Invalid or expired API token. Please reconnect your Vercel account.'
            : error.message
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch Vercel data'
      },
      { status: 500 }
    );
  }
}

