import { appRouter } from '@/trpc/routers';
import { createContext } from '@/trpc/setup';
import { createExpressMiddleware } from '@trpc/server/adapters/express';

export const trpcMiddleWare = createExpressMiddleware({
  router: appRouter,
  createContext
});
