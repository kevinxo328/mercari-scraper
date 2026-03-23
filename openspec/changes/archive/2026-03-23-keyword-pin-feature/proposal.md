## Why

Users need a way to highlight specific keywords so their scraped results surface first on the homepage and in keyword search dropdowns, rather than having to scroll through all results sorted only by recency.

## What Changes

- Add `pinned` boolean field to `ScraperKeyword` in the database schema (with migration)
- Add `pinKeyword` tRPC mutation to toggle pin state (protected, authenticated only)
- `getKeywords` returns `pinned` field alongside existing fields
- `infiniteResults` adopts a two-phase cursor strategy: pinned-keyword results first, then regular results, both sorted by `updatedAt desc`
- Dashboard keyword table gains a dedicated Pin column with a star icon toggle button
- Header keyword search dropdown sorts pinned keywords first (then alphabetical), with a filled star icon next to pinned keywords
- Search page keyword filter options follow the same sort order and star icon convention

## Capabilities

### New Capabilities
- `keyword-pin`: Toggle pin state on keywords; persist pinned status in DB; expose via protected tRPC mutation

### Modified Capabilities
- `header-keyword-search`: Keyword list now sorts pinned first, then alphabetical; pinned items show a star icon
- `homepage-infinite-feed`: Results from pinned keywords surface before non-pinned results via two-phase cursor pagination

## Impact

- **Database**: New migration for `pinned` column on `ScraperKeyword`
- **tRPC router** (`scraper.ts`): New `pinKeyword` mutation; updated `getKeywords` output; refactored `infiniteResults` cursor and query logic
- **TypeScript types** (`types/scraper.ts`): `ScraperKeyword` gains `pinned: boolean`
- **Components**: `keyword-table.tsx`, `keyword-search.tsx`, `scraper-search-form.tsx`
- **Routes**: `index.tsx` (homepage) is indirectly affected via server-side ordering change
