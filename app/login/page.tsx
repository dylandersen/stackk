'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import db from '@/lib/instant';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = db.useAuth();
  const [email, setEmail] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already signed in
  useEffect(() => {
    if (user) {
      const redirectTo = searchParams?.get('redirect') || '/dashboard';
      router.push(redirectTo);
    }
  }, [user, router, searchParams]);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const redirect = searchParams?.get('redirect') || '/dashboard';
      const response = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, redirect }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link');
      }

      setSentEmail(email);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
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
              : 'Check your email for the magic link'}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          {!sentEmail ? (
            <form onSubmit={handleSendMagicLink} className="space-y-6">
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
                {isLoading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Mail className="text-primary" size={32} />
                </div>
                <p className="text-sm text-text-secondary mb-2">
                  We sent a magic link to <strong className="text-white">{sentEmail}</strong>
                </p>
                <p className="text-sm text-text-secondary">
                  Click the link in your email to sign in. The link will expire in 15 minutes.
                </p>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setSentEmail('');
                  setEmail('');
                  setError('');
                }}
                className="w-full text-text-secondary hover:text-white text-sm transition-colors"
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
