import { publicProcedure, router } from '../setup';
import { z } from 'zod';

export const scraperRouter = router({
  getKeywords: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    return await db.scraperKeyword.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }),
  getResults: publicProcedure
    .input(
      z.object({
        minPrice: z.number().min(0).optional(),
        maxPrice: z.number().min(0).optional(),
        keywords: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).default(20),
        page: z.number().min(1).default(1)
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const where = {} as Record<string, any>;
      if (input.minPrice) {
        where.price = {
          gte: input.minPrice
        };
      }
      if (input.maxPrice) {
        where.price = {
          lte: input.maxPrice
        };
      }
      if (input.keywords) {
        where.keywords = {
          some: {
            keyword: {
              contains: input.keywords,
              mode: 'insensitive'
            }
          }
        };
      }
      return await db.scraperResult.findMany({
        where,
        skip: (input.page - 1) * input.limit,
        take: input.limit,
        orderBy: {
          updatedAt: 'desc'
        }
      });
    })
});

// Export type router type signature, this is used by the client.
export type ScraperRouter = typeof scraperRouter;
