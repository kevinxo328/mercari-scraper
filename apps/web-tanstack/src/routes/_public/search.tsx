import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const searchSchema = z.object({
  keyword: z.string().optional().catch(undefined),
  minPrice: z.number().optional().catch(undefined),
  maxPrice: z.number().optional().catch(undefined)
});

export const Route = createFileRoute('/_public/search')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    keyword: search.keyword,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice
  }),
  loader: async ({ context: { queryClient, trpc }, deps }) => {
    void queryClient.prefetchQuery(
      trpc.scraper.getKeywords.queryOptions({
        orderby: 'desc',
        orderByField: 'updatedAt',
        hasResults: true
      })
    );
    void queryClient.prefetchInfiniteQuery(
      trpc.scraper.infiniteResults.infiniteQueryOptions(
        {
          keywords: deps.keyword ? [deps.keyword] : undefined,
          minPrice: deps.minPrice,
          maxPrice: deps.maxPrice,
          limit: 48,
          orderby: 'desc'
        },
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
      )
    );
    return { keyword: deps.keyword };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.keyword
          ? `${loaderData.keyword} | Mercari Scraper`
          : 'Search | Mercari Scraper'
      }
    ]
  })
});
