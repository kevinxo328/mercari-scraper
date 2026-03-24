import {
  useElementScrollRestoration,
  useHydrated
} from '@tanstack/react-router';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef } from 'react';

import LinkCard from '@/components/link-card';
import { Skeleton } from '@/components/shadcn/skeleton';
import { useColCount } from '@/hooks/use-col-count';

type ResultItem = {
  id: string;
  url: string;
  title: string;
  imageUrl: string;
  price: number;
  currency: string;
};

type Props = {
  items: ResultItem[];
  status: 'pending' | 'error' | 'success';
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isAuthenticated: boolean;
  deletingId: string | null;
  isDeleting: boolean;
  onDelete: (id: string) => void;
};

export default function VirtualResultGrid({
  items,
  status,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  isAuthenticated,
  deletingId,
  isDeleting,
  onDelete
}: Props) {
  const colCount = useColCount();
  const isHydrated = useHydrated();
  const listRef = useRef<HTMLDivElement>(null);
  const scrollEntry = useElementScrollRestoration({
    getElement: () => (isHydrated ? window : null)
  });

  const rowCount = Math.ceil(items.length / colCount);

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

  if (status === 'pending') {
    return (
      <div className="grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
        {Array.from({ length: 24 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return <p className="text-center text-red-500">Error loading results.</p>;
  }

  return (
    <>
      {items.length === 0 && (
        <p className="text-center text-gray-500">No results found</p>
      )}
      {items.length > 0 && (
        <div
          ref={listRef}
          style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
        >
          {virtualItems.map((vRow) => {
            const startIdx = vRow.index * colCount;
            const rowItems = items.slice(startIdx, startIdx + colCount);

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
                      onDelete={() => onDelete(result.id)}
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
      {!hasNextPage && items.length > 0 && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          No more results
        </p>
      )}
    </>
  );
}
