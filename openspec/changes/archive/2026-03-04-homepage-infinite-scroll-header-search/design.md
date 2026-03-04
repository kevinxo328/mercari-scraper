## Context

The homepage currently fetches up to 5 keywords (pinned-first) and runs a separate `getResults` query per keyword via `useQueries`, rendering results in grouped sections. This is fine for a small number of keywords but doesn't surface the very latest items across all keywords in a single view.

The search page already has a working `useInfiniteQuery` + `InfiniteScrollTrigger` pattern and a sidebar filter. The goal is to bring a similar experience to the homepage — a single chronological feed — while adding virtual list rendering so the DOM stays lean as items accumulate.

The app header currently only shows login/avatar with no navigation shortcut for keyword filtering.

## Goals / Non-Goals

**Goals:**

- Homepage shows only the latest scraper run's results (`updatedAt >= previousRun.completedAt`), ordered by `updatedAt desc`
- Virtual row rendering so only visible grid rows are in the DOM
- Infinite scroll that fetches the next page as user approaches bottom
- Keyword search combobox in header: type-to-filter from existing options only, Enter/🔍 to navigate to `/search?keywords=<selected>`, × to clear
- Hide the header combobox on `/search` (the search page has its own full filter UI)

**Non-Goals:**

- Price range filtering on the homepage (use `/search` for that)
- Changing the search page itself
- Server-side rendering of the infinite feed (prefetch first page only)

## Decisions

### 1. Virtual list: `@tanstack/react-virtual` with `useWindowVirtualizer`

**Chosen**: `useWindowVirtualizer` (window-scroll mode) from `@tanstack/react-virtual`.

**Alternatives considered**:

- `react-window` + `react-window-infinite-loader`: requires two packages, 2D grid support is awkward for responsive grids
- Skip virtualization (pure infinite scroll): simplest, but DOM nodes grow unbounded after many pages

**Rationale**: `@tanstack/react-virtual` is already in the TanStack ecosystem alongside TanStack Query used throughout the app. `useWindowVirtualizer` requires no fixed-height container, works naturally with the existing `container mx-auto` layout.

**Row height**: Items are square cards in a responsive grid. Row height must be estimated. Use `estimateSize` with a fixed estimate (~220px) and enable `measureElement` for accurate remeasurement after render.

**Columns**: Compute from a `useBreakpoint` hook or a simple `useWindowSize` approach:

- `< 400px` → 2 cols
- `400–767px` → 3 cols
- `768–1023px` → 4 cols
- `≥ 1280px` → 6 cols

Each virtual row maps to one grid row of `colCount` items.

### 2. Infinite fetch trigger integrated with virtualizer

Instead of `InfiniteScrollTrigger` (IntersectionObserver sentinel), the virtualizer's `getVirtualItems()` is checked on each render: if the last virtual item index ≥ total items − `colCount * 3`, call `fetchNextPage`. This avoids a separate DOM sentinel and works well with virtualized lists where the sentinel may not be rendered.

### 3. Header combobox: custom input + Command popover (shadcn), selection-only navigation

**Chosen**: `<Command>` from shadcn/ui (Radix `cmdk`) in a `<Popover>`, with a controlled text input and a magnifying glass submit button.

**Alternatives considered**:

- Native `<select>`: no type-to-filter, poor UX
- `<Combobox>` from Radix directly: more boilerplate than `cmdk`

**Rationale**: cmdk (`CommandPrimitive`) is used directly rather than the shadcn `<Command>` wrapper, because the wrapper applies `overflow-hidden` which clips the absolutely-positioned dropdown. `CommandPrimitive.Input` inside `CommandPrimitive` gives full keyboard navigation (↑↓ to move, Enter to select) managed by cmdk internally. Two separate state values are maintained: `filterText` (what the user typed, drives dropdown filtering) and `selected` (the keyword actually chosen from the dropdown). Typing resets `selected` to null. Navigation uses `selected`, not `filterText`, so free-form text that doesn't match a dropdown item navigates to `/search` (all results).

The dropdown list is positioned absolutely below the input (`top-full`, `z-50`) and controlled via an `open` boolean. An `onBlur` with a 150ms delay closes the dropdown while still allowing click events on items to fire. Buttons use `onMouseDown preventDefault` to prevent blur from firing before the click.

**Visibility**: Use `usePathname()` in `app-header.client.tsx`; render `null` for the combobox when pathname starts with `/search`.

### 4. Homepage feed scope: latest scraper run via `sinceDate`

`getLastRun` fetches the last 2 `ScraperRun` records and returns `sinceDate = previousRun.completedAt`. The `infiniteResults` endpoint accepts an optional `updatedSince: Date` parameter and filters `ScraperResult.updatedAt >= updatedSince`.

This approach is needed because the `ScraperRun` record is created **after** all results are upserted, so `lastRun.createdAt` would always be later than the results it generated. Using the **previous** run's `completedAt` as the lower bound correctly captures all results from the latest run. If only one run exists, `sinceDate` is null and no filter is applied.

## Risks / Trade-offs

- **Row height estimation accuracy** → Mitigation: `measureElement` callback re-measures after first render; use a generous `overscan` (3–5 rows) to avoid blank flicker on fast scroll.
- **`useWindowVirtualizer` + `container` layout** → The virtualizer measures from the document top; ensure the container has no unexpected transforms. Test on mobile.
- **Keyword list size** → `getKeywords` is called without `pageSize` limit in the combobox; if keyword count grows large, add a `pageSize: 100` cap and show a "type to search more" hint.
- **`@tanstack/react-virtual` bundle size** → ~8 KB gzipped; acceptable for this use case.

## Migration Plan

1. Install `@tanstack/react-virtual` in `apps/web`
2. Rewrite `home-page.client.tsx` (no API changes needed)
3. Update `page.tsx` prefetch to `infiniteResults`
4. Add `keyword-search.tsx` component
5. Update `app-header.client.tsx` to include the combobox
6. Manual QA: homepage feed, virtual scroll, header combobox on desktop + mobile

API changes: `infiniteResults` gains optional `updatedSince: Date` param; `getLastRun` now returns `sinceDate` field. Both are backward-compatible. Rollback = revert component and router files.

## Open Questions

- Should the homepage show a "Last Updated" timestamp like the current design? (Assume yes, keep it.)
- Should deleted items be reflected immediately in the homepage feed? (Assume yes, via existing `useDeleteResult` + query invalidation.)
