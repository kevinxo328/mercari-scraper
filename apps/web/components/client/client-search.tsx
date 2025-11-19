'use client';

import { useRef } from 'react';
import { Button } from '../shadcn/button';
import ScraperSearchForm, {
  ScraperFormValues
} from '../form/scraper-search-form';
import {
  useQueryState,
  parseAsArrayOf,
  parseAsString,
  parseAsInteger
} from 'nuqs';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import LinkCard from '../link-card';
import { Skeleton } from '../shadcn/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '../shadcn/sheet';
import { Funnel } from 'lucide-react';

export default function ClientSearch() {
  const formRef = useRef<HTMLFormElement>(null);
  const mobileFormRef = useRef<HTMLFormElement>(null);

  const trpc = useTRPC();
  const [keywords, setKeywords] = useQueryState(
    'keywords',
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [minPrice, setMinPrice] = useQueryState('minPrice', parseAsInteger);
  const [maxPrice, setMaxPrice] = useQueryState('maxPrice', parseAsInteger);

  const { data: keywordOptions } = useQuery(
    trpc.scraper.getKeywords.queryOptions({
      pageSize: 5,
      page: 1,
      orderby: 'desc',
      orderByField: 'updatedAt'
    })
  );

  const {
    data: infiniteResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery(
    trpc.scraper.infiniteResults.infiniteQueryOptions(
      {
        keywords,
        minPrice: minPrice,
        maxPrice: maxPrice,
        limit: 48,
        orderby: 'desc'
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor
      }
    )
  );

  const triggerSubmit = () => {
    // This makes sure that the form is submitted through react-hook-form
    // and not the default HTML form submission.
    window.innerWidth < 1024
      ? mobileFormRef.current?.dispatchEvent(
          new Event('submit', { cancelable: true, bubbles: true })
        )
      : formRef.current?.dispatchEvent(
          new Event('submit', { cancelable: true, bubbles: true })
        );
  };

  const handleSubmit = (data: ScraperFormValues) => {
    setKeywords(data.keywords);
    setMinPrice(data.minPrice);
    setMaxPrice(data.maxPrice);
  };

  return (
    <main className="mx-auto p-4 container flex gap-4 relative">
      <div className="grow-1">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl md:text-3xl font-semibold">Results</h4>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                className="cursor-pointer lg:hidden"
                variant="outline"
                size="sm"
              >
                <Funnel className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="text-2xl font-semibold">
                  Filter
                </SheetTitle>
                <ScraperSearchForm
                  ref={mobileFormRef}
                  onSubmit={handleSubmit}
                  defaultValues={{
                    keywords,
                    minPrice,
                    maxPrice
                  }}
                  keywordOptions={keywordOptions?.data ?? []}
                />
                <Button onClick={() => triggerSubmit()} className="mt-4">
                  Apply
                </Button>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
        {status === 'pending' ? (
          <div className="grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
            {Array.from({ length: 24 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : status === 'error' ? (
          <p className="col-span-full text-center text-red-500">
            Error loading results.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
              {infiniteResults?.pages.map((page) =>
                page.data.map((result) => (
                  <LinkCard
                    key={result.title + result.url}
                    url={result.url}
                    title={result.title}
                    imageUrl={result.imageUrl}
                    price={result.price}
                    currency={result.currency}
                  />
                ))
              )}
            </div>
            <div className="mt-8">
              <Button
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
                className="w-full"
              >
                {isFetchingNextPage
                  ? 'Loading...'
                  : hasNextPage
                    ? 'Load More'
                    : 'No More Results'}
              </Button>
            </div>
          </>
        )}
      </div>
      <aside className="w-[300px] shrink-0 grow-0 hidden lg:flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h5 className="text-xl text-gray-400 font-semibold">Filter</h5>
          <Button
            onClick={() => triggerSubmit()}
            variant="outline"
            className="cursor-pointer"
            size="sm"
          >
            Apply
          </Button>
        </div>
        <hr />
        <ScraperSearchForm
          ref={formRef}
          onSubmit={handleSubmit}
          defaultValues={{
            keywords,
            minPrice,
            maxPrice
          }}
          keywordOptions={keywordOptions?.data ?? []}
        />
      </aside>
    </main>
  );
}
