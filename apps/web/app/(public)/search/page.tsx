import SearchPageClient from './_components/search-page.client';
import { HydrateClient } from '@/trpc/server';

export default async function Page() {
  return (
    <HydrateClient>
      <SearchPageClient />
    </HydrateClient>
  );
}
