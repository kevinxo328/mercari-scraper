'use client';

import {
  type ReactNode,
  createContext,
  useRef,
  useContext,
  useEffect
} from 'react';
import { useStore } from 'zustand';
import {
  createScraperStore,
  ScraperState,
  type ScraperStore
} from '@/stores/scraper-store';
import { useSearchParams } from 'next/navigation';
import { initMocks } from '@/mocks';

// TODO: Currently, there is no official best practice for integrating MSW with Next.js 15 + app router.
// This is a temporary solution to enable API mocking in both server and client environments.
// Reference: https://blog.stackademic.com/setting-up-msw-and-urql-with-next-js-15-cbfd374e916a
initMocks();

export type ScraperApi = ReturnType<typeof createScraperStore>;

export const ScraperContext = createContext<ScraperApi | null>(null);

export interface ScraperProviderProps {
  children: ReactNode;
  initialState?: ScraperState;
}

export const ScraperProvider = ({
  children,
  initialState
}: ScraperProviderProps) => {
  const storeRef = useRef<ScraperApi | null>(null);
  const searchParams = useSearchParams();

  if (!storeRef.current) {
    storeRef.current = createScraperStore(initialState);
  }

  // Set the initial filter state based on the URL parameters
  useEffect(() => {
    const keywords = searchParams.get('keywords');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const filter = {
      keywords: keywords
        ? keywords.split(',').map((keyword) => keyword.trim())
        : [],
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: 1,
      limit: 50 // TODO - make this env variable
    };

    storeRef.current?.getState().setFilter(filter);
    storeRef.current?.getState().fetchResults();
  }, []);

  return (
    <ScraperContext.Provider value={storeRef.current}>
      {children}
    </ScraperContext.Provider>
  );
};

export const useScraperStore = <T,>(
  selector: (state: ScraperStore) => T
): T => {
  const store = useContext(ScraperContext);

  if (!store) {
    throw new Error('useScraperStore must be used within a ScraperProvider');
  }

  return useStore(store, selector);
};
