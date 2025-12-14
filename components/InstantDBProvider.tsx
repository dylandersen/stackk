'use client';

import React from 'react';
import db from '@/lib/instant';

export function InstantDBProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <db.SignedOut>
        {children}
      </db.SignedOut>
      <db.SignedIn>
        {children}
      </db.SignedIn>
    </>
  );
}
