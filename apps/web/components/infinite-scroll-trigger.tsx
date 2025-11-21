'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type InfiniteScrollTriggerProps = {
  onLoadMore: () => void | Promise<unknown>;
  hasNextPage?: boolean;
  isLoading?: boolean;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  idleContent?: ReactNode;
  loadingContent?: ReactNode;
  endContent?: ReactNode;
};

export default function InfiniteScrollTrigger({
  onLoadMore,
  hasNextPage = false,
  isLoading = false,
  rootMargin = '200px 0px',
  threshold = 0,
  className,
  idleContent = 'Scroll down to load more',
  loadingContent = 'Loading…',
  endContent = 'No more results'
}: InfiniteScrollTriggerProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isLoading) {
          onLoadMore();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasNextPage, isLoading, onLoadMore, rootMargin, threshold]);

  return (
    <div
      ref={sentinelRef}
      className={cn(
        'flex w-full items-center justify-center text-sm text-muted-foreground',
        className
      )}
    >
      {isLoading ? loadingContent : hasNextPage ? idleContent : endContent}
    </div>
  );
}
