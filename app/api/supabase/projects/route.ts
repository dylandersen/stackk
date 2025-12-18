import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseProjects } from '@/lib/supabase-api';
import { decrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  const accessCookie = request.cookies.get('sb_temp_access')?.value;
  
  console.log('[Supabase Projects API] Request received', {
    hasCookie: !!accessCookie,
    cookieLength: accessCookie?.length,
    allCookies: Object.keys(request.cookies.getAll().reduce((acc, c) => ({ ...acc, [c.name]: true }), {}))
  });
  
  if (!accessCookie) {
    console.error('[Supabase Projects API] No access cookie found');
    return NextResponse.json(
      { error: 'Session expired. Please restart the Supabase connection process.' },
      { status: 401 }
    );
  }

  try {
    // Decrypt the access token from the temporary cookie
    const accessToken = decrypt(accessCookie);
    console.log('[Supabase Projects API] Decrypted token, fetching projects...');
    
    // Fetch projects from Supabase Management API
    const projects = await getSupabaseProjects(accessToken);
    console.log('[Supabase Projects API] Successfully fetched projects:', projects.length);
    
    return NextResponse.json({ projects });
  } catch (err: any) {
    console.error('[Supabase Projects API] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch Supabase projects' },
      { status: 500 }
    );
  }
}

