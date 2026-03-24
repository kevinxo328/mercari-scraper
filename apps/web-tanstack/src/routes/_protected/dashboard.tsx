import { createFileRoute } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';

import AddKeywordDialog from '@/components/dialogs/add-keyword-dialog';
import { Button } from '@/components/shadcn/button';
import KeywordTable from '@/components/tables/keyword-table';

export const Route = createFileRoute('/_protected/dashboard')({
  head: () => ({ meta: [{ title: 'Dashboard | Mercari Scraper' }] }),
  component: RouteComponent
});

function RouteComponent() {
  return (
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
  );
}
