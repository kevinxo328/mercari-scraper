## 1. Dependencies

- [ ] 1.1 Install `@tanstack/react-virtual` in `apps/web`

## 2. Homepage Feed

- [ ] 2.1 Update `apps/web/app/(public)/page.tsx` to prefetch `infiniteResults` instead of `getKeywords`+`getResults`
- [ ] 2.2 Rewrite `home-page.client.tsx`: replace grouped layout with `useInfiniteQuery(infiniteResults)` + `useWindowVirtualizer`
- [ ] 2.3 Implement responsive column count calculation (2/3/4/6 based on viewport width)
- [ ] 2.4 Implement virtual row rendering: chunk flat items into rows, render each row as a grid
- [ ] 2.5 Implement infinite scroll trigger: detect last virtual row approaching end, call `fetchNextPage`
- [ ] 2.6 Keep "Last Updated" timestamp display and authenticated delete functionality

## 3. Header Keyword Search

- [ ] 3.1 Create `apps/web/components/keyword-search.tsx` combobox component (input + Command popover + 🔍 button + × clear button)
- [ ] 3.2 Wire up `getKeywords` query in the combobox for dropdown options
- [ ] 3.3 Implement Enter key and magnifying glass button navigation to `/search?keywords=<value>`
- [ ] 3.4 Implement × clear button to reset input value
- [ ] 3.5 Update `app-header.client.tsx` to include `KeywordSearch` in the center slot, hidden when `usePathname()` starts with `/search`
- [ ] 3.6 Apply `max-w-[500px] w-full flex-1` layout to center the combobox between logo and avatar
