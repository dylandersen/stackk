const VERCEL_API_BASE = 'https://api.vercel.com';

export interface VercelUser {
  user: {
    id: string;
    email: string;
    name: string;
    username?: string;
    avatar?: string;
    defaultTeamId?: string;
    billing?: {
      plan?: string;
      period?: string;
      cancelation?: number | null;
      addons?: string[];
      trial?: {
        start: number;
        end: number;
      } | null;
    } | null;
    resourceConfig?: {
      nodeType?: string;
      concurrentBuilds?: number;
      elasticConcurrencyEnabled?: boolean;
      buildEntitlements?: {
        enhancedBuilds?: boolean;
      };
      cfZoneName?: string;
      imageOptimizationType?: string;
      edgeConfigs?: number;
      edgeConfigSize?: number;
      edgeFunctionMaxSizeBytes?: number;
      edgeFunctionExecutionTimeoutMs?: number;
      serverlessFunctionMaxMemorySize?: number;
      kvDatabases?: number;
      postgresDatabases?: number;
      blobStores?: number;
      integrationStores?: number;
      cronJobs?: number;
      cronJobsPerProject?: number;
    };
    softBlock?: {
      blockedAt?: number;
      reason?: string;
      blockedDueToOverageType?: string;
    } | null;
  };
}

export interface VercelBillingInfo {
  plan: string;
  period: string | null;
  cancelation: number | null;
  addons: string[];
  trial: {
    start: number;
    end: number;
  } | null;
}

export interface VercelUsageData {
  billing: VercelBillingInfo | null;
  resourceLimits: {
    concurrentBuilds?: number;
    edgeConfigs?: number;
    kvDatabases?: number;
    postgresDatabases?: number;
    blobStores?: number;
    integrationStores?: number;
    cronJobs?: number;
  };
  teamId: string | null;
  userId: string;
  email: string;
  name: string;
}

class VercelAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'VercelAPIError';
  }
}

/**
 * Make a request to the Vercel API with proper error handling
 */
async function vercelRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${VERCEL_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Vercel API error: ${response.status} ${response.statusText}`;
    let errorCode: string | undefined;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorData.message || errorMessage;
      errorCode = errorData.error?.code || errorData.code;
    } catch {
      // If response is not JSON, use status text
    }
    
    // Handle specific error cases
    if (response.status === 401) {
      throw new VercelAPIError('Invalid or expired API token', 401, 'unauthorized');
    }
    
    if (response.status === 403) {
      throw new VercelAPIError('API token does not have required permissions', 403, 'forbidden');
    }
    
    if (response.status === 429) {
      throw new VercelAPIError('Rate limit exceeded. Please try again later.', 429, 'rate_limit');
    }
    
    throw new VercelAPIError(errorMessage, response.status, errorCode);
  }

  return response.json();
}

/**
 * Fetch user information from Vercel API
 */
export async function getVercelUser(token: string): Promise<VercelUser> {
  return vercelRequest<VercelUser>('/v2/user', token);
}

/**
 * Extract billing information from Vercel user object
 */
export function getVercelBillingInfo(user: VercelUser): VercelBillingInfo | null {
  if (!user.user.billing) {
    return null;
  }

  const billing = user.user.billing;
  
  return {
    plan: billing.plan || 'hobby',
    period: billing.period || null,
    cancelation: billing.cancelation || null,
    addons: billing.addons || [],
    trial: billing.trial || null,
  };
}

/**
 * Get comprehensive usage data from Vercel user
 */
export async function getVercelUsageData(token: string): Promise<VercelUsageData> {
  const userData = await getVercelUser(token);
  const billing = getVercelBillingInfo(userData);
  
  const resourceConfig = userData.user.resourceConfig || {};
  
  return {
    billing,
    resourceLimits: {
      concurrentBuilds: resourceConfig.concurrentBuilds,
      edgeConfigs: resourceConfig.edgeConfigs,
      kvDatabases: resourceConfig.kvDatabases,
      postgresDatabases: resourceConfig.postgresDatabases,
      blobStores: resourceConfig.blobStores,
      integrationStores: resourceConfig.integrationStores,
      cronJobs: resourceConfig.cronJobs,
    },
    teamId: userData.user.defaultTeamId || null,
    userId: userData.user.id,
    email: userData.user.email,
    name: userData.user.name,
  };
}

/**
 * Validate a Vercel API token by attempting to fetch user data
 */
export async function validateVercelToken(token: string): Promise<boolean> {
  try {
    await getVercelUser(token);
    return true;
  } catch (error) {
    if (error instanceof VercelAPIError && error.statusCode === 401) {
      return false;
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Calculate monthly cost estimate based on plan
 * Note: Vercel's API doesn't provide exact billing amounts, so we estimate based on plan
 */
export function estimateMonthlyCost(billing: VercelBillingInfo | null): number {
  if (!billing) {
    return 0;
  }

  // Rough estimates based on Vercel pricing (as of 2024)
  const planPrices: Record<string, number> = {
    'hobby': 0, // Vercel's free plan is called "Hobby"
    'pro': 20,
    'enterprise': 0, // Custom pricing
  };

  const basePrice = planPrices[billing.plan] || 0;
  
  // Add-ons would add to the cost, but we don't have exact pricing
  // For now, just return the base plan price
  return basePrice;
}

export { VercelAPIError };

// Project and Deployment interfaces
export interface VercelProject {
  id: string;
  name: string;
  accountId: string;
  framework?: string;
  createdAt: number;
  updatedAt: number;
  latestDeployments?: Array<{
    id: string;
    url?: string;
    state?: string;
    createdAt: number;
  }>;
  analytics?: {
    id: string;
    enabledAt?: number;
    disabledAt?: number;
  };
  speedInsights?: {
    id: string;
    enabledAt?: number;
  };
}

export interface VercelProjectsResponse {
  projects: VercelProject[];
  pagination?: {
    count: number;
    next?: string;
  };
}

export interface VercelDeployment {
  uid: string;
  name: string;
  projectId: string;
  url?: string;
  state: string;
  readyState: string;
  createdAt: number;
  buildingAt?: number;
  ready?: number;
  creator?: {
    email?: string;
    username?: string;
    uid?: string;
  };
  target?: string;
  type?: string;
}

export interface VercelDeploymentsResponse {
  deployments: VercelDeployment[];
  pagination?: {
    count: number;
    next?: number;
    prev?: number;
  };
}

/**
 * Fetch all projects from Vercel API
 */
export async function getVercelProjects(
  token: string,
  teamId?: string
): Promise<VercelProjectsResponse> {
  const endpoint = teamId 
    ? `/v9/projects?teamId=${teamId}`
    : '/v9/projects';
  return vercelRequest<VercelProjectsResponse>(endpoint, token);
}

/**
 * Get detailed project information
 */
export async function getVercelProjectDetails(
  token: string,
  projectId: string,
  teamId?: string
): Promise<VercelProject> {
  const endpoint = teamId
    ? `/v9/projects/${projectId}?teamId=${teamId}`
    : `/v9/projects/${projectId}`;
  return vercelRequest<VercelProject>(endpoint, token);
}

/**
 * Fetch deployments from Vercel API
 */
export async function getVercelDeployments(
  token: string,
  options: {
    projectId?: string;
    teamId?: string;
    limit?: number;
    since?: number;
    until?: number;
    state?: string;
  } = {}
): Promise<VercelDeploymentsResponse> {
  const params = new URLSearchParams();
  
  if (options.projectId) {
    params.append('projectId', options.projectId);
  }
  if (options.teamId) {
    params.append('teamId', options.teamId);
  }
  if (options.limit) {
    params.append('limit', options.limit.toString());
  }
  if (options.since) {
    params.append('since', options.since.toString());
  }
  if (options.until) {
    params.append('until', options.until.toString());
  }
  if (options.state) {
    params.append('state', options.state);
  }

  const queryString = params.toString();
  const endpoint = queryString 
    ? `/v6/deployments?${queryString}`
    : '/v6/deployments';
    
  return vercelRequest<VercelDeploymentsResponse>(endpoint, token);
}

/**
 * Get deployments for a specific project
 */
export async function getVercelProjectDeployments(
  token: string,
  projectId: string,
  limit: number = 50
): Promise<VercelDeploymentsResponse> {
  return getVercelDeployments(token, { projectId, limit });
}

