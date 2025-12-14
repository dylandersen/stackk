'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import db from '@/lib/instant';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = db.useAuth();
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAndSignIn = async () => {
      const email = searchParams?.get('email');
      const code = searchParams?.get('code');
      const redirect = searchParams?.get('redirect') || '/dashboard';

      if (!email || !code) {
        setError('Invalid magic link. Missing email or code.');
        setIsVerifying(false);
        return;
      }

      try {
        // Sign in using the magic code
        await db.auth.signInWithMagicCode({ email, code });
        
        // Redirect will happen via the useEffect when user state updates
        router.push(redirect);
      } catch (err: any) {
        console.error('Error verifying magic link:', err);
        setError(err.body?.message || 'Invalid or expired magic link. Please request a new one.');
        setIsVerifying(false);
      }
    };

    // If user is already signed in, redirect
    if (user) {
      const redirect = searchParams?.get('redirect') || '/dashboard';
      router.push(redirect);
      return;
    }

    verifyAndSignIn();
  }, [searchParams, router, user]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-red-900/20 mb-4 p-3">
              <Image 
                src="/stackk.png" 
                alt="Stackk" 
                width={40} 
                height={40} 
                className="object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 font-secondary">Verification Failed</h1>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-8">
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-sm text-red-400 mb-4">
              {error}
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4 p-3">
          <Image 
            src="/stackk.png" 
            alt="Stackk" 
            width={48} 
            height={48} 
            className="object-contain animate-pulse"
          />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Verifying your magic link...</h1>
        <p className="text-text-secondary">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Image 
          src="/stackk.png" 
          alt="Stackk" 
          width={48} 
          height={48} 
          className="object-contain"
        />
        <div className="text-text-secondary">Loading...</div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
