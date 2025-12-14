'use client';

import React from 'react';
import db from '@/lib/instant';

export function InstantDBProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <db.SignedOut>
        <AutoSignIn>
          {children}
        </AutoSignIn>
      </db.SignedOut>
      <db.SignedIn>
        {children}
      </db.SignedIn>
    </>
  );
}

function AutoSignIn({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    db.auth.signInAsGuest();
  }, []);
  
  return <>{children}</>;
}
