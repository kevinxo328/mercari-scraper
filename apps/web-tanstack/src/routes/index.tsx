import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { createFileRoute, useHydrated } from '@tanstack/react-router';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef, useState } from 'react';

import LinkCard from '@/components/link-card';
import { Skeleton } from '@/components/shadcn/skeleton';
import TimeDisplay from '@/components/time-display';
import { useDeleteResult } from '@/hooks/use-delete-result';
import { useSession } from '@/lib/auth-client';
import { trpc } from '@/router';

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

function Home() {
  const { data: lastRun } = useQuery(trpc.scraper.getLastRun.queryOptions());
  const colCount = useColCount();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { deleteResult, isDeleting } = useDeleteResult();
  const { data: session } = useSession();
  const isHydrated = useHydrated();

  const latestUpdateTime = lastRun?.completedAt;
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery(
    trpc.scraper.infiniteResults.infiniteQueryOptions(
      {
        limit: 48,
        orderby: 'desc',
        updatedSince: lastRun?.sinceDate ?? undefined
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    )
  );

  const allItems = infiniteData?.pages.flatMap((p) => p.data) ?? [];
  const rowCount = Math.ceil(allItems.length / colCount);

  const listRef = useRef<HTMLDivElement>(null);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 220,
    overscan: 4,
    scrollMargin: listRef.current?.offsetTop ?? 0
  });

  const virtualItems = virtualizer.getVirtualItems();
  const isAuthenticated = !!session;

  // Trigger next page when near the end
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const last = virtualItems[virtualItems.length - 1];
    if (last && last.index >= rowCount - 4) {
      fetchNextPage();
    }
  }, [virtualItems, rowCount, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
    <main className="mx-auto p-4 container relative">
      <div className="flex justify-end items-center mb-4">
        <div className="flex flex-col md:flex-row md:gap-2 md:items-baseline text-xs md:text-sm dark:text-gray-400">
          <span>Last Updated</span>
          <TimeDisplay timestamp={latestUpdateTime} />
        </div>
      </div>

      {status === 'pending' && (
        <div className="grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <p className="text-center text-red-500">Error loading results.</p>
      )}

      {status === 'success' && allItems.length === 0 && (
        <p className="text-center text-gray-500">No results found</p>
      )}

      {status === 'success' && allItems.length > 0 && (
        <div
          ref={listRef}
          style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
        >
          {virtualItems.map((vRow) => {
            const startIdx = vRow.index * colCount;
            const rowItems = allItems.slice(startIdx, startIdx + colCount);

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
                      key={result.id}
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
    </main>
  );
}

export const Route = createFileRoute('/')({
  component: Home
});
