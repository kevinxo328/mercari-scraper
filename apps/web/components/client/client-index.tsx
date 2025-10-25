'use client';

import { useTRPC } from '@/trpc/client';
import TimeDisplay from '../time-display';
import { useQuery, useQueries } from '@tanstack/react-query';
import React from 'react';
import Link from 'next/link';
import { MoveRight } from 'lucide-react';
import LinkCard from '../link-card';
import { Skeleton } from '../shadcn/skeleton';

const ITEMS_PER_PAGE = 12;

export default function ClientIndex() {
  const trpc = useTRPC();

  const { data: keywords, isPending } = useQuery(
    trpc.scraper.getKeywords.queryOptions({
      pageSize: 5,
      page: 1,
      orderby: 'desc'
    })
  );

  const latestUpdateTime = keywords?.[0]?.updatedAt ?? 'N/A';

  const resultQueries = useQueries({
    queries:
      keywords?.map((keyword) =>
        trpc.scraper.getResults.queryOptions({
          keywords: [keyword.keyword],
          pageSize: ITEMS_PER_PAGE,
          page: 1,
          orderby: 'desc'
        })
      ) || []
  });

  const latestResults = resultQueries.map((query) => query.data || []);

  return (
    <main className="mx-auto p-4 container relative">
      <div className="flex justify-end items-center mb-4">
        <div className="flex flex-col md:flex-row md:gap-2 md:items-baseline text-xs md:text-sm dark:text-gray-400">
          <span>Last Updated</span>
          <TimeDisplay timestamp={latestUpdateTime} />
        </div>
      </div>
      {isPending && (
        <div className="flex grow-1 h-full w-full items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      )}
      {!isPending && latestResults.length === 0 && (
        <p className="text-center text-gray-500">No results found</p>
      )}
      {keywords &&
        latestResults.length > 0 &&
        latestResults.map((results, index) => (
          <React.Fragment key={index}>
            <div className="flex justify-between align-baseline mt-8 mb-2">
              <h5 className="text-xl font-semibold">
                {keywords[index]?.keyword}
              </h5>
              <Link
                href={`/search?keywords=${encodeURIComponent(
                  keywords[index]?.keyword ?? ''
                )}`}
                className="text-sm flex items-center gap-1"
              >
                View More
                <MoveRight className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
              {results.length === 0 &&
                Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              {results.map((result) => (
                <LinkCard
                  key={result.id}
                  url={result.url}
                  title={result.title}
                  imageUrl={result.imageUrl}
                  price={result.price}
                  currency={result.currency}
                />
              ))}
            </div>
          </React.Fragment>
        ))}
    </main>
  );
}
