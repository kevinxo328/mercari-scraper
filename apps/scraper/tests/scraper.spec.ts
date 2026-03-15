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
  updatedCount?: number;
  totalFound?: number;
  totalUnique?: number;
  failedKeywords?: string[];
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
const MAX_KEYWORD_RETRIES = 2;
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 12000;

async function scrapeKeyword(
  page: Page,
  record: ScraperKeyword,
  prisma: PrismaClient
): Promise<{
  keyword: string;
  foundItems: number;
  uniqueItems: number;
  updatedItems: number;
  error?: string;
}> {
  let updatedCount = 0;
  let foundCount = 0;
  let uniqueCount = 0;
  let errorMsg: string | undefined;

  try {
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

    await page.goto(
      getMercariUrl({
        keyword: record.keyword,
        categoryIds,
        ...(record.minPrice && { minPrice: record.minPrice }),
        ...(record.maxPrice && { maxPrice: record.maxPrice })
      }),
      { timeout: 30000 }
    );

    // If the page has a dialog, close it. Wait only until the modal appears;
    // skip immediately if it never shows up.
    const modalScrim = page.getByTestId('merModalBaseScrim');
    await page
      .waitForSelector('[data-testid="merModalBaseScrim"]', { timeout: 3000 })
      .catch(() => {});

    if (
      (await modalScrim.count()) > 0 &&
      (await modalScrim.first().isVisible())
    ) {
      await modalScrim
        .first()
        .click({ force: true, timeout: 3000 })
        .catch(() => {});
      // Wait briefly for the modal to disappear instead of waiting for networkidle
      await page.waitForTimeout(1000);
    }

    // Wait for items to appear, or timeout if none exist
    await page
      .waitForSelector(
        '[data-testid="item-cell"]:has([data-testid="thumbnail-link"])',
        { timeout: 15000 }
      )
      .catch(() => {});

    // Extract all item data via a single browser-side evaluation to reduce Playwright RPC overhead
    const itemsData = await page.$$eval(
      '[data-testid="item-cell"]:has([data-testid="thumbnail-link"])',
      (cells, maxCount) => {
        const mercariHost = 'https://jp.mercari.com';
        return cells.slice(0, maxCount).map((cell) => {
          const ariaLabel =
            cell.querySelector('[itemtype]')?.getAttribute('aria-label') || '';
          const yenMatch = ariaLabel.match(/(\d[\d,]*)円/);
          const price = yenMatch
            ? parseInt(yenMatch[1].replace(/,/g, ''), 10)
            : -1;

          const title =
            cell
              .querySelector('[data-testid="thumbnail-item-name"]')
              ?.textContent?.trim() || '';
          const link =
            cell
              .querySelector('[data-testid="thumbnail-link"]')
              ?.getAttribute('href') || '';
          const imageUrl = cell.querySelector('img')?.getAttribute('src') || '';

          return {
            title,
            url: mercariHost + link,
            imageUrl,
            price,
            currency: yenMatch ? 'JPY' : ''
          };
        });
      },
      MAX_ITEM_COUNT
    );

    // Release the page early to free up browser resources for other concurrent tasks
    await page.close();

    if (itemsData.length > 0) {
      foundCount = itemsData.length;
      // Deduplicate items by URL to prevent unique constraint violations during concurrent DB writes
      const uniqueItemsMap = new Map();
      for (const item of itemsData) {
        if (!uniqueItemsMap.has(item.url)) {
          uniqueItemsMap.set(item.url, item);
        }
      }
      const uniqueItemsData = Array.from(uniqueItemsMap.values());
      uniqueCount = uniqueItemsData.length;

      console.log(
        `Scraping keyword: ${record.keyword} - Found ${itemsData.length} items (Unique: ${uniqueItemsData.length})`
      );

      // Fetch existing records for these URLs in a single query to reduce DB roundtrips
      const urls = uniqueItemsData.map((data) => data.url);
      const existingRecords = await prisma.scraperResult.findMany({
        where: { url: { in: urls } },
        include: { keywords: true }
      });

      const existingRecordsMap = new Map(
        existingRecords.map((r) => [r.url, r])
      );

      // Concurrently process DB updates/creates with a concurrency limit
      const limit = pLimit(SCRAPE_CONCURRENCY);
      const dbTasks = uniqueItemsData.map((data) =>
        limit(async () => {
          const existingRecord = existingRecordsMap.get(data.url);

          if (!existingRecord) {
            await prisma.scraperResult.create({
              data: {
                ...data,
                keywords: {
                  connect: [{ id: record.id }]
                }
              }
            });
            return 1; // Count as updated
          } else {
            const existingKeywordRelation = existingRecord.keywords.some(
              (k: { id: string }) => k.id === record.id
            );
            if (
              existingRecord.price !== data.price ||
              existingRecord.imageUrl !== data.imageUrl ||
              existingRecord.title !== data.title ||
              existingRecord.currency !== data.currency ||
              !existingKeywordRelation
            ) {
              await prisma.scraperResult.update({
                where: { id: existingRecord.id },
                data: {
                  title: data.title,
                  imageUrl: data.imageUrl,
                  price: data.price,
                  currency: data.currency,
                  keywords: {
                    connect: [{ id: record.id }]
                  }
                }
              });
              return 1; // Count as updated
            }
          }
          return 0;
        })
      );

      const counts = await Promise.all(dbTasks);
      updatedCount = counts.reduce((sum, n) => sum + n, 0);
    } else {
      console.log(`No items found for keyword: ${record.keyword}`);
      errorMsg = 'No items found';
    }
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : String(e);
    console.error(`Error scraping keyword "${record.keyword}": ${errorMsg}`);
  }

  return {
    keyword: record.keyword,
    foundItems: foundCount,
    uniqueItems: uniqueCount,
    updatedItems: updatedCount,
    error: errorMsg
  };
}

// Set the viewport size for the page to ensure all items are visible.
test.use({
  viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT }
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
      // Retry up to MAX_KEYWORD_RETRIES times if a keyword returns 0 items,
      // to handle transient Mercari rate-limiting or slow page renders.
      const results = await Promise.all(
        keywords.map((record) =>
          limit(async () => {
            let result = {
              keyword: record.keyword,
              foundItems: 0,
              uniqueItems: 0,
              updatedItems: 0,
              error: undefined as string | undefined
            };

            for (
              let attempt = 1;
              attempt <= MAX_KEYWORD_RETRIES + 1;
              attempt++
            ) {
              const newPage = await page.context().newPage();
              await newPage.setViewportSize({
                width: VIEWPORT_WIDTH,
                height: VIEWPORT_HEIGHT
              });
              try {
                result = await scrapeKeyword(newPage, record, prisma);
              } catch (e) {
                console.error(
                  `Error scraping keyword "${record.keyword}": ${e}`
                );
                result = {
                  keyword: record.keyword,
                  foundItems: 0,
                  uniqueItems: 0,
                  updatedItems: 0,
                  error: e instanceof Error ? e.message : String(e)
                };
              } finally {
                await newPage.close().catch(() => {});
              }

              if (result.foundItems > 0 || attempt > MAX_KEYWORD_RETRIES) break;

              console.log(
                `Retrying keyword: ${record.keyword} (attempt ${attempt + 1}/${MAX_KEYWORD_RETRIES + 1})`
              );
              // Exponential backoff: 3s, 6s
              await page.waitForTimeout(3000 * attempt);
            }

            return result;
          })
        )
      );

      const updatedCount = results.reduce((sum, r) => sum + r.updatedItems, 0);
      const totalFound = results.reduce((sum, r) => sum + r.foundItems, 0);
      const totalUnique = results.reduce((sum, r) => sum + r.uniqueItems, 0);
      const failedKeywords = results
        .filter((r) => r.error)
        .map((r) => `${r.keyword} (${r.error})`);

      console.log('\n--- Scraping Summary ---');
      results.forEach((r) => {
        const status = r.error ? `❌ ${r.error}` : '✅ OK';
        console.log(
          `Keyword: ${r.keyword.padEnd(20)} | Found: ${String(r.foundItems).padStart(3)} | Unique: ${String(r.uniqueItems).padStart(3)} | Updated: ${String(r.updatedItems).padStart(3)} | ${status}`
        );
      });
      console.log('------------------------\n');

      if (scraperRunId) {
        await prisma.scraperRun.update({
          where: { id: scraperRunId },
          data: { completedAt: new Date(), updatedCount }
        });
      } else {
        await prisma.scraperRun.create({
          data: { completedAt: new Date(), updatedCount }
        });
      }

      writeResults({
        updatedCount,
        totalFound,
        totalUnique,
        failedKeywords,
        appUrl: process.env.WEB_APP_URL
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      writeResults({ error: message });
      throw e;
    }
  });
});
