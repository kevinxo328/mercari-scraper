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
import { deepEqual } from '@/utils/utils';
import { redirect, useRouter } from 'next/navigation';

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
  const router = useRouter();

  if (!storeRef.current) {
    storeRef.current = createScraperStore(initialState);
  }

  // Subscribe to the store and update the URL when the filter changes
  useEffect(() => {
    const unsubscribe = storeRef.current?.subscribe((state, prevState) => {
      if (!deepEqual(state.filter, prevState.filter)) {
        const params = new URLSearchParams();
        if (state.filter.keywords.length > 0) {
          params.append('keywords', state.filter.keywords.join(','));
        }
        if (state.filter.minPrice !== undefined) {
          params.append('minPrice', state.filter.minPrice.toString());
        }
        if (state.filter.maxPrice !== undefined) {
          params.append('maxPrice', state.filter.maxPrice.toString());
        }

        router.push(`?${params.toString()}`);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [router]);

  // If initialState is changed, reset the store
  useEffect(() => {
    if (initialState) {
      const currentState = storeRef.current?.getState();
      if (!deepEqual(currentState, initialState)) {
        storeRef.current?.setState(initialState);
      }
    }
  }, [initialState]);

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
