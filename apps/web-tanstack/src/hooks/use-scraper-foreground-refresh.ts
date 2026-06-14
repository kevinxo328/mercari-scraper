import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useTRPC } from '@/router';

const MIN_REFRESH_INTERVAL_MS = 1000;

export function useScraperForegroundRefresh() {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    const refreshScraperQueries = () => {
      const now = Date.now();

      if (now - lastRefreshAtRef.current < MIN_REFRESH_INTERVAL_MS) {
        return;
      }

      lastRefreshAtRef.current = now;
      void queryClient.invalidateQueries(trpc.scraper.getLastRun.pathFilter());
      void queryClient.invalidateQueries(
        trpc.scraper.infiniteResults.pathFilter()
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshScraperQueries();
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        refreshScraperQueries();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [queryClient, trpc]);
}
