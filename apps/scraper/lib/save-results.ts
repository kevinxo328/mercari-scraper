import {
  type PrismaClient,
  type ScraperKeyword
} from '@mercari-scraper/database';
import pLimit from 'p-limit';

export type ScrapedItem = {
  title: string;
  url: string;
  imageUrl: string;
  price: number;
  currency: string;
};

type ExistingResult = ScrapedItem & {
  id: string;
  keywords: Array<{ id: string }>;
};

type SaveScrapedItemsParams = {
  items: ScrapedItem[];
  keyword: ScraperKeyword;
  prisma: PrismaClient;
  currentRunId: string;
  concurrency: number;
  now?: () => Date;
};

export async function saveScrapedItems({
  items,
  keyword,
  prisma,
  currentRunId,
  concurrency,
  now = () => new Date()
}: SaveScrapedItemsParams): Promise<number> {
  const urls = items.map((data) => data.url);
  const existingRecords = (await prisma.scraperResult.findMany({
    where: { url: { in: urls } },
    include: { keywords: true }
  })) as ExistingResult[];

  const existingRecordsMap = new Map(existingRecords.map((r) => [r.url, r]));

  const limit = pLimit(concurrency);
  const counts = await Promise.all(
    items.map(async (data) => {
      return await limit(async () => {
        const existingRecord = existingRecordsMap.get(data.url);

        if (!existingRecord) {
          await prisma.scraperResult.upsert({
            where: { url: data.url },
            create: {
              ...data,
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
          return 1;
        }

        const existingKeywordRelation = existingRecord.keywords.some(
          (k) => k.id === keyword.id
        );
        const priceChanged = existingRecord.price !== data.price;
        const resultChanged =
          priceChanged ||
          existingRecord.imageUrl !== data.imageUrl ||
          existingRecord.title !== data.title ||
          existingRecord.currency !== data.currency ||
          !existingKeywordRelation;

        if (resultChanged) {
          await prisma.scraperResult.update({
            where: { id: existingRecord.id },
            data: {
              title: data.title,
              imageUrl: data.imageUrl,
              price: data.price,
              currency: data.currency,
              ...(priceChanged
                ? {
                    previousPrice: existingRecord.price,
                    priceChangedAt: now(),
                    priceChangedRunId: currentRunId
                  }
                : {}),
              keywords: {
                connect: [{ id: keyword.id }]
              }
            }
          });
          return 1;
        }

        await prisma.scraperResult.update({
          where: { id: existingRecord.id },
          data: { updatedAt: now() }
        });
        return 0;
      });
    })
  );

  return counts.reduce<number>((sum, n) => sum + n, 0);
}
