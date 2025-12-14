import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/instant-server';

export async function POST(request: NextRequest) {
  try {
    const { email, redirect } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate magic code using InstantDB
    // Note: @instantdb/react's sendMagicCode sends an email but doesn't return the code.
    // To create custom magic links, we need @instantdb/admin which provides generateMagicCode.
    // 
    // For production, install @instantdb/admin:
    //   pnpm add @instantdb/admin
    // Then use db.auth.generateMagicCode({ email }) which returns the code without sending an email.
    let code: string;
    const auth = db.auth as any;
    if (typeof auth.generateMagicCode === 'function') {
      // Use generateMagicCode if available (from @instantdb/admin)
      const result = await auth.generateMagicCode({ email });
      code = result.code;
    } else {
      // sendMagicCode doesn't return the code, so we can't create a custom magic link
      // In this case, just use InstantDB's default email flow
      await db.auth.sendMagicCode({ email });
      return NextResponse.json({ 
        success: true,
        message: 'Magic code sent via InstantDB. Please check your email for the code.'
      });
    }

    // Create magic link with code embedded
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                    'http://localhost:3000');
    
    const callbackUrl = new URL('/auth/callback', baseUrl);
    callbackUrl.searchParams.set('email', email);
    callbackUrl.searchParams.set('code', code);
    if (redirect) {
      callbackUrl.searchParams.set('redirect', redirect);
    }

    const magicLink = callbackUrl.toString();

    // Send email with magic link
    // For now, we'll use a simple approach - you can integrate with Resend, SendGrid, etc.
    // For production, configure an email service
    const emailService = process.env.EMAIL_SERVICE || 'console';
    
    if (emailService === 'console') {
      // Development: log to console
      console.log('Magic link for', email, ':', magicLink);
    } else if (emailService === 'resend') {
      // Using Resend
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (!RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured');
      }

      try {
        // Dynamic import with type assertion to handle optional dependency
        // @ts-ignore - resend is an optional dependency
        const resendModule = await import('resend');
        const resend = resendModule.default;
        const resendClient = new resend({ apiKey: RESEND_API_KEY });

        await resendClient.emails.send({
          from: process.env.FROM_EMAIL || 'Stackk <[email protected]>',
          to: email,
          subject: 'Sign in to Stackk',
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Sign in to Stackk</h1>
              <p>Click the button below to sign in to your account:</p>
              <a href="${magicLink}" 
                 style="display: inline-block; background: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                Sign in to Stackk
              </a>
              <p style="color: #666; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${magicLink}">${magicLink}</a>
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                This link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          `,
          text: `Sign in to Stackk\n\nClick this link to sign in: ${magicLink}\n\nThis link will expire in 15 minutes.`,
        });
      } catch (importError: any) {
        console.error('Failed to import or use resend:', importError);
        throw new Error('Resend package is not installed. Install it with: pnpm add resend');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending magic link:', error);
    return NextResponse.json(
      { error: error.body?.message || error.message || 'Failed to send magic link' },
      { status: 500 }
    );
  }
}
