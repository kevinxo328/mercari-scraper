import { createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { AppRouter } from './trpc/routers';
import { transformer } from './trpc/shared/transformer';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

export const queryClient = new QueryClient();
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient({
    links: [
      httpBatchLink({
        // since we are using Vite, the server is running on the same port,
        // this means in dev the url is `http://localhost:3000/trpc`
        // and since its from the same origin, we don't need to explicitly set the full URL
        url: '/trpc',
        transformer
      })
    ]
  }),
  queryClient
});

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    context: { queryClient, trpc },
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
