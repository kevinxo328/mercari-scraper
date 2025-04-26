import {test} from "@playwright/test";
import {getMercariUrl, MercariCategory} from "../utils/mercari";
import {PrismaClient} from "../prisma/generated/prisma";
import core from "@actions/core";

core?.debug("Starting Mercari Crawler Test");

test.describe("Crawl Mercari", () => {
  // Set the timeout for the entire test suite to 30 minutes
  test.setTimeout(1800_000);

  core?.debug("Setting up database connection");

  let keywords: {
    keyword: string;
    category: string;
    minPrice: number | null;
    maxPrice: number | null;
    id: string;
  }[] = [];
  const prisma = new PrismaClient();

  test.beforeAll(async () => {
    // Fetch keywords from the database
    try {
      core?.debug("Fetching keywords from the database");
      keywords = await prisma.scrapeKeyword.findMany();
      core?.debug(`Fetched ${keywords.length} keywords from the database`);
    } catch (e) {
      console.error(e);
      core?.debug("Error fetching keywords from the database");
      throw e;
    }
  });

  test.beforeEach(async ({page}) => {
    // Set the viewport size for the page to ensure all items are visible.
    await page.setViewportSize({width: 1280, height: 72000});
  });

  test.afterAll(async () => {
    // Close the database connection
    await prisma.$disconnect();
  });

  test("Crawl Items", async ({page}) => {
    for (const record of keywords) {
      await page.goto(
        getMercariUrl({
          keyword: record.keyword,
          category:
            MercariCategory[record.category as keyof typeof MercariCategory],
          ...(record.minPrice && {minPrice: record.minPrice}),
          ...(record.maxPrice && {maxPrice: record.maxPrice}),
        })
      );

      // If the page has a dialog, close it
      const dialog = await page.getByRole("dialog");
      if (dialog) {
        await dialog.waitFor();
        const closeButton = await dialog.getByLabel(/Close/);
        await closeButton.click();
        await page.waitForTimeout(2000);
      }

      const itemCells = await page.getByTestId("item-cell");
      const itemCount = await itemCells.count();

      if (itemCount > 0) {
        for (let i = 0; i < itemCount; i++) {
          core?.debug(`Crawling ${record.keyword}: ${i + 1} / ${itemCount}`);
          const itemCell = itemCells.nth(i);
          const priceElement = await itemCell.locator(".merPrice");
          const priceText = (await priceElement.innerText()).split("\n");
          const mercariHost = "https://jp.mercari.com";

          const data = {
            title: await itemCell
              .getByTestId("thumbnail-item-name")
              .innerText(),
            url:
              mercariHost +
              (await itemCell
                .getByTestId("thumbnail-link")
                .getAttribute("href")),
            imageUrl: (await itemCell.locator("img").getAttribute("src")) || "",
            price: parseInt(priceText[1].replace(/,/g, "")),
            currency: priceText[0].replace("$", ""),
          };

          const existingRecord = await prisma.scrapeResult.findFirst({
            where: {url: data.url},
            include: {keywords: true},
          });

          if (!existingRecord) {
            await prisma.scrapeResult.create({
              data: {
                ...data,
                keywords: {
                  connect: [{id: record.id}],
                },
              },
            });
          } else {
            const existingKeywordRelation = existingRecord.keywords.some(
              (k: {id: string}) => k.id === record.id
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
                where: {id: existingRecord.id},
                data: {
                  title: data.title,
                  url: data.url,
                  imageUrl: data.imageUrl,
                  price: data.price,
                  currency: data.currency,
                  keywords: {
                    connect: [{id: record.id}],
                  },
                },
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
