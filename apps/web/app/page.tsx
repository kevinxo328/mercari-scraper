import ScraperResultCard from '@/components/ScraperResultCard';
import TimeDisplay from '@/components/TimeDisplay';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { caller } from '@/trpc/server';
import React from 'react';
import { MoveRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const keywords = await caller.scraper.getKeywords({
    pageSize: 5,
    page: 1,
    orderby: 'desc'
  });

  const promises = keywords.map((keyword) =>
    caller.scraper.getResults({
      keywords: [keyword.keyword],
      pageSize: 12,
      page: 1,
      orderby: 'desc'
    })
  );

  const latestResults = await Promise.all(promises);

  const latestUpdateTime = keywords[0]?.updatedAt ?? 'N/A';

  return (
    <main className="mx-auto p-4 container relative">
      <div className="flex justify-end items-center mb-4">
        <div className="flex flex-col md:flex-row md:gap-2 md:items-baseline text-xs md:text-sm dark:text-gray-400">
          <span>Last Updated</span>
          <TimeDisplay timestamp={latestUpdateTime} />
        </div>
        {/* <Link href="/search" className="flex items-center gap-2">
          <Search className="size-4" /> Search
        </Link> */}
      </div>
      {latestResults.length === 0 && (
        <p className="text-center text-gray-500">No results found</p>
      )}
      {latestResults.length > 0 &&
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
              {results.map((result) => (
                <ScraperResultCard
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
