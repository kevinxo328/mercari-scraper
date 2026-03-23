import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  useElementScrollRestoration,
  useHydrated,
  useNavigate
} from '@tanstack/react-router';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Funnel } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';

import ScraperSearchForm, {
  ScraperFormValues
} from '@/components/forms/scraper-search-form';
import LinkCard from '@/components/link-card';
import { Button } from '@/components/shadcn/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/shadcn/sheet';
import { Skeleton } from '@/components/shadcn/skeleton';
import { useDeleteResult } from '@/hooks/use-delete-result';
import { useSession } from '@/lib/auth-client';
import { trpc } from '@/router';

const searchSchema = z.object({
  keyword: z.string().optional().catch(undefined),
  minPrice: z.number().optional().catch(undefined),
  maxPrice: z.number().optional().catch(undefined)
});

export const Route = createFileRoute('/_public/search')({
  validateSearch: searchSchema,
  component: RouteComponent
});

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

export default function RouteComponent() {
  const formRef = useRef<HTMLFormElement>(null);
  const mobileFormRef = useRef<HTMLFormElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const scrollEntry = useElementScrollRestoration({
    getElement: () => (typeof window !== 'undefined' ? window : undefined)
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { data: session } = useSession();
  const colCount = useColCount();
  const isHydrated = useHydrated();
  const navigate = useNavigate({ from: Route.fullPath });
  const { keyword, minPrice, maxPrice } = Route.useSearch();

  const { data: keywordOptionsData } = useQuery(
    trpc.scraper.getKeywords.queryOptions({
      orderby: 'desc',
      orderByField: 'updatedAt',
      hasResults: true
    })
  );
  const keywordOptions = keywordOptionsData
    ? {
        ...keywordOptionsData,
        data: [...keywordOptionsData.data].sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return a.keyword.localeCompare(b.keyword);
        })
      }
    : undefined;

  const {
    data: infiniteResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status: resultsStatus
  } = useInfiniteQuery(
    trpc.scraper.infiniteResults.infiniteQueryOptions(
      {
        keywords: keyword ? [keyword] : undefined,
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

  const isAuthenticated = !!session;

  const allItems = infiniteResults?.pages.flatMap((p) => p.data) ?? [];
  const rowCount = Math.ceil(allItems.length / colCount);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 220,
    overscan: 4,
    scrollMargin: listRef.current?.offsetTop ?? 0,
    initialOffset: scrollEntry?.scrollY
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
    const width = isHydrated ? window.innerWidth : undefined;
    const targetForm =
      width !== undefined && width < 1024
        ? mobileFormRef.current
        : formRef.current;

    targetForm?.dispatchEvent(
      new Event('submit', { cancelable: true, bubbles: true })
    );
  };

  const handleSubmit = (data: ScraperFormValues) => {
    navigate({
      resetScroll: true,
      search: {
        keyword: data.keyword || undefined,
        minPrice: data.minPrice ?? undefined,
        maxPrice: data.maxPrice ?? undefined
      }
    });
  };

  const handleDelete = async (id: string) => {
    const shouldDelete = isHydrated
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
    <main className="container relative mx-auto flex gap-4 p-4">
      <div className="grow">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-xl md:text-3xl font-semibold">Results</h4>
        </div>

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
                ref={listRef}
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
                        transform: `translateY(${vRow.start - virtualizer.options.scrollMargin}px)`
                      }}
                    >
                      <div className="grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6 pb-6">
                        {rowItems.map((result) => (
                          <LinkCard
                            key={result.id ?? result.title + result.url}
                            showDelete={isAuthenticated}
                            isDeleting={deletingId === result.id && isDeleting}
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

      {/* Desktop sidebar filter - sticky */}
      <aside className="w-75 shrink-0 hidden lg:flex flex-col gap-4 sticky top-16 self-start">
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
            keyword,
            minPrice,
            maxPrice
          }}
          keywordOptions={keywordOptions?.data}
        />
      </aside>

      {/* Mobile FAB + Sheet filter */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 z-30 rounded-full shadow-lg lg:hidden h-14 w-14"
            size="icon"
          >
            <Funnel className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-2xl font-semibold">Filter</SheetTitle>
            <SheetDescription className="sr-only">
              Filter results by keywords and price range.
            </SheetDescription>
            <hr />
            <ScraperSearchForm
              ref={mobileFormRef}
              onSubmit={handleSubmit}
              defaultValues={{
                keyword,
                minPrice,
                maxPrice
              }}
              keywordOptions={keywordOptions?.data}
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
    </main>
  );
}
