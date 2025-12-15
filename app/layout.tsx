import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { ConditionalLayout } from '@/components/ConditionalLayout';
import { InstantDBProvider } from '@/components/InstantDBProvider';
import { AddServiceModalProvider } from '@/contexts/AddServiceModalContext';

export const metadata: Metadata = {
  title: 'Stackk | Track Your Developer Subscriptions',
  description: 'The developer-first platform for tracking subscriptions, monitoring usage, and managing all your dev tool spending in one beautiful dashboard.',
  icons: {
    icon: '/stackk.png',
    shortcut: '/stackk.png',
    apple: '/stackk.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className={GeistSans.className}>
        <InstantDBProvider>
          <AddServiceModalProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </AddServiceModalProvider>
        </InstantDBProvider>
      </body>
    </html>
  );
}

