'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/Navigation';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24 md:pb-0 md:pl-64 flex">
      <Navigation />
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}

