import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import TimeDisplay from '@/components/time-display';
import { trpc } from '@/router';

function useColCount() {
  const [cols, setCols] = useState(2);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1280) setCols(6);
      else if (w >= 768) setCols(4);
      else if (w >= 400) setCols(3);
      else setCols(2);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return cols;
}

function Home() {
  const { data: lastRun } = useQuery(trpc.scraper.getLastRun.queryOptions());
  const latestUpdateTime = lastRun?.completedAt;

  return (
    <main className="mx-auto p-4 container relative">
      <div className="flex justify-end items-center mb-4">
        <div className="flex flex-col md:flex-row md:gap-2 md:items-baseline text-xs md:text-sm dark:text-gray-400">
          <span>Last Updated</span>
          <TimeDisplay timestamp={latestUpdateTime} />
        </div>
      </div>
    </main>
  );
}

export const Route = createFileRoute('/')({
  component: Home
});
