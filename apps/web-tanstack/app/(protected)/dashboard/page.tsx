import KeywordTable from '@/components/table/keyword-table';
import AddKeywordDialog from '@/components/dialog/add-keyword-dialog';
import { Button } from '@/components/shadcn/button';
import { PlusIcon } from 'lucide-react';
import { trpc, prefetch, HydrateClient } from '@/trpc/server';

export default async function DashboardPage() {
  // Prefetch keywords with default values matching KeywordTable's initial state
  await prefetch(
    trpc.scraper.getKeywords.queryOptions({
      page: 1,
      pageSize: 10,
      orderby: 'desc',
      orderByField: 'updatedAt',
      search: undefined
    })
  );

  return (
    <HydrateClient>
      <main className="container relative mx-auto p-4">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-500">Manage scraper keywords.</p>
          </div>
          <AddKeywordDialog>
            <Button>
              <PlusIcon />
              Add Keyword
            </Button>
          </AddKeywordDialog>
        </div>
        <KeywordTable />
      </main>
    </HydrateClient>
  );
}
