import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';

import { routeTree } from './routeTree.gen';
import { TRPCOptionsProvider, useTRPC } from './trpc/context';
import {
  createBrowserTrpc,
  createServerFetch,
  createServerTrpc,
  type TrpcProxy
} from './trpc/proxy';
import { getQueryClient } from './trpc/query-client';

function createAppRouter() {
  const queryClient = getQueryClient();
  const trpc = import.meta.env.SSR
    ? createServerTrpc(queryClient, createServerFetch())
    : createBrowserTrpc(queryClient);

  const router = createRouter({
    routeTree,
    context: { queryClient, trpc },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    scrollRestorationBehavior: 'instant',
    Wrap: function WrapComponent({ children }) {
      return (
        <QueryClientProvider client={queryClient}>
          <TRPCOptionsProvider trpc={trpc}>{children}</TRPCOptionsProvider>
        </QueryClientProvider>
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

export { useTRPC };
export type { TrpcProxy };
