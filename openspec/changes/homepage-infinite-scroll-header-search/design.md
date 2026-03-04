## Context

The homepage currently fetches up to 5 keywords (pinned-first) and runs a separate `getResults` query per keyword via `useQueries`, rendering results in grouped sections. This is fine for a small number of keywords but doesn't surface the very latest items across all keywords in a single view.

The search page already has a working `useInfiniteQuery` + `InfiniteScrollTrigger` pattern and a sidebar filter. The goal is to bring a similar experience to the homepage — a single chronological feed — while adding virtual list rendering so the DOM stays lean as items accumulate.

The app header currently only shows login/avatar with no navigation shortcut for keyword filtering.

## Goals / Non-Goals

**Goals:**
- Single chronological feed on homepage (all keywords mixed, `updatedAt desc`)
- Virtual row rendering so only visible grid rows are in the DOM
- Infinite scroll that fetches the next page as user approaches bottom
- Keyword search combobox in header: type-to-filter, Enter/🔍 to navigate to `/search?keywords=<value>`, × to clear
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

### 3. Header combobox: custom input + Command popover (shadcn)

**Chosen**: `<Command>` from shadcn/ui (Radix `cmdk`) in a `<Popover>`, with a controlled text input and a magnifying glass submit button.

**Alternatives considered**:
- Native `<select>`: no type-to-filter, poor UX
- `<Combobox>` from Radix directly: more boilerplate than `cmdk`

**Rationale**: shadcn `<Command>` is already installed and provides filtering out of the box. Wrap in a `<Popover>` to control open/close state. The visible input is a plain `<input>` overlaid with the Command's search, so Enter and button click both work naturally.

**Visibility**: Use `usePathname()` in `app-header.client.tsx`; render `null` for the combobox when pathname starts with `/search`.

### 4. No keyword pre-selection on homepage

The homepage feed always shows all results (`keywords` param omitted from `infiniteResults`). Keyword filtering belongs to `/search`. This keeps the homepage simple.

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

No data migrations or API changes required. Rollback = revert the component files.

## Open Questions

- Should the homepage show a "Last Updated" timestamp like the current design? (Assume yes, keep it.)
- Should deleted items be reflected immediately in the homepage feed? (Assume yes, via existing `useDeleteResult` + query invalidation.)
