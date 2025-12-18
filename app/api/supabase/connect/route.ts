import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseProjectDetails, validateSupabaseToken } from '@/lib/supabase-api';
import { decrypt } from '@/lib/encryption';
import { createSlug } from '@/utils/slug';

export async function POST(request: NextRequest) {
  try {
    const { projects, userId } = await request.json(); // Now receives array of projects

    console.log('[Supabase Connect] Request received', { projectCount: projects?.length, userId });

    if (!projects || !Array.isArray(projects) || projects.length === 0 || !userId) {
      return NextResponse.json(
        { error: 'Projects array and User ID are required' },
        { status: 400 }
      );
    }

    // Get tokens from temporary cookies
    const accessCookie = request.cookies.get('sb_temp_access')?.value;
    const refreshCookie = request.cookies.get('sb_temp_refresh')?.value;

    console.log('[Supabase Connect] Cookie check', { 
      hasAccessCookie: !!accessCookie, 
      hasRefreshCookie: !!refreshCookie 
    });

    if (!accessCookie || !refreshCookie) {
      console.error('[Supabase Connect] Missing cookies');
      return NextResponse.json(
        { error: 'Session expired. Please restart the connection process.' },
        { status: 401 }
      );
    }

    // Decrypt tokens
    const accessToken = decrypt(accessCookie);
    const refreshToken = decrypt(refreshCookie);

    // Fetch details for all projects
    console.log('[Supabase Connect] Fetching details for', projects.length, 'project(s)...');
    const projectDetailsList = [];
    for (const project of projects) {
      const details = await getSupabaseProjectDetails(accessToken, project.ref);
      projectDetailsList.push({
        id: project.id,
        ref: project.ref,
        name: project.name,
        organizationId: project.organization_id,
        region: details.region,
        status: details.status,
        createdAt: details.created_at,
      });
    }
    console.log('[Supabase Connect] All project details fetched');

    // Create a single Supabase service with all projects
    const slug = createSlug('supabase');
    const firstProject = projectDetailsList[0];

    // Prepare service data for Stackk
    const serviceData: any = {
      name: 'Supabase',
      category: 'Database',
      price: 0, // Will be updated during sync/data fetch
      currency: '$',
      billingCycle: 'monthly',
      nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      color: '#2A8A5F', // Supabase Green (muted for better contrast)
      logo: '/logos/supabase.svg',
      status: 'active',
      connected: true,
      slug,
      userId,
      createdAt: new Date().toISOString(),
      // Supabase-specific fields
      supabaseTokenHash: accessCookie, // Already encrypted in the cookie
      supabaseRefreshTokenHash: refreshCookie, // Already encrypted in the cookie
      supabaseProjects: JSON.stringify(projectDetailsList), // Store all projects as JSON array
      supabaseOrganizationId: firstProject.organizationId,
      supabaseConnectedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      // Initial metrics
      usageMetric: 'Database Size',
      usageUnit: 'MB',
      usageCurrent: 0,
    };

    console.log('[Supabase Connect] Service data prepared:', { 
      name: serviceData.name, 
      slug: serviceData.slug,
      projectCount: projectDetailsList.length,
      userId: serviceData.userId 
    });

    // Clean up temporary cookies
    const response = NextResponse.json({
      success: true,
      service: serviceData,
      projects: projectDetailsList,
    });

    response.cookies.delete('sb_temp_access');
    response.cookies.delete('sb_temp_refresh');

    console.log('[Supabase Connect] Success! Returning service data');
    return response;
  } catch (error: any) {
    console.error('[Supabase Connect] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect Supabase project' },
      { status: 500 }
    );
  }
}

