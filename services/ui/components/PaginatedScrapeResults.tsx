'use client';

import { useEffect, useState } from 'react';
import ScrapeResultCard from './ScrapeResultCard';

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
  const [isEndOfResults, setEndOfResults] = useState(false);
  const [isLoading, setLoading] = useState(false);

  // If initialResults is empty, set page to 0. Otherwise, set it to 1.
  // This is to prevent the first page from being fetched when the component mounts.
  const [page, setPage] = useState<number>(initialResults.length > 0 ? 1 : 0);

  const fetchScrapeResults = async ({ page }: { page: number }) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/scrape/results?page=${page}&limit=${limit}`
      );
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
      fetchScrapeResults({ page });
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
