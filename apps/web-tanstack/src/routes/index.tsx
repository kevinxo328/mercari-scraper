import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery
} from '@tanstack/react-query';
import {
  createFileRoute,
  ErrorComponent,
  useHydrated
} from '@tanstack/react-router';
import { useState } from 'react';

import TimeDisplay from '@/components/time-display';
import VirtualResultGrid from '@/components/virtual-result-grid';
import { useDeleteResult } from '@/hooks/use-delete-result';
import { useSession } from '@/lib/auth-client';
import { useTRPC } from '@/router';

function Home() {
  const trpc = useTRPC();
  const { data: lastRun } = useSuspenseQuery(
    trpc.scraper.getLastRun.queryOptions()
  );
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
  } = useSuspenseInfiniteQuery(
    trpc.scraper.infiniteResults.infiniteQueryOptions(
      {
        limit: 48,
        orderby: 'desc',
        updatedSince: lastRun?.sinceDate ?? undefined
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    )
  );

  const allItems = infiniteData.pages.flatMap((p) => p.data) ?? [];

  const isAuthenticated = !!session;

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

      <VirtualResultGrid
        items={allItems}
        status={status}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isAuthenticated={isAuthenticated}
        deletingId={deletingId}
        isDeleting={isDeleting}
        onDelete={handleDelete}
      />
    </main>
  );
}

export const Route = createFileRoute('/')({
  errorComponent: ErrorComponent,
  loader: async ({ context: { queryClient, trpc } }) => {
    const lastRun = await queryClient.ensureQueryData(
      trpc.scraper.getLastRun.queryOptions()
    );
    await queryClient.ensureInfiniteQueryData(
      trpc.scraper.infiniteResults.infiniteQueryOptions(
        {
          limit: 48,
          orderby: 'desc',
          updatedSince: lastRun?.sinceDate ?? undefined
        },
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
      )
    );
  },
  component: Home
});
