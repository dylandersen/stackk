import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const clientId = process.env.SUPABASE_OAUTH_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: 'Supabase OAuth credentials not configured on the server. Please check your environment variables.' },
      { status: 500 }
    );
  }

  // Dynamically determine redirect URI from the request origin
  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/supabase/oauth/callback`;

  // PKCE: Generate code verifier (unguessable random string)
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  
  // PKCE: Generate code challenge (S256 hash of the verifier)
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // State: To prevent CSRF attacks
  const state = crypto.randomBytes(16).toString('hex');

  // Construct Supabase OAuth authorize URL
  const supabaseAuthUrl = new URL('https://api.supabase.com/v1/oauth/authorize');
  supabaseAuthUrl.searchParams.append('client_id', clientId);
  supabaseAuthUrl.searchParams.append('redirect_uri', redirectUri);
  supabaseAuthUrl.searchParams.append('response_type', 'code');
  supabaseAuthUrl.searchParams.append('code_challenge', codeChallenge);
  supabaseAuthUrl.searchParams.append('code_challenge_method', 'S256');
  supabaseAuthUrl.searchParams.append('state', state);

  // Set cookies and redirect
  const response = NextResponse.redirect(supabaseAuthUrl.toString());
  
  // Store code_verifier and state in secure, httpOnly cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 600, // 10 minutes
    path: '/',
  };

  response.cookies.set('supabase_oauth_code_verifier', codeVerifier, cookieOptions);
  response.cookies.set('supabase_oauth_state', state, cookieOptions);

  return response;
}

