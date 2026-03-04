'use client';
/* eslint-env browser */

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/shadcn/button';
import ScraperSearchForm, {
  ScraperFormValues
} from '@/components/form/scraper-search-form';
import {
  useQueryState,
  parseAsArrayOf,
  parseAsString,
  parseAsInteger
} from 'nuqs';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import LinkCard from '@/components/link-card';
import { Skeleton } from '@/components/shadcn/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/shadcn/sheet';
import { Funnel } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useDeleteResult } from '@/hooks/use-delete-result';
import { useVirtualizer } from '@tanstack/react-virtual';

function useColCount() {
  const [cols, setCols] = useState(2);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1280) setCols(6);
      else if (w >= 768) setCols(4);
      else if (w >= 400) setCols(3);
      else setCols(2);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return cols;
}

export default function SearchPageClient() {
  const formRef = useRef<HTMLFormElement>(null);
  const mobileFormRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const session = useSession();
  const colCount = useColCount();

  const trpc = useTRPC();
  const [keywords, setKeywords] = useQueryState(
    'keywords',
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [minPrice, setMinPrice] = useQueryState('minPrice', parseAsInteger);
  const [maxPrice, setMaxPrice] = useQueryState('maxPrice', parseAsInteger);

  const { data: keywordOptions } = useQuery(
    trpc.scraper.getKeywords.queryOptions({
      orderby: 'desc',
      orderByField: 'updatedAt',
      hasResults: true
    })
  );

  const {
    data: infiniteResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status: resultsStatus
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
  const { deleteResult, isDeleting } = useDeleteResult();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAuthenticated = session.status === 'authenticated';

  const allItems = infiniteResults?.pages.flatMap((p) => p.data) ?? [];
  const rowCount = Math.ceil(allItems.length / colCount);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 220,
    overscan: 4
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const last = virtualItems[virtualItems.length - 1];
    if (last && last.index >= rowCount - 4) {
      fetchNextPage();
    }
  }, [virtualItems, rowCount, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const triggerSubmit = () => {
    const width =
      typeof window !== 'undefined' && typeof window.innerWidth === 'number'
        ? window.innerWidth
        : undefined;
    const targetForm =
      width !== undefined && width < 1024
        ? mobileFormRef.current
        : formRef.current;

    targetForm?.dispatchEvent(
      new Event('submit', { cancelable: true, bubbles: true })
    );
  };

  const handleSubmit = (data: ScraperFormValues) => {
    setKeywords(data.keywords);
    setMinPrice(data.minPrice);
    setMaxPrice(data.maxPrice);
  };

  const handleDelete = async (id: string) => {
    const shouldDelete =
      typeof window !== 'undefined' && typeof window.confirm === 'function'
        ? window.confirm('Are you sure you want to delete this item?')
        : true;

    if (!shouldDelete) return;

    setDeletingId(id);
    try {
      await deleteResult(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="container relative mx-auto flex flex-1 gap-4 p-4 min-h-0 overflow-hidden">
      <div className="flex min-h-0 grow flex-col overflow-hidden lg:pr-2">
        <div className="flex items-center justify-between py-2 mb-2 md:mb-4 bg-background">
          <h4 className="text-xl md:text-3xl font-semibold">Results</h4>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                <Button
                  onClick={() => {
                    triggerSubmit();
                    setIsSheetOpen(false);
                  }}
                  className="mt-4"
                >
                  Apply
                </Button>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto pr-2 [scrollbar-gutter:stable]"
        >
          {resultsStatus === 'pending' ? (
            <div className="grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
              {Array.from({ length: 24 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : resultsStatus === 'error' ? (
            <p className="text-center text-red-500">Error loading results.</p>
          ) : (
            <>
              {allItems.length === 0 && (
                <p className="text-center text-gray-500">No results found</p>
              )}
              {allItems.length > 0 && (
                <div
                  style={{
                    height: virtualizer.getTotalSize(),
                    position: 'relative'
                  }}
                >
                  {virtualItems.map((vRow) => {
                    const startIdx = vRow.index * colCount;
                    const rowItems = allItems.slice(
                      startIdx,
                      startIdx + colCount
                    );

                    return (
                      <div
                        key={vRow.key}
                        data-index={vRow.index}
                        ref={virtualizer.measureElement}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          transform: `translateY(${vRow.start}px)`
                        }}
                      >
                        <div className="grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6 pb-6">
                          {rowItems.map((result) => (
                            <LinkCard
                              key={result.id ?? result.title + result.url}
                              showDelete={isAuthenticated}
                              isDeleting={
                                deletingId === result.id && isDeleting
                              }
                              onDelete={() => handleDelete(result.id)}
                              url={result.url}
                              title={result.title}
                              imageUrl={result.imageUrl}
                              price={result.price}
                              currency={result.currency}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {isFetchingNextPage && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Loading…
                </p>
              )}
              {!hasNextPage && allItems.length > 0 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  No more results
                </p>
              )}
            </>
          )}
        </div>
      </div>
      <aside className="w-[300px] h-full shrink-0 grow-0 hidden lg:flex flex-col gap-4 overflow-y-auto">
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
