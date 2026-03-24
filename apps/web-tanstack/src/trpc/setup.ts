import { prisma } from '@mercari-scraper/database';
import { TRPCError } from '@trpc/server';
import { initTRPC } from '@trpc/server';

import { auth } from '@/lib/auth';

import { transformer } from './shared/transformer';

export const createContext = async ({ req }: { req: Request }) => {
  const session = await auth.api.getSession({ headers: req.headers });
  return {
    db: prisma,
    session
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer
});

export const router = t.router;
export const procedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }

  // Additional security: check session validity
  if (!ctx.session.user.id || !ctx.session.user.email) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid session data'
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.session.user.id // Ensure userId is available
    }
  });
});
