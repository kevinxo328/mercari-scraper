## 1. Database

- [x] 1.1 Add `pinned Boolean @default(false)` to `ScraperKeyword` in `packages/database/prisma/schema.prisma`
- [x] 1.2 Run `pnpm --filter @mercari-scraper/database db:migrate:dev` to create and apply the migration
- [x] 1.3 Run `pnpm generate` to regenerate the Prisma client

## 2. Types & tRPC Router

- [x] 2.1 Add `pinned: boolean` to the `ScraperKeyword` type in `apps/web-tanstack/src/types/scraper.ts`
- [x] 2.2 Update `getKeywords` query in `scraper.ts` to include `pinned` in the mapped response
- [x] 2.3 Add `pinKeyword` protected mutation to `scraper.ts` (toggle `pinned` by ID)
- [x] 2.4 Refactor `infiniteResults` in `scraper.ts` to use two-phase cursor strategy:
  - Parse cursor prefix (`pinned:` / `regular:`) to determine current phase
  - Phase 1: query `keywords.some.pinned = true`, encode next cursor as `pinned:<id>`
  - On phase 1 exhaustion within a page, fill remainder from phase 2 and switch cursor to `regular:<id>`
  - Phase 2: query `keywords.none.pinned = true`, encode next cursor as `regular:<id>`

## 3. Dashboard Keyword Table

- [x] 3.1 Add Pin column definition to `keyword-table.tsx` (second column, after Keyword), with `Star` icon from lucide-react (filled when pinned, outline when not)
- [x] 3.2 Add `pinKeyword` mutation call with optimistic update using `useQueryClient` and `setQueryData`
- [x] 3.3 Wire up the star button `onClick` to call the mutation and handle rollback on error

## 4. Keyword Dropdowns (Header & Search)

- [x] 4.1 Update `keyword-search.tsx`: sort fetched keywords (pinned first alphabetically, then non-pinned alphabetically) and show filled `Star` icon (`size-3`) next to pinned keyword items in the dropdown
- [x] 4.2 Update the keyword options passed to `ScraperSearchForm` in `search.tsx`: apply the same pinned-first alphabetical sort before passing to the `keywordOptions` prop
- [x] 4.3 Update `ScraperSearchForm` to render a filled `Star` icon next to pinned keyword options in its multi-select UI
