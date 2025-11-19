import { publicProcedure, router } from '../setup';
import { z } from 'zod';

export const scraperRouter = router({
  getKeywords: publicProcedure
    .input(
      z.object({
        pageSize: z.number().min(1).max(100).default(20),
        page: z.number().min(1).default(1),
        orderby: z.enum(['asc', 'desc']).default('desc'),
        orderByField: z
          .enum(['keyword', 'createdAt', 'updatedAt', 'minPrice', 'maxPrice'])
          .default('updatedAt'),
        search: z.string().max(255).optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const where = input.search
        ? {
            keyword: {
              contains: input.search,
              mode: 'insensitive' as const
            }
          }
        : undefined;
      const [keywords, total] = await Promise.all([
        db.scraperKeyword.findMany({
          where,
          orderBy: {
            [input.orderByField]: input.orderby
          },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize
        }),
        db.scraperKeyword.count({
          where
        })
      ]);

      const categoryIds = Array.from(
        new Set(
          keywords.flatMap((keyword) => keyword.categoryIds).filter(Boolean)
        )
      );

      const categoryMap =
        categoryIds.length > 0
          ? await db.keywordCategory.findMany({
              where: {
                id: {
                  in: categoryIds
                }
              },
              select: {
                id: true,
                name: true
              }
            })
          : [];
      const categoryNameMap = categoryMap.reduce(
        (acc, category) => {
          acc[category.id] = category.name;
          return acc;
        },
        {} as Record<string, string>
      );

      const data = keywords.map((keyword) => ({
        ...keyword,
        categoryNames: keyword.categoryIds
          .map((id) => categoryNameMap[id])
          .filter((name): name is string => Boolean(name))
      }));

      return {
        data,
        total,
        page: input.page,
        pageSize: input.pageSize
      };
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
    }),
  updateKeyword: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        keyword: z.string().min(1).max(255),
        minPrice: z.number().min(0).nullable().optional(),
        maxPrice: z.number().min(0).nullable().optional(),
        categoryIds: z.array(z.string().uuid()).default([])
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, keyword, minPrice, maxPrice, categoryIds } = input;
      if (
        minPrice !== null &&
        maxPrice !== null &&
        minPrice !== undefined &&
        maxPrice !== undefined &&
        minPrice > maxPrice
      ) {
        throw new Error('Min price must be less than or equal to max price');
      }

      return await ctx.db.scraperKeyword.update({
        where: { id },
        data: {
          keyword,
          minPrice: typeof minPrice === 'undefined' ? null : minPrice,
          maxPrice: typeof maxPrice === 'undefined' ? null : maxPrice,
          categoryIds
        }
      });
    }),
  deleteKeyword: publicProcedure
    .input(
      z.object({
        id: z.string().uuid()
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.scraperKeyword.delete({
        where: { id: input.id }
      });
      return { success: true };
    }),
  getCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.keywordCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    });
  })
});

// Export type router type signature, this is used by the client.
export type ScraperRouter = typeof scraperRouter;
