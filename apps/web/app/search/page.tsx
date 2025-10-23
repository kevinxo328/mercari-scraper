import ClientSearch from '@/components/client/client-search';
import { HydrateClient } from '@/trpc/server';

export default async function Page() {
  return (
    <HydrateClient>
      <ClientSearch />
    </HydrateClient>
  );
}
