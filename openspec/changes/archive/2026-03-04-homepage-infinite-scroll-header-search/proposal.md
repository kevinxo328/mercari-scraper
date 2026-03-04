## Why

The current homepage groups results by keyword and loads them with separate queries, making it hard to see the latest items across all keywords at a glance. A unified infinite-scroll feed with a header search shortcut gives users faster access to fresh results without navigating to the search page.

## What Changes

- Replace the homepage grouped-by-keyword layout with a single mixed feed sorted by `updatedAt desc`
- Switch homepage data fetching from multiple `getResults` queries to a single `infiniteResults` infinite query
- Add virtual list rendering (`@tanstack/react-virtual`) to the homepage feed so only visible rows are in the DOM
- Add a keyword search combobox to the app header (visible on all pages except `/search`)
  - Input with dropdown showing matching keywords from `getKeywords`
  - Magnifying glass button + Enter key to navigate to `/search?keywords=<value>`
  - Clear (×) button to reset input
  - Empty input navigates to `/search` (show all)

## Capabilities

### New Capabilities

- `homepage-infinite-feed`: Infinite-scroll virtual list feed on the homepage showing all latest scraper results mixed and sorted by time
- `header-keyword-search`: Keyword search combobox in the app header for quick navigation to search results

### Modified Capabilities

<!-- none -->

## Impact

- `apps/web/app/(public)/page.tsx` — change prefetch from `getKeywords`+`getResults` to `infiniteResults`
- `apps/web/app/(public)/_components/home-page.client.tsx` — full rewrite of display logic
- `apps/web/app/(public)/_components/app-header.client.tsx` — add keyword search combobox
- New component: `apps/web/components/keyword-search.tsx`
- New dependency: `@tanstack/react-virtual` (in `apps/web`)
