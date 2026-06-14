import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useScraperForegroundRefresh } from './use-scraper-foreground-refresh';

const pathFilters = {
  lastRun: { queryKey: ['scraper', 'getLastRun'] },
  infiniteResults: { queryKey: ['scraper', 'infiniteResults'] }
};

vi.mock('@/router', () => ({
  useTRPC: () => ({
    scraper: {
      getLastRun: {
        pathFilter: () => pathFilters.lastRun
      },
      infiniteResults: {
        pathFilter: () => pathFilters.infiniteResults
      }
    }
  })
}));

describe('useScraperForegroundRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('refreshes scraper queries when the app returns to the foreground', () => {
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => useScraperForegroundRefresh(), { wrapper });

    vi.setSystemTime(new Date('2026-06-15T00:00:02.000Z'));
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');

    document.dispatchEvent(new Event('visibilitychange'));

    expect(invalidateQueries).toHaveBeenCalledWith(pathFilters.lastRun);
    expect(invalidateQueries).toHaveBeenCalledWith(pathFilters.infiniteResults);
  });

  it('does not double refresh for duplicate foreground events', () => {
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => useScraperForegroundRefresh(), { wrapper });

    vi.setSystemTime(new Date('2026-06-15T00:00:02.000Z'));
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');

    document.dispatchEvent(new Event('visibilitychange'));
    const pageShowEvent = new Event('pageshow') as PageTransitionEvent;
    Object.defineProperty(pageShowEvent, 'persisted', { value: true });

    window.dispatchEvent(pageShowEvent);

    expect(invalidateQueries).toHaveBeenCalledTimes(2);
  });
});
