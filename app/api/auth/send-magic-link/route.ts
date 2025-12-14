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

    // Generate magic code using InstantDB Admin SDK
    // This generates a code without sending an email, allowing us to create a custom magic link
    const result = await db.auth.generateMagicCode(email);
    const code = result.code;

    // Create magic link with code embedded
    // Prefer NEXT_PUBLIC_APP_URL for production, fallback to VERCEL_URL for preview deployments
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                    'http://localhost:3000');
    
    const callbackUrl = new URL('/auth/callback', baseUrl);
    callbackUrl.searchParams.set('email', email);
    callbackUrl.searchParams.set('code', code);
    // Always redirect to dashboard - no need to pass redirect param

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

      const fromEmail = process.env.FROM_EMAIL;
      if (!fromEmail) {
        throw new Error(
          'FROM_EMAIL environment variable is required. ' +
          'Set it to a verified email address from your Resend domain, e.g., "Stackk <[email protected]>" or "[email protected]"'
        );
      }

      try {
        const { Resend } = await import('resend');
        const resendClient = new Resend(RESEND_API_KEY);

        console.log('Sending email via Resend:', { from: fromEmail, to: email });
        
        const result = await resendClient.emails.send({
          from: fromEmail,
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

        console.log('Resend response:', JSON.stringify(result, null, 2));
        
        if (result.error) {
          console.error('Resend API error:', result.error);
          const errorMessage = result.error.message || JSON.stringify(result.error);
          throw new Error(`Failed to send email: ${errorMessage}. Make sure your sender email is verified in Resend.`);
        }
        
        if (!result.data || !result.data.id) {
          console.error('Unexpected Resend response:', result);
          throw new Error('Failed to send email: Unexpected response from Resend API');
        }
        
        console.log('Email sent successfully. Resend email ID:', result.data.id);
      } catch (importError: any) {
        console.error('Failed to import or use resend:', importError);
        if (importError.message?.includes('Resend API error')) {
          throw importError;
        }
        throw new Error(`Failed to send email: ${importError.message || 'Unknown error'}`);
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
