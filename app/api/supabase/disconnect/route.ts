import { NextRequest, NextResponse } from 'next/server';
import { revokeSupabaseToken } from '@/lib/supabase-api';
import { decrypt } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  try {
    const { serviceId, encryptedRefreshToken } = await request.json();

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    if (encryptedRefreshToken) {
      try {
        const refreshToken = decrypt(encryptedRefreshToken);
        await revokeSupabaseToken(refreshToken);
      } catch (error) {
        console.warn('Failed to revoke Supabase token during disconnect:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase service disconnected successfully'
    });
  } catch (error: any) {
    console.error('Error disconnecting Supabase:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to disconnect Supabase service' 
    }, { status: 500 });
  }
}

