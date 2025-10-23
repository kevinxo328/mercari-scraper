import { publicProcedure, router } from '../setup';
import { z } from 'zod';

export const scraperRouter = router({
  getKeywords: publicProcedure
    .input(
      z.object({
        pageSize: z.number().min(1).max(100).default(20),
        page: z.number().min(1).default(1),
        orderby: z.enum(['asc', 'desc']).default('desc')
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      return await db.scraperKeyword.findMany({
        orderBy: {
          updatedAt: input.orderby
        },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize
      });
    }),
  getResults: publicProcedure
    .input(
      z.object({
        minPrice: z.number().min(0).optional(),
        maxPrice: z.number().min(0).optional(),
        keywords: z.array(z.string()).optional(),
        pageSize: z.number().min(1).max(100).default(20),
        page: z.number().min(1).default(1),
        orderby: z.enum(['asc', 'desc']).default('desc')
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
              in: input.keywords.length > 0 ? input.keywords : undefined
            }
          }
        };
      }
      return await db.scraperResult.findMany({
        where,
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        orderBy: {
          updatedAt: input.orderby
        }
      });
    }),
  infiniteResults: publicProcedure
    .input(
      z.object({
        minPrice: z.number().min(0).nullish(),
        maxPrice: z.number().min(0).nullish(),
        keywords: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().nullish(),
        orderby: z.enum(['asc', 'desc']).default('desc')
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const where = {} as Record<string, any>;
      if (input.minPrice !== null && input.minPrice !== undefined) {
        where.price = {
          gte: input.minPrice
        };
      }
      if (input.maxPrice !== null && input.maxPrice !== undefined) {
        where.price = {
          lte: input.maxPrice
        };
      }
      if (input.keywords) {
        where.keywords = {
          some: {
            keyword: {
              in: input.keywords.length > 0 ? input.keywords : undefined
            }
          }
        };
      }

      const results = await db.scraperResult.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          updatedAt: input.orderby
        }
      });

      let nextCursor: string | null = null;
      if (results.length > input.limit) {
        const nextItem = results.pop();
        nextCursor = nextItem!.id;
      }

      return {
        data: results,
        nextCursor
      };
    })
});

// Export type router type signature, this is used by the client.
export type ScraperRouter = typeof scraperRouter;
