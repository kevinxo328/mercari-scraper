'use client';

import KeywordTable from '@/components/dashboard/keyword-table';
import AddKeywordDialog from '@/components/dialog/add-keyword-dialog';
import { Button } from '@/components/shadcn/button';
import { PlusIcon } from 'lucide-react';

export default function DashboardPage() {
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
