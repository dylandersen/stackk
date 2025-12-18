import { NextRequest, NextResponse } from 'next/server';
import { 
  getSupabaseProjectDetails, 
  getSupabaseOrganizations,
  getSupabaseProjectBilling,
  getSupabaseBillingAddons,
  getSupabaseEdgeFunctions,
  getSupabaseStorageBuckets,
  getSupabaseBranches,
  refreshSupabaseToken,
  SupabaseAPIError 
} from '@/lib/supabase-api';
import { decrypt, encrypt } from '@/lib/encryption';

export interface SupabaseDataResponse {
  projects: any[]; // All projects
  project: any; // Primary project (backward compatibility)
  organization: any;
  statistics: {
    status: string;
    region: string;
    version?: string;
    createdAt: string;
  };
  billing: {
    plan: string;
    addons?: any[];
    billingInfo?: any;
  };
  edgeFunctions?: any[];
  storageBuckets?: any[];
  branches?: any[];
}

export async function POST(request: NextRequest) {
  let serviceId: string | undefined;
  let encryptedToken: string | undefined;
  let encryptedRefreshToken: string | undefined;
  let projectRefs: string[] | undefined;
  
  try {
    const body = await request.json();
    serviceId = body.serviceId;
    encryptedToken = body.encryptedToken;
    encryptedRefreshToken = body.encryptedRefreshToken;
    // Support both single projectRef (legacy) and multiple projectRefs
    projectRefs = body.projectRefs || (body.projectRef ? [body.projectRef] : undefined);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!serviceId || !encryptedToken || !projectRefs || projectRefs.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Decrypt the token
    let accessToken: string;
    try {
      accessToken = decrypt(encryptedToken);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to decrypt token' }, { status: 400 });
    }

    let projectDetailsList: any[] = [];
    let organizations;
    let billingInfo;
    let billingAddons: any[] = [];
    let edgeFunctions: any[] = [];
    let storageBuckets: any[] = [];
    let branches: any[] = [];

    try {
      // Fetch data for all projects
      organizations = await getSupabaseOrganizations(accessToken);
      
      // Fetch details for each project
      for (const projectRef of projectRefs) {
        const details = await getSupabaseProjectDetails(accessToken, projectRef);
        projectDetailsList.push(details);
      }
      
      // Fetch additional data from the first project (aggregate across all projects if needed)
      if (projectRefs.length > 0) {
        const primaryProjectRef = projectRefs[0];
        
        // Fetch billing info
        billingInfo = await getSupabaseProjectBilling(accessToken, primaryProjectRef);
        
        // Fetch billing addons
        try {
          billingAddons = await getSupabaseBillingAddons(accessToken, primaryProjectRef);
        } catch (error) {
          console.warn('[Supabase Data] Failed to fetch billing addons:', error);
        }
        
        // Fetch edge functions (aggregate across all projects)
        const allFunctions: any[] = [];
        for (const projectRef of projectRefs) {
          try {
            const functions = await getSupabaseEdgeFunctions(accessToken, projectRef);
            allFunctions.push(...functions.map(f => ({ ...f, projectRef })));
          } catch (error) {
            console.warn(`[Supabase Data] Failed to fetch functions for ${projectRef}:`, error);
          }
        }
        edgeFunctions = allFunctions;
        
        // Fetch storage buckets (aggregate across all projects)
        const allBuckets: any[] = [];
        for (const projectRef of projectRefs) {
          try {
            const buckets = await getSupabaseStorageBuckets(accessToken, projectRef);
            allBuckets.push(...buckets.map(b => ({ ...b, projectRef })));
          } catch (error) {
            console.warn(`[Supabase Data] Failed to fetch buckets for ${projectRef}:`, error);
          }
        }
        storageBuckets = allBuckets;
        
        // Fetch branches (aggregate across all projects)
        const allBranches: any[] = [];
        for (const projectRef of projectRefs) {
          try {
            const projectBranches = await getSupabaseBranches(accessToken, projectRef);
            allBranches.push(...projectBranches.map(b => ({ ...b, projectRef })));
          } catch (error) {
            console.warn(`[Supabase Data] Failed to fetch branches for ${projectRef}:`, error);
          }
        }
        branches = allBranches;
      }
      
      console.log('[Supabase Data] Fetched', projectDetailsList.length, 'project(s) with additional data');
    } catch (error: any) {
      // If unauthorized, try to refresh the token
      if (error instanceof SupabaseAPIError && error.statusCode === 401 && encryptedRefreshToken) {
        try {
          const refreshToken = decrypt(encryptedRefreshToken);
          const newTokens = await refreshSupabaseToken(refreshToken);
          
          accessToken = newTokens.access_token;
          const newEncryptedAccess = encrypt(newTokens.access_token);
          const newEncryptedRefresh = encrypt(newTokens.refresh_token);
          
          // Re-fetch with new token
          organizations = await getSupabaseOrganizations(accessToken);
          projectDetailsList = [];
          for (const projectRef of projectRefs) {
            const details = await getSupabaseProjectDetails(accessToken, projectRef);
            projectDetailsList.push(details);
          }
          if (projectRefs.length > 0) {
            const primaryProjectRef = projectRefs[0];
            billingInfo = await getSupabaseProjectBilling(accessToken, primaryProjectRef);
            billingAddons = await getSupabaseBillingAddons(accessToken, primaryProjectRef).catch(() => []);
            
            // Re-fetch all additional data
            const allFunctions: any[] = [];
            const allBuckets: any[] = [];
            const allBranches: any[] = [];
            for (const projectRef of projectRefs) {
              const functions = await getSupabaseEdgeFunctions(accessToken, projectRef).catch(() => []);
              allFunctions.push(...functions.map(f => ({ ...f, projectRef })));
              const buckets = await getSupabaseStorageBuckets(accessToken, projectRef).catch(() => []);
              allBuckets.push(...buckets.map(b => ({ ...b, projectRef })));
              const projectBranches = await getSupabaseBranches(accessToken, projectRef).catch(() => []);
              allBranches.push(...projectBranches.map(b => ({ ...b, projectRef })));
            }
            edgeFunctions = allFunctions;
            storageBuckets = allBuckets;
            branches = allBranches;
          }
          
          // We'll return the new tokens to be saved by the client
          return NextResponse.json({
            success: true,
            data: formatResponse(projectDetailsList, organizations, billingInfo, billingAddons, edgeFunctions, storageBuckets, branches),
            newTokens: {
              accessToken: newEncryptedAccess,
              refreshToken: newEncryptedRefresh
            }
          });
        } catch (refreshError) {
          return NextResponse.json({ error: 'Session expired. Please reconnect your Supabase account.' }, { status: 401 });
        }
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: formatResponse(projectDetailsList, organizations, billingInfo, billingAddons, edgeFunctions, storageBuckets, branches)
    });

  } catch (error: any) {
    console.error('Error fetching Supabase data:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch Supabase data' 
    }, { status: error.statusCode || 500 });
  }
}

function formatResponse(
  projects: any[], 
  organizations: any[], 
  billingInfo: any = null,
  billingAddons: any[] = [],
  edgeFunctions: any[] = [],
  storageBuckets: any[] = [],
  branches: any[] = []
) {
  // Use the first project for primary display (or aggregate data)
  const primaryProject = projects[0];
  const org = organizations.find(o => o.id === primaryProject.organization_id);
  
  // Determine plan from multiple sources (in order of preference):
  // 1. Billing API response
  // 2. First project's plan field
  // 3. Default to 'Free' if no plan info found
  let plan = 'Free';
  if (billingInfo?.plan) {
    plan = billingInfo.plan;
  } else if (primaryProject.plan) {
    plan = primaryProject.plan;
  } else if (billingInfo?.variant?.identifier) {
    // Sometimes plan is in variant.identifier
    plan = billingInfo.variant.identifier;
  }
  
  // Normalize plan name (capitalize first letter)
  plan = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
  
  return {
    projects: projects, // Return all projects
    project: primaryProject, // Primary project for backward compatibility
    organization: org || null,
    statistics: {
      status: primaryProject.status,
      region: primaryProject.region,
      version: primaryProject.database?.version,
      createdAt: primaryProject.created_at,
    },
    billing: {
      plan,
      addons: billingAddons,
      billingInfo: billingInfo || null, // Store full billing info for future use
    },
    edgeFunctions: edgeFunctions,
    storageBuckets: storageBuckets,
    branches: branches,
  };
}

