import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import {
  type PrismaClient,
  type ScraperKeyword
} from '@mercari-scraper/database';

import { saveScrapedItems, type ScrapedItem } from './save-results';

const currentRunId = '11111111-1111-1111-1111-111111111111';
const changedAt = new Date('2026-06-14T00:00:00.000Z');

const keyword: ScraperKeyword = {
  id: '22222222-2222-2222-2222-222222222222',
  keyword: 'bag',
  pinned: false,
  minPrice: null,
  maxPrice: null,
  categoryIds: [],
  createdAt: new Date('2026-06-01T00:00:00.000Z'),
  updatedAt: new Date('2026-06-01T00:00:00.000Z')
};

const item: ScrapedItem = {
  title: 'Mercari item',
  url: 'https://jp.mercari.com/item/abc',
  imageUrl: 'https://example.com/image.jpg',
  price: 1200,
  currency: 'JPY'
};

function createPrismaMock(existingRecords: unknown[] = []) {
  const calls = {
    findMany: [] as unknown[],
    upsert: [] as unknown[],
    update: [] as unknown[]
  };

  const prisma = {
    scraperResult: {
      findMany: async (args: unknown) => {
        calls.findMany.push(args);
        return existingRecords;
      },
      upsert: async (args: unknown) => {
        calls.upsert.push(args);
        return {};
      },
      update: async (args: unknown) => {
        calls.update.push(args);
        return {};
      }
    }
  } as unknown as PrismaClient;

  return { prisma, calls };
}

describe('saveScrapedItems', () => {
  it('marks newly inserted items with the current run so the homepage can identify first-seen results', async () => {
    const { prisma, calls } = createPrismaMock();

    const updatedCount = await saveScrapedItems({
      items: [item],
      keyword,
      prisma,
      currentRunId,
      concurrency: 1,
      now: () => changedAt
    });

    assert.equal(updatedCount, 1);
    assert.deepEqual(calls.upsert[0], {
      where: { url: item.url },
      create: {
        ...item,
        firstSeenRunId: currentRunId,
        previousPrice: null,
        priceChangedAt: null,
        priceChangedRunId: null,
        keywords: {
          connect: [{ id: keyword.id }]
        }
      },
      update: {
        keywords: {
          connect: [{ id: keyword.id }]
        }
      }
    });
  });

  it('records previous price and run id on the first price change so a price badge can be rendered', async () => {
    const { prisma, calls } = createPrismaMock([
      {
        id: 'result-1',
        ...item,
        price: 1500,
        previousPrice: null,
        keywords: [{ id: keyword.id }]
      }
    ]);

    const updatedCount = await saveScrapedItems({
      items: [item],
      keyword,
      prisma,
      currentRunId,
      concurrency: 1,
      now: () => changedAt
    });

    assert.equal(updatedCount, 1);
    assert.deepEqual(calls.update[0], {
      where: { id: 'result-1' },
      data: {
        title: item.title,
        imageUrl: item.imageUrl,
        price: item.price,
        currency: item.currency,
        previousPrice: 1500,
        priceChangedAt: changedAt,
        priceChangedRunId: currentRunId,
        keywords: {
          connect: [{ id: keyword.id }]
        }
      }
    });
  });

  it('does not write price badge fields when only non-price data changes because the homepage filters by price or first-seen run', async () => {
    const { prisma, calls } = createPrismaMock([
      {
        id: 'result-1',
        ...item,
        title: 'Old title',
        keywords: [{ id: keyword.id }]
      }
    ]);

    const updatedCount = await saveScrapedItems({
      items: [item],
      keyword,
      prisma,
      currentRunId,
      concurrency: 1,
      now: () => changedAt
    });

    assert.equal(updatedCount, 1);
    assert.equal(
      'priceChangedRunId' in (calls.update[0] as { data: object }).data,
      false
    );
    assert.equal(
      'previousPrice' in (calls.update[0] as { data: object }).data,
      false
    );
    assert.equal(
      'priceChangedAt' in (calls.update[0] as { data: object }).data,
      false
    );
  });

  it('refreshes unchanged items without increasing updatedCount so cleanup keeps recently seen stable results', async () => {
    const { prisma, calls } = createPrismaMock([
      {
        id: 'result-1',
        ...item,
        keywords: [{ id: keyword.id }]
      }
    ]);

    const updatedCount = await saveScrapedItems({
      items: [item],
      keyword,
      prisma,
      currentRunId,
      concurrency: 1,
      now: () => changedAt
    });

    assert.equal(updatedCount, 0);
    assert.deepEqual(calls.update[0], {
      where: { id: 'result-1' },
      data: { updatedAt: changedAt }
    });
  });
});
