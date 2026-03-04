## 1. Dependencies

- [x] 1.1 Install `@tanstack/react-virtual` in `apps/web`

## 2. Homepage Feed

- [x] 2.1 Update `apps/web/app/(public)/page.tsx` to prefetch `infiniteResults` instead of `getKeywords`+`getResults`
- [x] 2.2 Rewrite `home-page.client.tsx`: replace grouped layout with `useInfiniteQuery(infiniteResults)` + `useWindowVirtualizer`
- [x] 2.3 Implement responsive column count calculation (2/3/4/6 based on viewport width)
- [x] 2.4 Implement virtual row rendering: chunk flat items into rows, render each row as a grid
- [x] 2.5 Implement infinite scroll trigger: detect last virtual row approaching end, call `fetchNextPage`
- [x] 2.6 Keep "Last Updated" timestamp display and authenticated delete functionality

## 3. Header Keyword Search

- [x] 3.1 Create `apps/web/components/keyword-search.tsx` combobox component (input + Command popover + 🔍 button + × clear button)
- [x] 3.2 Wire up `getKeywords` query in the combobox for dropdown options
- [x] 3.3 Implement Enter key and magnifying glass button navigation to `/search?keywords=<value>`
- [x] 3.4 Implement × clear button to reset input value
- [x] 3.5 Update `app-header.client.tsx` to include `KeywordSearch` in the center slot, hidden when `usePathname()` starts with `/search`
- [x] 3.6 Apply `max-w-[500px] w-full flex-1` layout to center the combobox between logo and avatar
