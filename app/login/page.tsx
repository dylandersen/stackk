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
  const [code, setCode] = useState('');
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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await db.auth.sendMagicCode({ email });
      setSentEmail(email);
    } catch (err: any) {
      setError(err.body?.message || 'Failed to send code. Please try again.');
      setEmail('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
      // Redirect will happen via useEffect when user state updates
      const redirectTo = searchParams?.get('redirect') || '/dashboard';
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.body?.message || 'Invalid code. Please try again.');
      setCode('');
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
              : 'Check your email for the verification code'}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          {!sentEmail ? (
            <form onSubmit={handleSendCode} className="space-y-6">
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
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <p className="text-sm text-text-secondary mb-4">
                  We sent a verification code to <strong className="text-white">{sentEmail}</strong>. 
                  Please check your email and enter the code below.
                </p>
                <label htmlFor="code" className="block text-sm font-medium text-text-secondary mb-2">
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  required
                  autoFocus
                  maxLength={6}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors text-center text-2xl font-mono tracking-widest"
                />
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="w-full bg-primary hover:bg-primary-hover disabled:bg-surface disabled:text-text-secondary disabled:border disabled:border-border text-white font-bold py-3 rounded-lg transition-all"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSentEmail('');
                    setCode('');
                    setEmail('');
                    setError('');
                  }}
                  className="w-full text-text-secondary hover:text-white text-sm transition-colors"
                >
                  Use a different email
                </button>
              </div>
            </form>
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
