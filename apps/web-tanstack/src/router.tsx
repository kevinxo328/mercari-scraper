import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import type { AppRouter } from './trpc/routers';
import { transformer } from './trpc/shared/transformer';

export const queryClient = new QueryClient();
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        transformer
      })
    ]
  }),
  queryClient
});

export function getRouter() {
  const router = createRouter({
    routeTree,
    context: { queryClient, trpc },
    scrollRestoration: true,
    scrollRestorationBehavior: 'instant',
    Wrap: function WrapComponent({ children }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
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

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
