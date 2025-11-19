import { initTRPC, TRPCError } from '@trpc/server';
import { transformer } from './shared/transformer';
import { prisma } from '@mercari-scraper/database';
import { auth } from '@/lib/auth';

/**
 * Create a context for tRPC procedures
 * You can access things like database, session, etc. via context
 * @see https://trpc.io/docs/context
 */
export const createContext = async () => {
  const session = await auth();
  return {
    db: prisma,
    session
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
 * Middleware to check if user is authenticated
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated'
    });
  }

  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user
    }
  });
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
