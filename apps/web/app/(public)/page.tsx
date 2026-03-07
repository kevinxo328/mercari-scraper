import React from 'react';

import { HydrateClient, prefetch, trpc } from '@/trpc/server';

import HomePageClient from './_components/home-page.client';

export default async function Page() {
  prefetch(trpc.scraper.getLastRun.queryOptions());

  return (
    <HydrateClient>
      <HomePageClient />
    </HydrateClient>
  );
}
