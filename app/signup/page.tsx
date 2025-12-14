'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, User, Key, ArrowLeft } from 'lucide-react';
import { id } from '@instantdb/react';
import db from '@/lib/instant';
import { MagicCodeInput } from '@/components/MagicCodeInput';
import Link from 'next/link';

const REFERRAL_SOURCES = [
  { value: 'friend_family', label: 'Friend / Family' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'google', label: 'Google' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'product_hunt', label: 'Product Hunt' },
  { value: 'other', label: 'Other' },
];

function SignupForm() {
  const router = useRouter();
  const { user } = db.useAuth();
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    referralSource: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [signupData, setSignupData] = useState<{
    firstName: string;
    lastName: string;
    referralSource: string;
  } | null>(null);
  const [profileCreated, setProfileCreated] = useState(false);

  // Query for existing profile
  const { data } = db.useQuery(
    user ? {
      profiles: {
        $: {
          where: { userId: user.id }
        }
      }
    } : null
  );

  // Create profile after user is authenticated
  useEffect(() => {
    const createProfile = async () => {
      if (user && signupData && !profileCreated && step === 'code') {
        try {
          // Check if profile already exists
          const existingProfiles = data?.profiles || [];
          
          if (existingProfiles.length === 0) {
            // Create profile
            const profileId = id();
            db.transact(
              db.tx.profiles[profileId].update({
                firstName: signupData.firstName,
                lastName: signupData.lastName,
                referralSource: signupData.referralSource,
                userId: user.id,
              })
            );
            setProfileCreated(true);
          }

          // Redirect to dashboard with hard navigation to ensure URL updates
          window.location.href = '/dashboard';
        } catch (err) {
          console.error('Error creating profile:', err);
          // Still redirect even if profile creation fails
          window.location.href = '/dashboard';
        }
      }
    };

    createProfile();
  }, [user, signupData, profileCreated, step, router, data]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if user already exists
        if (data.error?.toLowerCase().includes('already exists') || 
            data.error?.toLowerCase().includes('user exists')) {
          setError('An account with this email already exists. Please sign in instead.');
          return;
        }
        throw new Error(data.error || 'Failed to process signup');
      }

      // Store signup data for profile creation after verification
      setSignupData(data.signupData);
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Failed to process signup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeComplete = async (code: string) => {
    setError('');
    setIsVerifying(true);

    try {
      // Sign in using the magic code
      await db.auth.signInWithMagicCode({ email: formData.email, code });
      
      // Profile creation will happen automatically via the useEffect above when user is set
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
          <h1 className="text-3xl font-bold text-white mb-2 font-secondary">Create your account</h1>
          <p className="text-text-secondary">
            {step === 'form' 
              ? 'Get started by creating your account'
              : 'Enter the Magic Code we sent to your email'}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          {step === 'form' ? (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-text-secondary mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                      required
                      autoFocus
                      className="w-full bg-background border border-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-text-secondary mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                    <input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                      required
                      className="w-full bg-background border border-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-background border border-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="referralSource" className="block text-sm font-medium text-text-secondary mb-2">
                  How did you hear about us?
                </label>
                <select
                  id="referralSource"
                  value={formData.referralSource}
                  onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                  required
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="" disabled>Select an option</option>
                  {REFERRAL_SOURCES.map((source) => (
                    <option key={source.value} value={source.value} className="bg-background">
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 text-sm text-red-400">
                  {error}
                  {error.includes('already exists') && (
                    <div className="mt-2">
                      <Link href="/login" className="text-primary hover:underline">
                        Sign in instead
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !formData.firstName || !formData.lastName || !formData.email || !formData.referralSource}
                className="w-full bg-primary hover:bg-primary-hover disabled:bg-surface disabled:text-text-secondary disabled:border disabled:border-border text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? 'Sending Magic Code...' : 'Send the Magic Code'}
              </button>

              <p className="text-center text-sm text-text-secondary">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Key className="text-primary" size={32} />
                </div>
                <p className="text-sm text-text-secondary mb-2">
                  We sent a Magic Code to <strong className="text-white">{formData.email}</strong>
                </p>
                <p className="text-sm text-text-secondary mb-6">
                  Enter the code below to complete your signup. The code will expire in 15 minutes.
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
                  setStep('form');
                  setError('');
                  setIsVerifying(false);
                }}
                disabled={isVerifying}
                className="w-full flex items-center justify-center gap-2 text-text-secondary hover:text-white text-sm transition-colors disabled:opacity-50"
              >
                <ArrowLeft size={16} />
                Back to form
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
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
      <SignupForm />
    </Suspense>
  );
}
