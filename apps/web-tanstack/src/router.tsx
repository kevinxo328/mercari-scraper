import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { createContext, useContext } from 'react';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import type { AppRouter } from './trpc/routers';
import { transformer } from './trpc/shared/transformer';

function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes - prevent memory leaks
        retry: 1, // reduce unnecessary retries
        refetchOnWindowFocus: false // reduce unnecessary requests
      },
      mutations: {
        retry: 1
      }
    }
  });
}

function createAppTrpc(queryClient: QueryClient) {
  // SSR: invoke tRPC router in-process via fetchRequestHandler (no HTTP).
  // import.meta.env.SSR is a Vite compile-time constant, so the client build
  // will dead-code-eliminate this branch and its dynamic imports entirely.
  const ssrFetch: typeof fetch | undefined = import.meta.env.SSR
    ? async (input, init) => {
        const [{ fetchRequestHandler }, { appRouter }, { createContext: ctx }] =
          await Promise.all([
            import('@trpc/server/adapters/fetch'),
            import('./trpc/routers'),
            import('./trpc/setup')
          ]);
        return fetchRequestHandler({
          req: new Request(new URL(input.toString(), 'http://localhost'), init),
          router: appRouter,
          endpoint: '/api/trpc',
          createContext: ({ req }) => ctx({ req })
        });
      }
    : undefined;

  return createTRPCOptionsProxy<AppRouter>({
    client: createTRPCClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          transformer,
          fetch: ssrFetch
        })
      ]
    }),
    queryClient
  });
}

export type TrpcProxy = ReturnType<typeof createAppTrpc>;

const TRPCContext = createContext<TrpcProxy | null>(null);

export function useTRPC() {
  const trpc = useContext(TRPCContext);
  if (!trpc) {
    throw new Error('useTRPC must be used within the router provider');
  }
  return trpc;
}

function createAppRouter() {
  const queryClient = createAppQueryClient();
  const trpc = createAppTrpc(queryClient);

  const router = createRouter({
    routeTree,
    context: { queryClient, trpc },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    scrollRestorationBehavior: 'instant',
    Wrap: function WrapComponent({ children }) {
      return (
        <TRPCContext.Provider value={trpc}>{children}</TRPCContext.Provider>
      );
    }
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient
  });

  return router;
}

// Track client-side router singleton
let routerInstance: ReturnType<typeof createAppRouter> | null = null;

export function getRouter() {
  // Always create new instance on server-side for request isolation
  if (typeof window === 'undefined') {
    return createAppRouter();
  }

  // Reuse instance on client-side
  if (!routerInstance) {
    routerInstance = createAppRouter();
  }

  return routerInstance;
}

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
