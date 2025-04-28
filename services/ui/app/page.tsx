import PaginatedScrapeResults from '@/components/PaginatedScrapeResults';

export default async function Page() {
  return (
    <main className="mx-auto p-4 container @container">
      <h4 className="text-lg font-semibold mb-4">Results</h4>
      <PaginatedScrapeResults />
    </main>
  );
}
