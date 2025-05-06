'use client';

import ScraperResultCard from './ScraperResultCard';
import { Button } from './shadcn/button';
import { Loader2 } from 'lucide-react';
import { useScraperStore } from '@/providers/scraper-store-provider';
import { Skeleton } from './shadcn/skeleton';
import { useMemo } from 'react';

const ScraperResults = () => {
  const { results, isLoadingResults, fetchResults, filter, setFilter } =
    useScraperStore((state) => state);

  const isFirstPageLoading = useMemo(
    () => isLoadingResults && filter.page === 1,
    [isLoadingResults, filter.page]
  );

  return (
    <>
      <div className="grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
        {isFirstPageLoading
          ? Array.from({ length: 24 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-lg" />
            ))
          : results.data.map((result) => (
              <ScraperResultCard
                key={result.title + result.url}
                url={result.url}
                title={result.title}
                imageUrl={result.imageUrl}
                price={result.price}
                currency={result.currency}
              />
            ))}
      </div>
      {!isFirstPageLoading && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => {
              if (results.ended) return;
              setFilter({
                ...filter,
                page: filter.page + 1
              });
              fetchResults();
            }}
            disabled={results.ended || isLoadingResults}
            variant={results.ended ? 'ghost' : 'default'}
            className="w-full cursor-pointer"
          >
            {isLoadingResults && !results.ended && (
              <Loader2 className="animate-spin" />
            )}
            {isLoadingResults
              ? 'Loading...'
              : results.ended
                ? 'No more results'
                : 'Load more'}
          </Button>
        </div>
      )}
    </>
  );
};

export default ScraperResults;
