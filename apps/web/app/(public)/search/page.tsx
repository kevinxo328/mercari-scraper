import { HydrateClient } from '@/trpc/server';

import SearchPageClient from './_components/search-page.client';

export default async function Page() {
  return (
    <HydrateClient>
      <SearchPageClient />
    </HydrateClient>
  );
}
