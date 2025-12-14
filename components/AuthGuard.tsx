'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import db from '@/lib/instant';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, user } = db.useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      // Store the intended destination, but don't redirect to auth pages
      let redirectTo = pathname && pathname !== '/' ? pathname : '/dashboard';
      
      // Prevent redirecting to auth-related pages to avoid loops
      if (redirectTo.startsWith('/auth') || redirectTo.startsWith('/login')) {
        redirectTo = '/dashboard';
      }
      
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading) {
    return (
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
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
