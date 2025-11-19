'use client';

import KeywordTable from '@/components/dashboard/keyword-table';

export default function DashboardPage() {
  return (
    <main className="container relative mx-auto p-4">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">Manage scraper keywords.</p>
      </div>
      <KeywordTable />
    </main>
  );
}
