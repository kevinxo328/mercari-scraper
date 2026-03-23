import { router } from '../setup';
import { scraperRouter } from './scraper';

export const appRouter = router({
  scraper: scraperRouter
});

// Export type router type signature, this is used by the client.
export type AppRouter = typeof appRouter;
