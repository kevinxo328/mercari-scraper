## 1. Static Category Asset Generation

- [x] 1.1 Implement `apps/scraper/scripts/generate-categories.ts` script to crawl Mercari's categories.
- [x] 1.2 Implement hierarchical and flat-map JSON structure in the script.
- [x] 1.3 Add English translation logic to the sync script.
- [x] 1.4 Generate `packages/database/src/data/mercari-categories.json`.

## 2. Shared Data Export

- [x] 2.1 Export the generated JSON and its types from `@repo/database`.
- [x] 2.2 Update `packages/database/package.json` to include the new data file in the build.

## 3. Database Migration

- [x] 3.1 Create a backup of existing `KeywordCategory` table and `ScraperKeyword` records.
- [x] 3.2 Add temporary `categoryCodes` field to `ScraperKeyword` in Prisma schema.
- [x] 3.3 Create a migration script to map existing UUIDs to Mercari codes for each keyword.
- [ ] 3.4 Execute data migration script to populate `categoryCodes`.
      > Run: `pnpm tsx apps/scraper/scripts/backup-categories.ts` then
      > apply migration `20260302000001_add_category_codes`, then
      > `pnpm tsx apps/scraper/scripts/migrate-category-ids.ts`
- [x] 3.5 Update Prisma schema: remove `KeywordCategory` and rename `categoryCodes` back to `categoryIds` (String[]).
      > Apply migration `20260302000002_finalize_category_migration` AFTER step 3.4.

## 4. Scraper Logic Update

- [x] 4.1 Update `getMercariUrl` in `apps/scraper/lib/utils.ts` to use codes directly.
- [x] 4.2 Update `apps/scraper/tests/scraper.spec.ts` to resolve category names from the static JSON instead of DB.
- [x] 4.3 Verify scraper URL generation with unit tests.

## 5. UI Integration

- [x] 5.1 Update category selector in `apps/web` to use the shared static JSON.
- [x] 5.2 Ensure category tree displays translated English names based on user preference.

## 6. Cleanup

- [x] 6.1 Remove unused Prisma client queries for categories.
- [x] 6.2 Delete temporary migration scripts.
