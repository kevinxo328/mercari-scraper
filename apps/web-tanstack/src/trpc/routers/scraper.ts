import { publicProcedure, protectedProcedure, router } from '../setup';
import { z } from 'zod';
import { mercariCategories } from '@mercari-scraper/database';

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
        search: z.string().max(255).optional(),
        hasResults: z.boolean().optional(),
        pinnedFirst: z.boolean().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const where: Record<string, any> = {};

      if (input.search) {
        where.keyword = {
          contains: input.search,
          mode: 'insensitive' as const
        };
      }

      if (input.hasResults !== undefined) {
        where.results = input.hasResults ? { some: {} } : { none: {} };
      }

      // Build orderBy clause - prioritize pinned keywords if requested
      const orderBy = input.pinnedFirst
        ? [
            { isPinned: 'desc' as const },
            { [input.orderByField]: input.orderby }
          ]
        : { [input.orderByField]: input.orderby };

      const [keywords, total] = await Promise.all([
        db.scraperKeyword.findMany({
          where,
          orderBy,
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize
        }),
        db.scraperKeyword.count({
          where
        })
      ]);

      console.log(mercariCategories);

      const data = keywords.map((keyword) => ({
        ...keyword,
        categoryNames: keyword.categoryIds
          .map(
            (code) =>
              mercariCategories.map[code]?.enName ||
              mercariCategories.map[code]?.name ||
              code
          )
          .filter(Boolean)
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
  deleteResult: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid()
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.scraperResult.delete({
        where: { id: input.id }
      });
      return { success: true };
    }),
  updateKeyword: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        keyword: z.string().min(1).max(255),
        minPrice: z.number().min(0).nullable().optional(),
        maxPrice: z.number().min(0).nullable().optional(),
        categoryIds: z.array(z.string()).default([]),
        isPinned: z.boolean().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, keyword, minPrice, maxPrice, categoryIds, isPinned } = input;
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
          categoryIds,
          ...(typeof isPinned !== 'undefined' && { isPinned })
        }
      });
    }),
  deleteKeyword: protectedProcedure
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
  togglePinKeyword: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        isPinned: z.boolean()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.scraperKeyword.update({
        where: { id: input.id },
        data: { isPinned: input.isPinned }
      });
    }),
  getCategories: publicProcedure.query(() => {
    type RawNode = {
      code: string;
      name: string;
      enName: string;
      children?: RawNode[];
    };
    type TreeNode = { value: string; label: string; children?: TreeNode[] };
    type FlatEntry = { label: string; path: string[] };

    function toTreeNode(raw: RawNode): TreeNode {
      return {
        value: raw.code,
        label: raw.enName || raw.name,
        children: raw.children?.length
          ? raw.children.map(toTreeNode)
          : undefined
      };
    }

    function buildMap(
      nodes: RawNode[],
      ancestorPath: string[],
      result: Record<string, FlatEntry>
    ) {
      for (const node of nodes) {
        const path = [...ancestorPath, node.enName || node.name];
        result[node.code] = { label: node.enName || node.name, path };
        if (node.children?.length) {
          buildMap(node.children, path, result);
        }
      }
    }

    const tree = (mercariCategories.tree as RawNode[]).map(toTreeNode);
    const map: Record<string, FlatEntry> = {};
    buildMap(mercariCategories.tree as RawNode[], [], map);

    return { tree, map };
  }),
  getLastRun: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.scraperRun.findFirst({
      orderBy: { completedAt: 'desc' }
    });
  }),
  createKeyword: protectedProcedure
    .input(
      z.object({
        keyword: z.string().min(1).max(255),
        minPrice: z.number().min(0).nullable().optional(),
        maxPrice: z.number().min(0).nullable().optional(),
        categoryIds: z.array(z.string()).default([]),
        isPinned: z.boolean().default(false)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { keyword, minPrice, maxPrice, categoryIds, isPinned } = input;
      if (
        minPrice !== null &&
        maxPrice !== null &&
        minPrice !== undefined &&
        maxPrice !== undefined &&
        minPrice > maxPrice
      ) {
        throw new Error('Min price must be less than or equal to max price');
      }

      return await ctx.db.scraperKeyword.create({
        data: {
          keyword,
          minPrice: typeof minPrice === 'undefined' ? null : minPrice,
          maxPrice: typeof maxPrice === 'undefined' ? null : maxPrice,
          categoryIds,
          isPinned
        }
      });
    })
});

// Export type router type signature, this is used by the client.
export type ScraperRouter = typeof scraperRouter;
