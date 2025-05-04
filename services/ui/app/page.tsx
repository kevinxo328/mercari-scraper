import PaginatedScrapeResults from '@/components/PaginatedScrapeResults';
import { parseCommaSeparatedString } from '@/utils/string';
import { prisma } from '@mercari-scraper/db';

const LIMIT = 50;

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: Props) {
  const { keywords, minPrice, maxPrice } = await searchParams;

  const keywordsArray = Array.isArray(keywords)
    ? keywords
    : parseCommaSeparatedString(keywords);

  const initialResults = await prisma.scrapeResult.findMany({
    where: {
      keywords: {
        some: {
          keyword: {
            in: keywordsArray.length > 0 ? keywordsArray : undefined
          }
        }
      },
      price: {
        gte: Number(minPrice) || undefined,
        lte: Number(maxPrice) || undefined
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: LIMIT,
    skip: 0
  });

  return (
    <main className="mx-auto p-4 container @container">
      <h4 className="text-lg font-semibold mb-4">Results</h4>
      <PaginatedScrapeResults initialResults={initialResults} limit={50} />
    </main>
  );
}
