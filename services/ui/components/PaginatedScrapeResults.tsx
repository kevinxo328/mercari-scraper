'use client';

import { useEffect, useState } from 'react';
import ScrapeResultCard from './ScrapeResultCard';

const LIMIT = 50;

type ScrapeResult = {
  id: string;
  url: string;
  title: string;
  imageUrl: string;
  price: number;
  currency: string;
};

const PaginatedScrapeResults = () => {
  const [scrapeResults, setScrapeResults] = useState<ScrapeResult[]>([]);
  const [page, setPage] = useState(1);
  const [isEndOfResults, setEndOfResults] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const fetchScrapeResults = async ({ page }: { page: number }) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/scrape/results?page=${page}&limit=${LIMIT}`
      );
      const data = await response.json();

      setEndOfResults(data.length < LIMIT);
      setScrapeResults((prev) => [...prev, ...data]);
    } catch (error) {
      console.error('Error fetching scrape results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScrapeResults({ page });
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
        <button
          className="w-full bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:bg-transparent"
          onClick={() => {
            if (!isEndOfResults) {
              setPage((prev) => prev + 1);
            }
          }}
          disabled={isEndOfResults || isLoading}
        >
          {isLoading
            ? 'Loading...'
            : isEndOfResults
              ? 'No more results'
              : 'Load more'}
        </button>
      </div>
    </>
  );
};

export default PaginatedScrapeResults;
