import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/instant-server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate magic code using InstantDB Admin SDK
    const result = await db.auth.generateMagicCode(email);
    const code = result.code;

    // Send email with magic code
    const emailService = process.env.EMAIL_SERVICE || 'console';
    
    if (emailService === 'console') {
      // Development: log to console
      console.log('Magic code for', email, ':', code);
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
          subject: 'Your Magic Code for Stackk',
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; margin-bottom: 20px;">Your Magic Code</h1>
              <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
                Use this code to sign in to your Stackk account:
              </p>
              <div style="background: #f5f5f5; border: 2px dashed #6366F1; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <div style="font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #6366F1; font-family: monospace;">
                  ${code}
                </div>
              </div>
              <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
                Enter this code in the sign in page to complete your authentication.
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                This code will expire in 15 minutes. If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          `,
          text: `Your Magic Code for Stackk\n\nUse this code to sign in: ${code}\n\nThis code will expire in 15 minutes. If you didn't request this, you can safely ignore this email.`,
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
    console.error('Error sending magic code:', error);
    return NextResponse.json(
      { error: error.body?.message || error.message || 'Failed to send magic code' },
      { status: 500 }
    );
  }
}

