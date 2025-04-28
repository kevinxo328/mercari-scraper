import { test } from '@playwright/test';
import { getMercariUrl, MercariCategory } from '../utils/mercari';
import { PrismaClient, type ScrapeKeyword } from '@mercari-scraper/db';

// Set the viewport size for the page to ensure all items are visible.
test.use({
  viewport: { width: 1280, height: 72000 }
});

test.describe('Scrape Mercari', () => {
  // Set the timeout for the entire test suite to 30 minutes
  test.setTimeout(1800_000);

  const MAX_ITEM_COUNT = 100; // Maximum number of items to scrape per keyword
  const prisma = new PrismaClient();
  let keywords: ScrapeKeyword[] = [];

  test.beforeAll(async () => {
    // Fetch keywords from the database
    try {
      keywords = await prisma.scrapeKeyword.findMany();
    } catch (e) {
      console.error(e);
    }
  });

  test.afterAll(async () => {
    // Close the database connection
    await prisma.$disconnect();
  });

  test('Scrape Items', async ({ page }) => {
    for (const record of keywords) {
      // Block images to speed up the loading time.
      await page.route('**/*', (route) => {
        return route.request().resourceType() === 'image' ||
          route.request().resourceType() === 'media' ||
          route.request().resourceType() === 'font'
          ? route.abort()
          : route.continue();
      });

      await page
        .goto(
          getMercariUrl({
            keyword: record.keyword,
            category:
              MercariCategory[record.category as keyof typeof MercariCategory],
            ...(record.minPrice && { minPrice: record.minPrice }),
            ...(record.maxPrice && { maxPrice: record.maxPrice })
          })
        )
        .catch((e) => {
          console.error(`Error navigating to URL: ${e}`);
        });

      // If the page has a dialog, close it
      const modalScrim = await page.getByTestId('merModalBaseScrim');
      await page.waitForTimeout(3000);

      if ((await modalScrim.count()) > 0) {
        await modalScrim.click({
          force: true,
          timeout: 3000
        });
        await page.waitForTimeout(1000);
      }

      const itemCells = await page.getByTestId('item-cell');
      const itemCount = await itemCells.count();

      if (itemCount > 0) {
        const scrapingItemCount = Math.min(itemCount, MAX_ITEM_COUNT);
        for (let i = 0; i <= scrapingItemCount - 1; i++) {
          console.log(
            `Scraping keyword: ${record.keyword} - Item ${
              i + 1
            }/${scrapingItemCount}`
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
            title: await itemCell
              .getByTestId('thumbnail-item-name')
              .innerText(),
            url:
              mercariHost +
              (await itemCell
                .getByTestId('thumbnail-link')
                .getAttribute('href')),
            imageUrl: (await itemCell.locator('img').getAttribute('src')) || '',
            price: priceSource
              ? parseInt(
                  priceSource[priceSource.length - 2]
                    .replace('円', '')
                    .replace(/,/g, '')
                )
              : -1,
            currency: priceSource ? 'JPY' : ''
          };

          const existingRecord = await prisma.scrapeResult.findFirst({
            where: { url: data.url },
            include: { keywords: true }
          });

          if (!existingRecord) {
            await prisma.scrapeResult.create({
              data: {
                ...data,
                keywords: {
                  connect: [{ id: record.id }]
                }
              }
            });
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
              await prisma.scrapeResult.update({
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
    }
  });
});
