import { http, HttpResponse } from 'msw';
import { API } from '@/lib/api';
import { ScraperResult, ScraperKeyword } from '@/types/scraper';
import { faker } from '@faker-js/faker/locale/ja';
import { parseCommaSeparatedString } from '@/lib/utils';

function generateFakeData() {
  const KEYWORD_COUNT = 10;
  const RESULTS_COUNT = 200;

  const fakeData: {
    results: ScraperResult[];
    keywords: ScraperKeyword[];
  } = {
    results: [],
    keywords: []
  };

  fakeData.keywords = Array.from({ length: KEYWORD_COUNT }, () => {
    const categories = Array.from(
      { length: faker.number.int({ min: 0, max: 3 }) },
      () => ({
        id: faker.string.uuid(),
        name: faker.commerce.department()
      })
    );
    return {
      id: faker.string.uuid(),
      keyword: faker.commerce.productName(),
      minPrice: faker.number.int({ min: 0, max: 10000 }),
      maxPrice: faker.number.int({ min: 10001, max: 20000 }),
      categoryIds: categories.map((category) => category.id),
      categoryNames: categories.map((category) => category.name),
      isPinned: faker.datatype.boolean(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    };
  });

  fakeData.results = Array.from({ length: RESULTS_COUNT }, (_, index) => ({
    id: faker.string.uuid(),
    title:
      fakeData.keywords[index % KEYWORD_COUNT].keyword +
      '_' +
      faker.commerce.productName(),
    url: faker.internet.url(),
    imageUrl: faker.image.url({
      width: 300,
      height: 300
    }),
    price: faker.number.int({ min: 1000, max: 100000 }),
    currency: faker.finance.currencyCode(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  }));

  return fakeData;
}

const fakeData = generateFakeData();

const getScraperResults = http.get(
  API.scraperResults.get().endpoint,
  ({ request }) => {
    const url = new URL(request.url);
    const keywords = parseCommaSeparatedString(
      url.searchParams.get('keywords')
    );
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const page = url.searchParams.get('page');
    const limit = url.searchParams.get('limit');

    const filteredResults = fakeData.results.filter((result) => {
      const isKeywordMatch =
        keywords.length > 0
          ? keywords.some((keyword) => result.title.includes(keyword))
          : true;

      const isMinPriceMatch = minPrice
        ? result.price >= parseInt(minPrice, 10)
        : true;
      const isMaxPriceMatch = maxPrice
        ? result.price <= parseInt(maxPrice, 10)
        : true;

      return isKeywordMatch && isMinPriceMatch && isMaxPriceMatch;
    });

    const paginatedResults = filteredResults.slice(
      (parseInt(page || '1', 10) - 1) * parseInt(limit || '10', 10),
      parseInt(page || '1', 10) * parseInt(limit || '10', 10)
    );

    return HttpResponse.json(paginatedResults as ScraperResult[]);
  }
);

const getScraperKeywords = http.get(API.scraperKeywords.get().endpoint, () => {
  return HttpResponse.json(fakeData.keywords as ScraperKeyword[]);
});

const handlers = [getScraperResults, getScraperKeywords];

export { handlers };
