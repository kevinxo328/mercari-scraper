import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import React from 'react';

import HomePageClient from './_components/home-page.client';

export const dynamic = 'force-dynamic';

export default async function Page() {
  prefetch(
    trpc.scraper.getKeywords.queryOptions({
      pageSize: 5,
      page: 1,
      orderby: 'desc',
      orderByField: 'updatedAt'
    })
  );

  return (
    <HydrateClient>
      <HomePageClient />
    </HydrateClient>
  );
}
