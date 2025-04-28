import ScrapeResultCard from '@/components/ScrapeResultCard';
import { dbClient } from '@/utils/db';

export default async function Page() {
  const scrapeResults = await dbClient.scrapeResult.findMany({
    orderBy: {
      updatedAt: 'desc'
    }
  });
  return (
    <main className="mx-auto p-4 container @container">
      <h4 className="text-lg font-semibold mb-4">Results</h4>
      <div className="grid @max-[400px]:grid-cols-2 grid-cols-3 lg:grid-cols-6 gap-6">
        {scrapeResults.map((result) => (
          <ScrapeResultCard
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
