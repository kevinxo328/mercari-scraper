import { initTRPC } from '@trpc/server';
import { transformer } from './shared/transformer';
import { prisma } from '@mercari-scraper/database';

/**
 * Create a context for tRPC procedures
 * You can access things like database, session, etc. via context
 * @see https://trpc.io/docs/context
 */
export const createContext = async (): Promise<{ db: typeof prisma }> => {
  return {
    db: prisma
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
