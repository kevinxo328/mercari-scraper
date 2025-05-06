'use client';

import { useEffect, useState } from 'react';
import ScraperResultCard from './ScraperResultCard';
import { Button } from './shadcn/button';
import { Loader2 } from 'lucide-react';
import { useScraperStore } from '@/providers/scraper-store-provider';

const ScraperResults = () => {
  const { results, filter, setResults } = useScraperStore((state) => state);
  const [isLoading, setLoading] = useState(false);

  const fetchScrapeResults = async ({
    page,
    keywords,
    minPrice,
    maxPrice,
    limit
  }: {
    page: number;
    keywords: string;
    minPrice: number;
    maxPrice: number;
    limit: number;
  }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (keywords) {
        params.append('keywords', keywords);
      }
      if (minPrice) {
        params.append('minPrice', minPrice.toString());
      }
      if (maxPrice) {
        params.append('maxPrice', maxPrice.toString());
      }
      const response = await fetch(`/api/scrape/results?${params.toString()}`);
      const data = await response.json();

      setResults({
        data: [...results.data, ...data],
        currentPage: page,
        limit,
        ended: data.length < limit
      });
    } catch (error) {
      console.error('Error fetching scrape results:', error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   console.log('change');

  //   if (page === 0) {
  //     setPage(1); // Set page to 1 if initialResults is empty
  //   } else if ((page === 1 && results.length === 0) || page > 1) {
  //     fetchScrapeResults({
  //       page,
  //       keywords: filter.keywords.join(', '),
  //       minPrice: Number(filter.minPrice) || 0,
  //       maxPrice: Number(filter.maxPrice) || 0
  //     });
  //   }
  // }, [page, filter]);

  return (
    <>
      <div className="grid @max-[400px]:grid-cols-2 grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
        {results.data.map((result) => (
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

      <div className="flex justify-center mt-4">
        <Button
          onClick={() => {
            if (results.ended) return;
            fetchScrapeResults({
              page: results.currentPage + 1,
              keywords: filter.keywords.join(', '),
              minPrice: Number(filter.minPrice) || 0,
              maxPrice: Number(filter.maxPrice) || 0,
              limit: results.limit
            });
          }}
          disabled={results.ended || isLoading}
          variant={results.ended ? 'ghost' : 'default'}
          className="w-full cursor-pointer"
        >
          {isLoading && !results.ended && <Loader2 className="animate-spin" />}
          {isLoading
            ? 'Loading...'
            : results.ended
              ? 'No more results'
              : 'Load more'}
        </Button>
      </div>
    </>
  );
};

export default ScraperResults;
