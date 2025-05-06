import { ScraperResult, ScraperFilter, ScraperKeyword } from '@/types/scraper';
import { createStore } from 'zustand/vanilla';
import { devtools } from 'zustand/middleware';

export type ScraperState = {
  results: {
    data: ScraperResult[];
    currentPage: number;
    limit: number;
    ended: boolean;
  };
  filter: ScraperFilter;
  keywordOptions: ScraperKeyword[];
};

export type ScraperActions = {
  setResults: (results: {
    data: ScraperResult[];
    currentPage: number;
    ended: boolean;
    limit: number;
  }) => void;
  resetResults: () => void;
  setFilter: (filter: ScraperFilter) => void;
};

export type ScraperStore = ScraperState & ScraperActions;

export const defaultInitState: ScraperState = {
  results: {
    data: [],
    currentPage: 0,
    limit: 50, // TODO - make this env variable
    ended: false
  },
  filter: {
    keywords: [],
    minPrice: undefined,
    maxPrice: undefined
  },
  keywordOptions: []
};

export const createScraperStore = (
  initState: ScraperState = defaultInitState
) =>
  createStore<ScraperStore>()(
    devtools(
      (set) => ({
        ...initState,
        setResults: (results) => set({ results }),
        resetResults: () => set({ results: defaultInitState.results }),
        setFilter: (filter) => set({ filter })
      }),
      { name: 'Scraper Store' }
    )
  );
