import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { ConditionalLayout } from '@/components/ConditionalLayout';
import { InstantDBProvider } from '@/components/InstantDBProvider';

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
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </InstantDBProvider>
      </body>
    </html>
  );
}

