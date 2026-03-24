import type { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';

import type { AppRouter } from './routers';
import { transformer } from './shared/transformer';

function createTrpcProxy(
  queryClient: QueryClient,
  fetchOverride?: typeof fetch
) {
  return createTRPCOptionsProxy<AppRouter>({
    client: createTRPCClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          transformer,
          fetch: fetchOverride
        })
      ]
    }),
    queryClient
  });
}

export async function createServerFetch(): Promise<typeof fetch> {
  const { createServerFetch: createServerFetchImpl } = await import(
    './proxy.server'
  );

  return createServerFetchImpl();
}

export function createBrowserTrpc(queryClient: QueryClient) {
  return createTrpcProxy(queryClient);
}

export function createServerTrpc(
  queryClient: QueryClient,
  fetchOverridePromise: Promise<typeof fetch>
) {
  return createTrpcProxy(queryClient, async (input, init) => {
    const fetchOverride = await fetchOverridePromise;
    return fetchOverride(input, init);
  });
}

export type TrpcProxy = ReturnType<typeof createBrowserTrpc>;
