import { useInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, ErrorComponent } from '@tanstack/react-router';

import TimeDisplay from '@/components/time-display';
import VirtualResultGrid from '@/components/virtual-result-grid';
import { useTRPC } from '@/router';

function Home() {
  const trpc = useTRPC();
  const { data: lastRun } = useSuspenseQuery(
    trpc.scraper.getLastRun.queryOptions()
  );

  const latestUpdateTime = lastRun?.completedAt;
  const latestRunId = lastRun?.id;
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
        changedInRunId: latestRunId
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    )
  );

  const allItems = infiniteData?.pages.flatMap((p) => p.data) ?? [];

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
        latestRunId={latestRunId}
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
    void queryClient.prefetchInfiniteQuery(
      trpc.scraper.infiniteResults.infiniteQueryOptions(
        {
          limit: 48,
          orderby: 'desc',
          changedInRunId: lastRun?.id
        },
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
      )
    );
  },
  component: Home
});
