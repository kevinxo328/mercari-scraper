import { createFileRoute } from '@tanstack/react-router';

import KeywordTable from '@/components/tables/keyword-table';

export const Route = createFileRoute('/_protected/dashboard')({
  head: () => ({ meta: [{ title: 'Dashboard | Mercari Scraper' }] }),
  component: RouteComponent
});

function RouteComponent() {
  return (
    <main className="container mx-auto px-4 py-4">
      <KeywordTable />
    </main>
  );
}
