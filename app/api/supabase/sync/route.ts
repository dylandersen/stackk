import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseProjectDetails, refreshSupabaseToken, SupabaseAPIError } from '@/lib/supabase-api';
import { decrypt, encrypt } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  let serviceId: string | undefined;
  let encryptedToken: string | undefined;
  let encryptedRefreshToken: string | undefined;
  let projectRef: string | undefined;
  
  try {
    const body = await request.json();
    serviceId = body.serviceId;
    encryptedToken = body.encryptedToken;
    encryptedRefreshToken = body.encryptedRefreshToken;
    projectRef = body.projectRef;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!serviceId || !encryptedToken || !projectRef) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    let accessToken = decrypt(encryptedToken);
    let projectDetails;
    let newTokens;

    try {
      projectDetails = await getSupabaseProjectDetails(accessToken, projectRef);
    } catch (error: any) {
      if (error instanceof SupabaseAPIError && error.statusCode === 401 && encryptedRefreshToken) {
        const refreshToken = decrypt(encryptedRefreshToken);
        const tokens = await refreshSupabaseToken(refreshToken);
        accessToken = tokens.access_token;
        newTokens = {
          accessToken: encrypt(tokens.access_token),
          refreshToken: encrypt(tokens.refresh_token)
        };
        projectDetails = await getSupabaseProjectDetails(accessToken, projectRef);
      } else {
        throw error;
      }
    }

    // Prepare updates for InstantDB
    const updates: any = {
      lastSyncedAt: new Date().toISOString(),
      status: projectDetails.status === 'ACTIVE_HEALTHY' ? 'active' : 'paused',
    };

    if (newTokens) {
      updates.supabaseTokenHash = newTokens.accessToken;
      updates.supabaseRefreshTokenHash = newTokens.refreshToken;
    }

    return NextResponse.json({
      success: true,
      updates,
    });

  } catch (error: any) {
    console.error('Error syncing Supabase:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to sync Supabase data' 
    }, { status: error.statusCode || 500 });
  }
}

