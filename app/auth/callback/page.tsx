'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import db from '@/lib/instant';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = db.useAuth();
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAttemptedSignIn, setHasAttemptedSignIn] = useState(false);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Once user is signed in and we're done verifying, redirect to dashboard immediately
    if (user && !isVerifying && !authLoading && hasAttemptedSignIn) {
      // Clear fallback timeout since we have a user
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
      
      // Redirect immediately - auth state is ready
      router.push('/dashboard');
    }
  }, [user, isVerifying, authLoading, hasAttemptedSignIn, router]);

  useEffect(() => {
    const verifyAndSignIn = async () => {
      const email = searchParams?.get('email');
      const code = searchParams?.get('code');
      // Always redirect to dashboard after authentication
      const redirect = '/dashboard';

      if (!email || !code) {
        setError('Invalid magic link. Missing email or code.');
        setIsVerifying(false);
        return;
      }

      // If already signed in, just redirect to dashboard
      if (user) {
        router.push(redirect);
        setIsVerifying(false);
        return;
      }

      try {
        console.log('Verifying magic code for:', email, 'code:', code);
        // Sign in using the magic code - ensure code is a string
        await db.auth.signInWithMagicCode({ email, code: String(code) });
        console.log('Magic code verified successfully');
        
        // Mark that we've attempted sign-in - wait for user state to update
        setHasAttemptedSignIn(true);
        setIsVerifying(false);
        
        // Give the auth state a moment to update, then check again
        // The useEffect above will handle the redirect once user is set
        
        // Fallback: if user state doesn't update within 2 seconds, try redirecting anyway
        // This handles cases where auth state propagation is delayed
        fallbackTimeoutRef.current = setTimeout(() => {
          // Always redirect to dashboard
          console.warn('User state not updated after sign-in, forcing hard redirect to dashboard');
          window.location.href = '/dashboard';
        }, 2000);
      } catch (err: any) {
        console.error('Error verifying magic link:', err);
        // Clear fallback timeout on error
        if (fallbackTimeoutRef.current) {
          clearTimeout(fallbackTimeoutRef.current);
          fallbackTimeoutRef.current = null;
        }
        setError(err.body?.message || err.message || 'Invalid or expired magic link. Please request a new one.');
        setIsVerifying(false);
        setHasAttemptedSignIn(true);
      }
    };

    // Only run if we haven't verified yet and user isn't already signed in
    // Also wait for auth to finish loading before attempting sign-in
    if (!user && isVerifying && !authLoading && !hasAttemptedSignIn) {
      verifyAndSignIn();
    }
  }, [searchParams, router, user, isVerifying, authLoading, hasAttemptedSignIn]);

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
        <h1 className="text-2xl font-bold text-white mb-2">Signing you in...</h1>
        <p className="text-text-secondary">This will only take a moment.</p>
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
