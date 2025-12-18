import { NextRequest, NextResponse } from 'next/server';
import { exchangeSupabaseCode } from '@/lib/supabase-api';
import { encrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('Supabase OAuth Error:', error, errorDescription);
    return NextResponse.redirect(new URL(`/services?error=${encodeURIComponent(errorDescription || error)}`, request.url));
  }

  // Verify state to prevent CSRF
  const savedState = request.cookies.get('supabase_oauth_state')?.value;
  if (!state || state !== savedState) {
    console.error('Supabase OAuth State Mismatch');
    return NextResponse.redirect(new URL('/services?error=invalid_state', request.url));
  }

  // Get code verifier for PKCE exchange
  const codeVerifier = request.cookies.get('supabase_oauth_code_verifier')?.value;
  if (!code || !codeVerifier) {
    console.error('Supabase OAuth Missing Code or Verifier');
    return NextResponse.redirect(new URL('/services?error=missing_auth_data', request.url));
  }

  try {
    // Dynamically determine redirect URI from the request origin
    const origin = request.nextUrl.origin;
    const redirectUri = `${origin}/api/supabase/oauth/callback`;

    console.log('[Supabase OAuth] Exchanging code for tokens...', { origin, redirectUri });

    // Exchange authorization code for access and refresh tokens
    const tokens = await exchangeSupabaseCode(code, codeVerifier, redirectUri);
    
    console.log('[Supabase OAuth] Token exchange successful');
    
    // Encrypt tokens before storing in temporary cookies
    const encryptedAccess = encrypt(tokens.access_token);
    const encryptedRefresh = encrypt(tokens.refresh_token);
    
    // Redirect to the project selection UI
    // We'll use a specific route for selecting a Supabase project
    const response = NextResponse.redirect(new URL('/services/add/supabase/select', request.url));
    
    // Clear temporary OAuth cookies
    response.cookies.delete('supabase_oauth_state');
    response.cookies.delete('supabase_oauth_code_verifier');
    
    // Set temporary token cookies for the selection process (1 hour expiry)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 3600, // 1 hour
      path: '/',
    };
    
    response.cookies.set('sb_temp_access', encryptedAccess, cookieOptions);
    response.cookies.set('sb_temp_refresh', encryptedRefresh, cookieOptions);
    
    return response;
  } catch (err: any) {
    console.error('[Supabase OAuth] Token Exchange Error:', err);
    const errorMessage = err.message || 'Failed to connect Supabase';
    console.error('[Supabase OAuth] Redirecting to error page with:', errorMessage);
    return NextResponse.redirect(new URL(`/services?error=${encodeURIComponent(errorMessage)}`, request.url));
  }
}

