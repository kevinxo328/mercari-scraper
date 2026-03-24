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
  const [
    { fetchRequestHandler },
    { appRouter },
    { createContext },
    { getRequestHeaders }
  ] = await Promise.all([
    import('@trpc/server/adapters/fetch'),
    import('./routers'),
    import('./setup'),
    import('@tanstack/react-start/server')
  ]);

  return async (input, init) => {
    const serverHeaders = getRequestHeaders();
    const requestHeaders = new Headers(serverHeaders as HeadersInit);

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => {
        requestHeaders.set(key, value);
      });
    }

    return fetchRequestHandler({
      req: new Request(new URL(input.toString(), 'http://localhost'), {
        ...init,
        headers: requestHeaders
      }),
      router: appRouter,
      endpoint: '/api/trpc',
      createContext: ({ req }) => createContext({ req })
    });
  };
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
