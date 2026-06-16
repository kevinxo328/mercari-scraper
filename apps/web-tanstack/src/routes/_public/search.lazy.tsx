import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  createLazyFileRoute,
  useHydrated,
  useNavigate
} from '@tanstack/react-router';
import { Funnel } from 'lucide-react';
import { useRef, useState } from 'react';

import ScraperSearchForm, {
  ScraperFormValues
} from '@/components/forms/scraper-search-form';
import { Button } from '@/components/shadcn/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/shadcn/sheet';
import VirtualResultGrid from '@/components/virtual-result-grid';
import { useTRPC } from '@/router';

export const Route = createLazyFileRoute('/_public/search')({
  component: RouteComponent
});

function RouteComponent() {
  const trpc = useTRPC();
  const formRef = useRef<HTMLFormElement>(null);
  const mobileFormRef = useRef<HTMLFormElement>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isHydrated = useHydrated();
  const navigate = useNavigate({ from: '/search' });
  const { keyword, minPrice, maxPrice } = Route.useSearch();

  const { data: keywordOptionsData } = useQuery(
    trpc.scraper.getKeywords.queryOptions({
      orderby: 'desc',
      orderByField: 'updatedAt',
      hasResults: true
    })
  );
  const keywordOptions = keywordOptionsData
    ? {
        ...keywordOptionsData,
        data: [...keywordOptionsData.data].sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return a.keyword.localeCompare(b.keyword);
        })
      }
    : undefined;

  const {
    data: infiniteResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status: resultsStatus
  } = useInfiniteQuery(
    trpc.scraper.infiniteResults.infiniteQueryOptions(
      {
        keywords: keyword ? [keyword] : undefined,
        minPrice: minPrice,
        maxPrice: maxPrice,
        limit: 48,
        orderby: 'desc'
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor
      }
    )
  );
  const allItems = infiniteResults?.pages.flatMap((p) => p.data) ?? [];

  const triggerSubmit = () => {
    const width = isHydrated ? window.innerWidth : undefined;
    const targetForm =
      width !== undefined && width < 1024
        ? mobileFormRef.current
        : formRef.current;

    targetForm?.dispatchEvent(
      new Event('submit', { cancelable: true, bubbles: true })
    );
  };

  const handleSubmit = (data: ScraperFormValues) => {
    navigate({
      resetScroll: true,
      search: {
        keyword: data.keyword || undefined,
        minPrice: data.minPrice ?? undefined,
        maxPrice: data.maxPrice ?? undefined
      }
    });
  };

  return (
    <main className="container relative mx-auto flex gap-4 p-4">
      <div className="grow">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-xl md:text-3xl font-semibold">Results</h4>
        </div>

        <VirtualResultGrid
          items={allItems}
          status={resultsStatus}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      </div>

      <aside className="w-75 shrink-0 hidden lg:flex flex-col gap-4 sticky top-16 self-start">
        <div className="flex items-center justify-between">
          <h5 className="text-xl text-gray-400 font-semibold">Filter</h5>
          <Button
            onClick={() => triggerSubmit()}
            variant="outline"
            className="cursor-pointer"
            size="sm"
          >
            Apply
          </Button>
        </div>
        <hr />
        <ScraperSearchForm
          ref={formRef}
          onSubmit={handleSubmit}
          defaultValues={{
            keyword,
            minPrice,
            maxPrice
          }}
          keywordOptions={keywordOptions?.data}
        />
      </aside>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 z-30 rounded-full shadow-lg lg:hidden h-14 w-14"
            size="icon"
          >
            <Funnel className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-2xl font-semibold">Filter</SheetTitle>
            <SheetDescription className="sr-only">
              Filter results by keywords and price range.
            </SheetDescription>
            <hr />
            <ScraperSearchForm
              ref={mobileFormRef}
              onSubmit={handleSubmit}
              defaultValues={{
                keyword,
                minPrice,
                maxPrice
              }}
              keywordOptions={keywordOptions?.data}
            />
            <Button
              onClick={() => {
                triggerSubmit();
                setIsSheetOpen(false);
              }}
              className="mt-4"
            >
              Apply
            </Button>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </main>
  );
}
