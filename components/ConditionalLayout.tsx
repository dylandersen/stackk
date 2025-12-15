'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { AuthGuard } from '@/components/AuthGuard';
import AddServiceModal from '@/components/AddServiceModal';
import { useAddServiceModal } from '@/contexts/AddServiceModalContext';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isLoginPage = pathname === '/login';
  const isSignupPage = pathname === '/signup';
  const isAuthCallback = pathname?.startsWith('/auth');

  // Exclude auth-related pages from AuthGuard
  if (isLandingPage || isLoginPage || isSignupPage || isAuthCallback) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-text-primary pb-24 md:pb-0 md:pl-64 flex">
        <Navigation />
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
      <AddServiceModalWrapper />
    </AuthGuard>
  );
}

function AddServiceModalWrapper() {
  const { isOpen, closeModal } = useAddServiceModal();
  return <AddServiceModal isOpen={isOpen} onClose={closeModal} />;
}

