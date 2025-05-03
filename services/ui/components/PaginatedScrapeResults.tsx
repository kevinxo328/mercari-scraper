'use client';

import { useEffect, useState } from 'react';
import ScrapeResultCard from './ScrapeResultCard';
import { Button } from './shadcn/button';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type ScrapeResult = {
  id: string;
  url: string;
  title: string;
  imageUrl: string;
  price: number;
  currency: string;
};

type Props = {
  initialResults: ScrapeResult[];
  limit: number;
};

const PaginatedScrapeResults = ({ initialResults, limit }: Props) => {
  const [scrapeResults, setScrapeResults] =
    useState<ScrapeResult[]>(initialResults);
  const searchParams = useSearchParams();
  const keywords = searchParams.get('keywords');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const [isEndOfResults, setEndOfResults] = useState(false);
  const [isLoading, setLoading] = useState(false);

  // If initialResults is empty, set page to 0. Otherwise, set it to 1.
  // This is to prevent the first page from being fetched when the component mounts.
  const [page, setPage] = useState<number>(initialResults.length > 0 ? 1 : 0);

  const fetchScrapeResults = async ({
    page,
    keywords,
    minPrice,
    maxPrice
  }: {
    page: number;
    keywords: string;
    minPrice: number;
    maxPrice: number;
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

      setEndOfResults(data.length < limit);
      setScrapeResults((prev) => [...prev, ...data]);
    } catch (error) {
      console.error('Error fetching scrape results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === 0) {
      setPage(1); // Set page to 1 if initialResults is empty
    } else if ((page === 1 && scrapeResults.length === 0) || page > 1) {
      fetchScrapeResults({
        page,
        keywords: keywords || '',
        minPrice: Number(minPrice) || 0,
        maxPrice: Number(maxPrice) || 0
      });
    }
  }, [page]);

  return (
    <>
      <div className="grid @max-[400px]:grid-cols-2 grid-cols-3 lg:grid-cols-6 gap-6">
        {scrapeResults.map((result) => (
          <ScrapeResultCard
            key={result.id}
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
            if (isEndOfResults) return;
            setPage((prev) => prev + 1);
          }}
          disabled={isEndOfResults || isLoading}
          variant={isEndOfResults ? 'ghost' : 'default'}
          className="w-full cursor-pointer"
        >
          {isLoading && !isEndOfResults && <Loader2 className="animate-spin" />}
          {isLoading
            ? 'Loading...'
            : isEndOfResults
              ? 'No more results'
              : 'Load more'}
        </Button>
      </div>
    </>
  );
};

export default PaginatedScrapeResults;
