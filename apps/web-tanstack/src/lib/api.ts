import { ScraperFilter } from '@/types/scraper';

const API = {
  scraperResults: {
    get(filter?: Partial<ScraperFilter>) {
      const result = {
        endpoint: '/api/scraper/results',
        method: 'GET'
      };

      if (filter !== undefined) {
        const params = new URLSearchParams();
        const { keywords, minPrice, maxPrice, limit, page } = filter;
        if (page) {
          params.append('page', page.toString());
        }
        if (limit) {
          params.append('limit', limit.toString());
        }
        if (Array.isArray(keywords) && keywords.length > 0) {
          params.append('keywords', keywords.join(','));
        }
        if (minPrice) {
          params.append('minPrice', minPrice.toString());
        }
        if (maxPrice) {
          params.append('maxPrice', maxPrice.toString());
        }

        result.endpoint = `/api/scraper/results${params.toString() ? `?${params.toString()}` : ''}`;
      }

      return result;
    }
  },
  scraperKeywords: {
    get() {
      return {
        endpoint: '/api/scraper/keywords',
        method: 'GET'
      };
    }
  }
};

// This is a proxy to ensure that the API object is read-only
const protectedAPI = new Proxy(API, {
  get(target: typeof API, prop: keyof typeof API) {
    if (Reflect.has(target, prop)) {
      return target[prop];
    } else {
      throw new Error(`API endpoint ${String(prop)} not found`);
    }
  },
  set() {
    throw new Error('Cannot modify read-only API object');
  }
});

export { protectedAPI as API };
