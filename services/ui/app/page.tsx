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
          <a
            href={result.url}
            key={result.id}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative"
          >
            <div className="aspect-square overflow-hidden bg-gray-100 rounded-lg">
              <img
                className="object-contain object-center  w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
                src={result.imageUrl}
                alt={result.title}
              />
            </div>
            <p className="absolute bottom-2 left-0 bg-gray-950/70 py-2 px-4 text-sm font-semibold text-white rounded-r-full">
              {result.currency} {result.price.toLocaleString()}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}
