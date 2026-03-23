import { mercariCategories } from '@mercari-scraper/database';
import { z } from 'zod';

import { procedure, protectedProcedure, router } from '../setup';

export const scraperRouter = router({
  getKeywords: procedure
    .input(
      z.object({
        pageSize: z.number().min(1).max(100).default(20),
        page: z.number().min(1).default(1),
        orderby: z.enum(['asc', 'desc']).default('desc'),
        orderByField: z
          .enum(['keyword', 'createdAt', 'updatedAt', 'minPrice', 'maxPrice'])
          .default('updatedAt'),
        search: z.string().max(255).optional(),
        hasResults: z.boolean().optional()
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

      // Build orderBy clause
      const orderBy = { [input.orderByField]: input.orderby };

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
  getResults: procedure
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
  infiniteResults: procedure
    .input(
      z.object({
        minPrice: z.number().min(0).nullish(),
        maxPrice: z.number().min(0).nullish(),
        keywords: z.array(z.string()).optional(),
        updatedSince: z.date().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().nullish(),
        orderby: z.enum(['asc', 'desc']).default('desc')
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      // Build price/date filters (no keywords here — handled per phase)
      const baseFilters: Record<string, any> = {};
      if (input.minPrice !== null && input.minPrice !== undefined) {
        baseFilters.price = { gte: input.minPrice };
      }
      if (input.maxPrice !== null && input.maxPrice !== undefined) {
        baseFilters.price = { lte: input.maxPrice };
      }
      if (input.updatedSince) {
        baseFilters.updatedAt = { gte: input.updatedSince };
      }

      const keywordIds =
        input.keywords && input.keywords.length > 0
          ? input.keywords
          : undefined;

      // Parse cursor: "pinned:<id>" | "regular:<id>" | plain id (legacy)
      let phase: 'pinned' | 'regular' = 'pinned';
      let cursorId: string | undefined;
      if (input.cursor) {
        if (input.cursor.startsWith('pinned:')) {
          phase = 'pinned';
          cursorId = input.cursor.slice('pinned:'.length);
        } else if (input.cursor.startsWith('regular:')) {
          phase = 'regular';
          cursorId = input.cursor.slice('regular:'.length);
        } else {
          phase = 'regular';
          cursorId = input.cursor;
        }
      }

      type ResultRow = Awaited<
        ReturnType<typeof db.scraperResult.findMany>
      >[number];
      const results: ResultRow[] = [];
      let nextCursor: string | null = null;
      let remaining = input.limit + 1;

      // Phase 1: results whose keywords include at least one pinned keyword
      if (phase === 'pinned') {
        const pinnedWhere: Record<string, any> = {
          ...baseFilters,
          AND: [
            { keywords: { some: { pinned: true } } },
            ...(keywordIds
              ? [{ keywords: { some: { keyword: { in: keywordIds } } } }]
              : [])
          ]
        };

        const pinnedResults = await db.scraperResult.findMany({
          where: pinnedWhere,
          take: remaining,
          cursor: cursorId ? { id: cursorId } : undefined,
          orderBy: { updatedAt: input.orderby }
        });

        results.push(...pinnedResults);
        remaining -= pinnedResults.length;

        if (results.length > input.limit) {
          const nextItem = results.pop();
          nextCursor = `pinned:${nextItem!.id}`;
          return { data: results, nextCursor };
        }

        // Pinned phase exhausted; fall through to regular
        phase = 'regular';
        cursorId = undefined;
      }

      // Phase 2: results whose keywords have no pinned keyword
      if (remaining > 0) {
        const regularWhere: Record<string, any> = {
          ...baseFilters,
          AND: [
            { keywords: { none: { pinned: true } } },
            ...(keywordIds
              ? [{ keywords: { some: { keyword: { in: keywordIds } } } }]
              : [])
          ]
        };

        const regularResults = await db.scraperResult.findMany({
          where: regularWhere,
          take: remaining,
          cursor: cursorId ? { id: cursorId } : undefined,
          orderBy: { updatedAt: input.orderby }
        });

        results.push(...regularResults);

        if (results.length > input.limit) {
          const nextItem = results.pop();
          nextCursor = `regular:${nextItem!.id}`;
        }
      }

      return { data: results, nextCursor };
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
  updateKeyword: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        keyword: z.string().min(1).max(255),
        minPrice: z.number().min(0).nullable().optional(),
        maxPrice: z.number().min(0).nullable().optional(),
        categoryIds: z.array(z.string()).default([])
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
  pinKeyword: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        pinned: z.boolean()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.scraperKeyword.update({
        where: { id: input.id },
        data: { pinned: input.pinned }
      });
    }),
  getCategories: procedure.query(() => {
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
  getLastRun: procedure.query(async ({ ctx }) => {
    const runs = await ctx.db.scraperRun.findMany({
      where: { completedAt: { not: null } },
      orderBy: { completedAt: 'desc' },
      take: 2
    });
    const lastRun = runs[0] ?? null;
    const sinceDate = runs[1]?.completedAt ?? null;
    return lastRun ? { ...lastRun, sinceDate } : null;
  }),
  createKeyword: protectedProcedure
    .input(
      z.object({
        keyword: z.string().min(1).max(255),
        minPrice: z.number().min(0).nullable().optional(),
        maxPrice: z.number().min(0).nullable().optional(),
        categoryIds: z.array(z.string()).default([])
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { keyword, minPrice, maxPrice, categoryIds } = input;
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
          categoryIds
        }
      });
    })
});

// Export type router type signature, this is used by the client.
export type ScraperRouter = typeof scraperRouter;
