import { ScraperResult, ScraperFilter, ScraperKeyword } from '@/types/scraper';
import { createStore } from 'zustand/vanilla';
import { devtools } from 'zustand/middleware';

export type ScraperState = {
  results: {
    data: ScraperResult[];
    ended: boolean;
  };
  isLoadingResults: boolean;
  filter: ScraperFilter;
  keywordOptions: ScraperKeyword[];
  isLoadingKeywordOptions: boolean;
};

export type ScraperActions = {
  fetchResults: () => Promise<void>;
  setFilter: (filter: ScraperFilter) => void;
  fetchKeywordOptions: () => Promise<void>;
};

export type ScraperStore = ScraperState & ScraperActions;

export const defaultInitState: ScraperState = {
  results: {
    data: [],
    ended: false
  },
  isLoadingResults: false,
  filter: {
    keywords: [],
    minPrice: undefined,
    maxPrice: undefined,
    page: 1,
    limit: 50 // TODO - make this env variable
  },
  keywordOptions: [],
  isLoadingKeywordOptions: false
};

export const createScraperStore = (
  initState: ScraperState = defaultInitState
) =>
  createStore<ScraperStore>()(
    devtools(
      (set, get) => ({
        ...initState,
        fetchResults: async () => {
          set({ isLoadingResults: true });
          const { keywords, minPrice, maxPrice, limit, page } = get().filter;
          const params = new URLSearchParams();
          params.append('page', page.toString());
          params.append('limit', limit.toString());
          if (keywords.length > 0) {
            params.append('keywords', keywords.join(','));
          }
          if (minPrice) {
            params.append('minPrice', minPrice.toString());
          }
          if (maxPrice) {
            params.append('maxPrice', maxPrice.toString());
          }
          try {
            const response = await fetch(
              `/api/scrape/results?${params.toString()}`
            );
            const data = await response.json();

            const results = {
              data: page === 1 ? data : [...get().results.data, ...data],
              ended: data.length < limit,
              limit,
              currentPage: page
            };

            set({ results: { ...results } });
          } catch (error) {
            console.error('Error fetching results:', error);
          } finally {
            set({ isLoadingResults: false });
          }
        },
        setFilter: (filter) => set({ filter }),
        fetchKeywordOptions: async () => {
          set({ isLoadingKeywordOptions: true });
          try {
            const response = await fetch('/api/scrape/keywords');
            const data = await response.json();
            set({ keywordOptions: data });
          } catch (error) {
            console.error('Error fetching keyword options:', error);
          } finally {
            set({ isLoadingKeywordOptions: false });
          }
        }
      }),
      { name: 'Scraper Store' }
    )
  );
