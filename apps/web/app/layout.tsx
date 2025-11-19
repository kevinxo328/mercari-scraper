import { Metadata } from 'next';
import './globals.css';
import AppHeader from '@/components/app-header';
import { TRPCReactProvider } from '@/trpc/client';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { auth } from '@/lib/auth';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'Mercari Scraper',
  description: 'This website shows the scraped data from Mercari',
  robots: {
    index: false,
    follow: false
  }
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en" className="dark">
        <body className="min-h-dvh flex flex-col">
          <NuqsAdapter>
            <TRPCReactProvider>
              <AppHeader />
              {children}
            </TRPCReactProvider>
          </NuqsAdapter>
        </body>
      </html>
    </SessionProvider>
  );
}
