import ScraperResultCard from '@/components/ScraperResultCard';
import { TimeDisplay } from '@/components/TimeDisplay';
import { prisma } from '@mercari-scraper/db';
import { Search } from 'lucide-react';
import Link from 'next/link';

const LIMIT = 50; // TODO: Make this an environment variable
export const dynamic = 'force-dynamic';

export default async function Page() {
  const latestResults = await prisma.scrapeResult.findMany({
    orderBy: { updatedAt: 'desc' },
    take: LIMIT,
    skip: 0
  });

  const latestUpdateTime = await prisma.scrapeResult
    .findFirst({
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        updatedAt: true
      }
    })
    .then((result) => result?.updatedAt);

  return (
    <main className="mx-auto p-4 container relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col md:flex-row md:gap-2 md: items-baseline">
          <h4 className="text-xl md:text-3xl font-semibold">Last Updated</h4>
          <TimeDisplay
            timestamp={latestUpdateTime}
            className="text-xs md:text-sm dark:text-gray-400"
          />
        </div>
        <Link href="/search" className="flex items-center gap-2">
          <Search className="size-4" /> Search
        </Link>
      </div>
      <div className="grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
        {latestResults.map((result) => (
          <ScraperResultCard
            key={result.id}
            url={result.url}
            title={result.title}
            imageUrl={result.imageUrl}
            price={result.price}
            currency={result.currency}
          />
        ))}
      </div>
    </main>
  );
}
