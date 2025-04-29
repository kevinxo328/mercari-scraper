import PaginatedScrapeResults from '@/components/PaginatedScrapeResults';
import { prisma } from '@mercari-scraper/db';

const LIMIT = 50;

export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialResults = await prisma.scrapeResult.findMany({
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
