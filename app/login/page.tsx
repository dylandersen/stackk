'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Mail, Key } from 'lucide-react';
import db from '@/lib/instant';
import { MagicCodeInput } from '@/components/MagicCodeInput';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = db.useAuth();
  const [email, setEmail] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already signed in
  useEffect(() => {
    if (user) {
      let redirectTo = searchParams?.get('redirect') || '/dashboard';
      
      // Prevent redirecting to auth-related pages to avoid loops
      if (redirectTo.startsWith('/auth') || redirectTo.startsWith('/login') || redirectTo.startsWith('/signup')) {
        redirectTo = '/dashboard';
      }
      
      // Use hard navigation to ensure URL updates properly
      window.location.href = redirectTo;
    }
  }, [user, router, searchParams]);

  const handleSendMagicCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/send-magic-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic code');
      }

      setSentEmail(email);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeComplete = async (code: string) => {
    setError('');
    setIsVerifying(true);

    try {
      // Sign in using the magic code
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
      
      // Redirect will happen automatically via the useEffect above when user is set
    } catch (err: any) {
      console.error('Error verifying code:', err);
      setError(err.body?.message || err.message || 'Invalid or expired code. Please request a new one.');
      setIsVerifying(false);
    }
  };

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4 p-3">
            <Image 
              src="/stackk.png" 
              alt="Stackk" 
              width={40} 
              height={40} 
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 font-secondary">Welcome to Stackk</h1>
          <p className="text-text-secondary">
            {!sentEmail 
              ? 'Enter your email to get started'
              : 'Enter the Magic Code we sent to your email'}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          {!sentEmail ? (
            <form onSubmit={handleSendMagicCode} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoFocus
                    className="w-full bg-background border border-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-primary hover:bg-primary-hover disabled:bg-surface disabled:text-text-secondary disabled:border disabled:border-border text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? 'Sending...' : 'Send the Magic Code'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Key className="text-primary" size={32} />
                </div>
                <p className="text-sm text-text-secondary mb-2">
                  We sent a Magic Code to <strong className="text-white">{sentEmail}</strong>
                </p>
                <p className="text-sm text-text-secondary mb-6">
                  Enter the code below to sign in. The code will expire in 15 minutes.
                </p>
              </div>

              <MagicCodeInput
                onCodeComplete={handleCodeComplete}
                isLoading={isVerifying}
                error={error}
              />

              <button
                type="button"
                onClick={() => {
                  setSentEmail('');
                  setEmail('');
                  setError('');
                  setIsVerifying(false);
                }}
                disabled={isVerifying}
                className="w-full text-text-secondary hover:text-white text-sm transition-colors disabled:opacity-50"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  );
}
