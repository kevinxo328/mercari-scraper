import AppHeader from '@/components/AppHeader';
import ScraperResults from '@/components/ScraperResults';
import ScraperSheet from '@/components/ScraperSheet';
import ScraperSidebar from '@/components/ScraperSidebar';
import { ScraperProvider } from '@/providers/scraper-store-provider';
import { parseCommaSeparatedString } from '@/utils/utils';
import { prisma } from '@mercari-scraper/db';

const LIMIT = 50; // TODO: Make this an environment variable
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: Props) {
  const { keywords, minPrice, maxPrice } = await searchParams;

  const keywordsArray = Array.isArray(keywords)
    ? keywords
    : parseCommaSeparatedString(keywords);
  const minPriceValue = Number(minPrice) || undefined;
  const maxPriceValue = Number(maxPrice) || undefined;

  const initialResults = await prisma.scrapeResult.findMany({
    where: {
      keywords: {
        some: {
          keyword: {
            in: keywordsArray.length > 0 ? keywordsArray : undefined
          }
        }
      },
      price: {
        gte: minPriceValue,
        lte: maxPriceValue
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: LIMIT,
    skip: 0
  });

  const keywordOptions = await prisma.scrapeKeyword.findMany({
    select: {
      keyword: true,
      id: true,
      createdAt: true,
      updatedAt: true
    }
  });

  const initialState = {
    results: {
      data: initialResults,
      currentPage: 1,
      limit: LIMIT,
      ended: initialResults.length ? initialResults.length < LIMIT : true
    },
    filter: {
      keywords: keywordsArray,
      minPrice: minPriceValue,
      maxPrice: maxPriceValue
    },
    keywordOptions
  };

  return (
    <ScraperProvider initialState={initialState}>
      <>
        <AppHeader />
        <main className="mx-auto p-4 container @container flex gap-4 relative">
          <div className="grow-1">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-3xl font-semibold">Results</h4>
              <ScraperSheet className="lg:hidden" />
            </div>
            <ScraperResults />
          </div>
          <ScraperSidebar className="w-[300px] shrink-0 grow-0 hidden lg:flex flex-col gap-4" />
        </main>
      </>
    </ScraperProvider>
  );
}
