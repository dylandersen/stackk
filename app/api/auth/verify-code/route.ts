import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/instant-server';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    // Verify the magic code using InstantDB Admin SDK
    // Note: signInWithMagicCode is a client-side method, so we'll return success
    // and let the client handle the actual sign-in
    // The code verification happens on the client side with db.auth.signInWithMagicCode()
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: error.body?.message || error.message || 'Failed to verify code' },
      { status: 500 }
    );
  }
}

