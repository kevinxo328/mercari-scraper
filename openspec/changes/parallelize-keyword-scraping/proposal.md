## Why

CI scraper execution takes ~10 minutes compared to ~2 minutes locally, a 5x slowdown caused by sequential keyword processing combined with higher US→Japan network latency on GitHub Actions runners. Parallelizing keyword scraping is the highest-impact fix that requires no infrastructure changes.

## What Changes

- Replace the sequential `for` loop over keywords in `scraper.spec.ts` with a batched `Promise.all` approach, processing 2 keywords concurrently
- Each concurrent keyword gets its own Playwright `page` instance
- Replace hardcoded `page.waitForTimeout(3000)` with `waitForSelector` + catch to avoid fixed delays when no modal is present

## Capabilities

### New Capabilities
- `parallel-keyword-scraping`: Concurrent keyword scraping with configurable concurrency limit, each keyword running in its own page context

### Modified Capabilities

## Impact

- `apps/scraper/tests/scraper.spec.ts`: Core scraping logic rewritten from sequential to parallel using `p-limit`
- New `SCRAPE_CONCURRENCY` environment variable (default: `2`) controls concurrency at runtime
- `apps/scraper/package.json`: Added `p-limit` dependency
- No changes to database schema, workflow YAML, or Playwright config
- CI execution time expected to drop from ~10 min to ~5 min
