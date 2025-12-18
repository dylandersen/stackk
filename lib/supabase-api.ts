const SUPABASE_API_BASE = 'https://api.supabase.com/v1';

export interface SupabaseProject {
  id: string;
  ref: string;
  name: string;
  organization_id: string;
  region: string;
  created_at: string;
  status: string;
  plan?: string; // Plan name (free, pro, team, enterprise)
  plan_id?: string;
  billing_email?: string;
  database?: {
    host: string;
    version: string;
    port: number;
  };
}

export interface SupabaseOrganization {
  id: string;
  slug: string;
  name: string;
  billing_email: string;
  created_at: string;
}

export interface SupabaseBillingAddon {
  variant: {
    identifier: string;
    name: string;
    price_description: string;
  };
  name: string;
  type: string;
}

export interface SupabaseUsageData {
  projects: SupabaseProject[];
  organizations: SupabaseOrganization[];
  selectedProject?: SupabaseProject;
  billing?: {
    plan: string;
  };
}

export class SupabaseAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'SupabaseAPIError';
  }
}

/**
 * Make a request to the Supabase Management API
 */
async function supabaseRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${SUPABASE_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Supabase API error: ${response.status} ${response.statusText}`;
    let errorCode: string | undefined;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      errorCode = errorData.code;
    } catch {
      // If response is not JSON
    }
    
    if (response.status === 401) {
      throw new SupabaseAPIError('Invalid or expired Supabase access token', 401, 'unauthorized');
    }
    
    throw new SupabaseAPIError(errorMessage, response.status, errorCode);
  }

  return response.json();
}

/**
 * Fetch all projects accessible to the user
 */
export async function getSupabaseProjects(token: string): Promise<SupabaseProject[]> {
  return supabaseRequest<SupabaseProject[]>('/projects', token);
}

/**
 * Fetch details for a specific project
 */
export async function getSupabaseProjectDetails(
  token: string,
  projectRef: string
): Promise<SupabaseProject> {
  return supabaseRequest<SupabaseProject>(`/projects/${projectRef}`, token);
}

/**
 * Fetch all organizations the user belongs to
 */
export async function getSupabaseOrganizations(token: string): Promise<SupabaseOrganization[]> {
  return supabaseRequest<SupabaseOrganization[]>('/organizations', token);
}

/**
 * Fetch billing information for a project
 */
export async function getSupabaseProjectBilling(
  token: string,
  projectRef: string
): Promise<any> {
  try {
    return await supabaseRequest<any>(`/projects/${projectRef}/billing`, token);
  } catch (error) {
    // Billing endpoint might not be available for all projects
    console.warn('Failed to fetch billing info:', error);
    return null;
  }
}

/**
 * Fetch billing addons for a project
 */
export async function getSupabaseBillingAddons(
  token: string,
  projectRef: string
): Promise<SupabaseBillingAddon[]> {
  try {
    return await supabaseRequest<SupabaseBillingAddon[]>(`/projects/${projectRef}/billing/addons`, token);
  } catch (error) {
    console.warn('Failed to fetch billing addons:', error);
    return [];
  }
}

export interface SupabaseEdgeFunction {
  id: string;
  slug: string;
  name: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
  verify_jwt: boolean;
}

/**
 * Fetch Edge Functions for a project
 */
export async function getSupabaseEdgeFunctions(
  token: string,
  projectRef: string
): Promise<SupabaseEdgeFunction[]> {
  try {
    return await supabaseRequest<SupabaseEdgeFunction[]>(`/projects/${projectRef}/functions`, token);
  } catch (error) {
    console.warn('Failed to fetch edge functions:', error);
    return [];
  }
}

export interface SupabaseStorageBucket {
  id: string;
  name: string;
  public: boolean;
  file_size_limit?: number;
  allowed_mime_types?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Fetch Storage Buckets for a project
 */
export async function getSupabaseStorageBuckets(
  token: string,
  projectRef: string
): Promise<SupabaseStorageBucket[]> {
  try {
    return await supabaseRequest<SupabaseStorageBucket[]>(`/projects/${projectRef}/storage/buckets`, token);
  } catch (error) {
    console.warn('Failed to fetch storage buckets:', error);
    return [];
  }
}

export interface SupabaseBranch {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  git_branch?: string;
  parent_project_ref?: string;
}

/**
 * Fetch Database Branches for a project
 */
export async function getSupabaseBranches(
  token: string,
  projectRef: string
): Promise<SupabaseBranch[]> {
  try {
    return await supabaseRequest<SupabaseBranch[]>(`/projects/${projectRef}/branches`, token);
  } catch (error) {
    console.warn('Failed to fetch branches:', error);
    return [];
  }
}

/**
 * Validate a Supabase token by fetching organizations
 */
export async function validateSupabaseToken(token: string): Promise<boolean> {
  try {
    await getSupabaseOrganizations(token);
    return true;
  } catch (error) {
    if (error instanceof SupabaseAPIError && error.statusCode === 401) {
      return false;
    }
    throw error;
  }
}

/**
 * Exchange OAuth code for tokens
 */
export async function exchangeSupabaseCode(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}> {
  const clientId = process.env.SUPABASE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.SUPABASE_OAUTH_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error('Supabase OAuth credentials not configured');
  }

  const response = await fetch('https://api.supabase.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new SupabaseAPIError(
      errorData.message || 'Failed to exchange Supabase OAuth code',
      response.status
    );
  }

  return response.json();
}

/**
 * Refresh an expired Supabase access token
 */
export async function refreshSupabaseToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}> {
  const clientId = process.env.SUPABASE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.SUPABASE_OAUTH_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error('Supabase OAuth credentials not configured');
  }

  const response = await fetch('https://api.supabase.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new SupabaseAPIError(
      errorData.message || 'Failed to refresh Supabase token',
      response.status
    );
  }

  return response.json();
}

/**
 * Revoke Supabase OAuth tokens
 */
export async function revokeSupabaseToken(refreshToken: string): Promise<void> {
  const clientId = process.env.SUPABASE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.SUPABASE_OAUTH_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error('Supabase OAuth credentials not configured');
  }

  const response = await fetch('https://api.supabase.com/v1/oauth/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.warn('Failed to revoke Supabase token:', errorData.message || response.statusText);
  }
}

