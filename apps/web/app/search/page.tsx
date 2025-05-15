import ScraperResults from '@/components/ScraperResults';
import ScraperSheet from '@/components/ScraperSheet';
import ScraperSidebar from '@/components/ScraperSidebar';
import { ScraperFormProvider } from '@/providers/scraper-form-provider';
import { ScraperProvider } from '@/providers/scraper-store-provider';

export default async function Page() {
  return (
    <ScraperProvider>
      <ScraperFormProvider>
        <main className="mx-auto p-4 container flex gap-4 relative">
          <div className="grow-1">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl md:text-3xl font-semibold">Results</h4>
              <ScraperSheet className="lg:hidden" />
            </div>
            <ScraperResults />
          </div>
          <ScraperSidebar className="w-[300px] shrink-0 grow-0 hidden lg:flex flex-col gap-4" />
        </main>
      </ScraperFormProvider>
    </ScraperProvider>
  );
}
