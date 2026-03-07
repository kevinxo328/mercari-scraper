import {
  getCategoryByCode,
  prisma,
  type PrismaClient,
  type ScraperKeyword
} from '@mercari-scraper/database';
import { type Page, test } from '@playwright/test';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import os from 'os';
import pLimit from 'p-limit';
import path from 'path';

import { getMercariUrl } from '../lib/utils';

function writeResults(data: {
  createdCount?: number;
  appUrl?: string;
  error?: string;
}) {
  try {
    const metaFile = path.join(
      os.tmpdir(),
      'mercari-scraper-monitor-meta.json'
    );
    if (!existsSync(metaFile)) return;
    const { resultsFile } = JSON.parse(readFileSync(metaFile, 'utf-8'));
    writeFileSync(resultsFile, JSON.stringify(data));
  } catch {
    // non-critical, ignore
  }
}

const MAX_ITEM_COUNT = 100;
const SCRAPE_CONCURRENCY = parseInt(process.env.SCRAPE_CONCURRENCY ?? '2', 10);

async function scrapeKeyword(
  page: Page,
  record: ScraperKeyword,
  prisma: PrismaClient
): Promise<number> {
  let createdCount = 0;

  // Block images to speed up the loading time.
  await page.route('**/*', (route) => {
    return route.request().resourceType() === 'image' ||
      route.request().resourceType() === 'media' ||
      route.request().resourceType() === 'font'
      ? route.abort()
      : route.continue();
  });

  // categoryIds are now direct Mercari category codes (e.g. "11", "3092")
  const categoryIds = record.categoryIds;
  if (categoryIds.length > 0) {
    const names = categoryIds
      .map((code) => getCategoryByCode(code)?.enName || code)
      .join(', ');
    console.log(`  Categories: ${names}`);
  }

  await page
    .goto(
      getMercariUrl({
        keyword: record.keyword,
        categoryIds,
        ...(record.minPrice && { minPrice: record.minPrice }),
        ...(record.maxPrice && { maxPrice: record.maxPrice })
      })
    )
    .catch((e) => {
      console.error(`Error navigating to URL: ${e}`);
    });

  // If the page has a dialog, close it. Wait only until the modal appears;
  // skip immediately if it never shows up.
  const modalScrim = page.getByTestId('merModalBaseScrim');
  await page
    .waitForSelector('[data-testid="merModalBaseScrim"]', { timeout: 3000 })
    .catch(() => {});

  if ((await modalScrim.count()) > 0) {
    await modalScrim.click({ force: true, timeout: 3000 });
    await page.waitForLoadState('networkidle').catch(() => {});
  }

  // Only select item-cell elements that contain actual items (not skeleton placeholders)
  const itemCells = page.locator(
    '[data-testid="item-cell"]:has([data-testid="thumbnail-link"])'
  );
  const itemCount = await itemCells.count();

  if (itemCount > 0) {
    const scrapingItemCount = Math.min(itemCount, MAX_ITEM_COUNT);
    for (let i = 0; i <= scrapingItemCount - 1; i++) {
      console.log(
        `Scraping keyword: ${record.keyword} - Item ${i + 1}/${scrapingItemCount}`
      );

      const itemCell = itemCells.nth(i);
      const mercariHost = 'https://jp.mercari.com';

      // TODO: Get the price from the aria-label attribute to ensure getting the correct yen value without Japan proxy.
      const priceSource = (
        await itemCell
          .locator('[itemtype]')
          .getAttribute('aria-label', { timeout: 3000 })
          .catch((e) => {
            console.error(`Error getting aria-label: ${e}`);
          })
      )?.split(' ');

      const data = {
        title: await itemCell.getByTestId('thumbnail-item-name').innerText(),
        url:
          mercariHost +
          (await itemCell.getByTestId('thumbnail-link').getAttribute('href')),
        imageUrl: (await itemCell.locator('img').getAttribute('src')) || '',
        price: priceSource
          ? parseInt(
              priceSource[priceSource.length - 1]
                .replace('円', '')
                .replace(/,/g, '')
            )
          : -1,
        currency: priceSource ? 'JPY' : ''
      };

      const existingRecord = await prisma.scraperResult.findFirst({
        where: { url: data.url },
        include: { keywords: true }
      });

      if (!existingRecord) {
        await prisma.scraperResult.create({
          data: {
            ...data,
            keywords: {
              connect: [{ id: record.id }]
            }
          }
        });
        createdCount++;
      } else {
        const existingKeywordRelation = existingRecord.keywords.some(
          (k: { id: string }) => k.id === record.id
        );
        if (
          existingRecord.price !== data.price ||
          existingRecord.imageUrl !== data.imageUrl ||
          existingRecord.title !== data.title ||
          existingRecord.currency !== data.currency ||
          existingRecord.url !== data.url ||
          !existingKeywordRelation
        ) {
          await prisma.scraperResult.update({
            where: { id: existingRecord.id },
            data: {
              title: data.title,
              url: data.url,
              imageUrl: data.imageUrl,
              price: data.price,
              currency: data.currency,
              keywords: {
                connect: [{ id: record.id }]
              }
            }
          });
        }
      }
    }
  } else {
    console.log(`No items found for keyword: ${record.keyword}`);
  }

  return createdCount;
}

// Set the viewport size for the page to ensure all items are visible.
test.use({
  viewport: { width: 1280, height: 72000 }
});

test.describe('Scrape Mercari', () => {
  // Set the timeout for the entire test suite to 30 minutes
  test.setTimeout(1800_000);

  let keywords: ScraperKeyword[] = [];
  let scraperRunId: string | null = null;

  test.beforeAll(async () => {
    try {
      keywords = await prisma.scraperKeyword.findMany();
    } catch (e) {
      console.error(e);
    }

    try {
      const run = await prisma.scraperRun.create({ data: {} });
      scraperRunId = run.id;
    } catch (e) {
      console.error('Failed to create ScraperRun:', e);
    }
  });

  test.afterAll(async () => {
    // Close the database connection
    await prisma.$disconnect();
  });

  test('Scrape Items', async ({ page }) => {
    try {
      const limit = pLimit(SCRAPE_CONCURRENCY);

      // Process all keywords concurrently, capped at SCRAPE_CONCURRENCY at a time.
      const counts = await Promise.all(
        keywords.map((record) =>
          limit(async () => {
            const newPage = await page.context().newPage();
            await newPage.setViewportSize({ width: 1280, height: 72000 });
            try {
              return await scrapeKeyword(newPage, record, prisma);
            } catch (e) {
              console.error(`Error scraping keyword "${record.keyword}": ${e}`);
              return 0;
            } finally {
              await newPage.close();
            }
          })
        )
      );

      const createdCount = counts.reduce((sum, n) => sum + n, 0);

      if (scraperRunId) {
        await prisma.scraperRun.update({
          where: { id: scraperRunId },
          data: { completedAt: new Date(), createdCount }
        });
      } else {
        await prisma.scraperRun.create({
          data: { completedAt: new Date(), createdCount }
        });
      }

      writeResults({ createdCount, appUrl: process.env.WEB_APP_URL });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      writeResults({ error: message });
      throw e;
    }
  });
});
