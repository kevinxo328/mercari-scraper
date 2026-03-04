## 1. Database Migration

- [x] 1.1 Remove `isPinned` field from `ScraperKeyword` in `packages/database/prisma/schema.prisma`
- [x] 1.2 Generate and apply Prisma migration using `pnpm db:migrate:dev` or `pnpm db:push`

## 2. Backend (tRPC) Cleanup

- [x] 2.1 Update `getKeywords` query in `apps/web/trpc/routers/scraper.ts` to remove `pinnedFirst` input and sorting logic
- [x] 2.2 Remove `togglePinKeyword` mutation from `apps/web/trpc/routers/scraper.ts`
- [x] 2.3 Remove `isPinned` from `createKeyword` and `updateKeyword` inputs in `apps/web/trpc/routers/scraper.ts`

## 3. UI and Type Updates

- [x] 3.1 Remove `isPinned` property from `ScraperKeyword` interface in `apps/web/types/scraper.ts`
- [x] 3.2 Update `keyword-table.tsx` to remove the "Pin" column and related mutation/event handler logic
- [x] 3.3 Update `add-keyword-dialog.tsx` to remove the "Pin to Homepage" checkbox and form fields
- [x] 3.4 Update mock data generation in `apps/web/mocks/setups/handlers.ts` to remove `isPinned`

## 4. Verification and Testing

- [x] 4.1 Update `add-keyword-dialog.test.tsx` to reflect the removed pinning field
- [x] 4.2 Run `pnpm lint` and `pnpm build` to verify no broken references
- [x] 4.3 Manually verify the Keyword Table sorting defaults to `updatedAt: desc`
