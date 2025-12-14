import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stackk | Track Your Developer Subscriptions',
  description: 'The developer-first platform for tracking subscriptions, monitoring usage, and managing all your dev tool spending in one beautiful dashboard.',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

